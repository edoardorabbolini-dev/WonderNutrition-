// WonderNutrition – servizio per il cambio automatico del codice paziente (Vercel).
// Va salvato nel repository come: api/cambio-codice.js
// Variabili da impostare su Vercel: GH_TOKEN, REPO (utente/repo), ARCHIVE_PASS (frase segreta dell'archivio)
const { webcrypto } = require("crypto");
const subtle = webcrypto.subtle;
const enc = new TextEncoder(), dec = new TextDecoder();
const ub = s => new Uint8Array(Buffer.from(s, "base64"));
const b6 = u => Buffer.from(u).toString("base64");
async function key(code, salt) {
  const k = await subtle.importKey("raw", enc.encode(code), "PBKDF2", false, ["deriveKey"]);
  return subtle.deriveKey({ name: "PBKDF2", salt, iterations: 150000, hash: "SHA-256" }, k, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}
async function decJ(e, code) { try { return JSON.parse(dec.decode(await subtle.decrypt({ name: "AES-GCM", iv: ub(e.i) }, await key(code, ub(e.s)), ub(e.c)))); } catch (x) { return null; } }
async function encJ(o, code) {
  const s = webcrypto.getRandomValues(new Uint8Array(16)), i = webcrypto.getRandomValues(new Uint8Array(12));
  const c = await subtle.encrypt({ name: "AES-GCM", iv: i }, await key(code, s), enc.encode(JSON.stringify(o)));
  return { s: b6(s), i: b6(i), c: b6(new Uint8Array(c)) };
}
async function decB(b, code) { b = new Uint8Array(b); return new Uint8Array(await subtle.decrypt({ name: "AES-GCM", iv: b.slice(16, 28) }, await key(code, b.slice(0, 16)), b.slice(28))); }
async function encB(d, code) {
  const s = webcrypto.getRandomValues(new Uint8Array(16)), i = webcrypto.getRandomValues(new Uint8Array(12));
  const c = new Uint8Array(await subtle.encrypt({ name: "AES-GCM", iv: i }, await key(code, s), d));
  const o = new Uint8Array(28 + c.length); o.set(s); o.set(i, 16); o.set(c, 28); return o;
}
const gh = (m, p, body, raw) => fetch(`https://api.github.com/repos/${process.env.REPO}/contents/${p}`, {
  method: m,
  headers: { Authorization: "Bearer " + process.env.GH_TOKEN, Accept: raw ? "application/vnd.github.raw+json" : "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "wondernutrition", "Content-Type": "application/json" },
  body: body ? JSON.stringify(body) : undefined
});
async function getFile(p) {
  const m = await gh("GET", p); if (!m.ok) throw new Error("lettura " + p + " " + m.status);
  const sha = (await m.json()).sha, r = await gh("GET", p, null, true);
  return { sha, buf: new Uint8Array(await r.arrayBuffer()) };
}
async function putFile(p, bytes, sha, msg) {
  const r = await gh("PUT", p, { message: msg, content: b6(bytes), sha }); if (!r.ok) throw new Error("scrittura " + p + " " + r.status);
}
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Metodo non consentito." });
  const out = (s, o) => res.status(s).json(o);
  try {
    const b = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const oldC = String(b.old || "").trim().toUpperCase(), newC = String(b.new || "").trim().toUpperCase();
    if (newC.length < 8 || !/[A-Z]/.test(newC) || !/[0-9]/.test(newC)) return out(400, { error: "Il nuovo codice deve avere almeno 8 caratteri, con lettere e numeri." });
    if (newC === oldC) return out(400, { error: "Il nuovo codice è uguale a quello attuale." });
    const af = await getFile("archivio.json");
    const arc = await decJ(JSON.parse(dec.decode(af.buf)), process.env.ARCHIVE_PASS);
    if (!arc) return out(500, { error: "Servizio non configurato correttamente (archivio)." });
    const idx = arc.D.patients.findIndex(x => x.code === oldC);
    if (idx < 0) return out(403, { error: "Codice attuale non valido, oppure la dottoressa deve ancora pubblicare gli ultimi aggiornamenti." });
    if (arc.D.patients.some(x => x.code === newC)) return out(409, { error: "Questo codice non è disponibile: scegline un altro." });
    const df = await getFile("data.json"), data = JSON.parse(dec.decode(df.buf));
    const pl = data.plans[idx] && await decJ(data.plans[idx], oldC);
    if (!pl) return out(403, { error: "Codice attuale non valido." });
    const P = arc.D.patients[idx];
    if (pl.pdf) { const pf = await getFile(pl.pdf); await putFile(pl.pdf, await encB(await decB(pf.buf, oldC), newC), pf.sha, "Cambio codice paziente"); }
    P.code = newC; P.sc = newC;
    if (arc.pdfs && arc.pdfs[oldC]) { arc.pdfs[newC] = arc.pdfs[oldC]; delete arc.pdfs[oldC]; }
    arc.D.rev = (arc.D.rev || 0) + 1;
    data.plans[idx] = await encJ(pl, newC);
    await putFile("data.json", enc.encode(JSON.stringify(data)), df.sha, "Cambio codice paziente");
    await putFile("archivio.json", enc.encode(JSON.stringify(await encJ(arc, process.env.ARCHIVE_PASS))), af.sha, "Archivio aggiornato");
    return out(200, { ok: true });
  } catch (e) { return out(500, { error: "Errore temporaneo, riprova tra poco." }); }
};

