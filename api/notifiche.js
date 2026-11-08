// WonderNutrition – notifiche push (Vercel). Va salvato nel repository come: api/notifiche.js
// Variabili su Vercel: GH_TOKEN, REPO, ARCHIVE_PASS, VAPID_PUBLIC, VAPID_PRIVATE, CRON_SECRET
const webpush = require("web-push");
const { webcrypto, timingSafeEqual } = require("crypto");
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
const SUBS = "iscrizioni.json";
async function loadSubs() {
  try {
    const f = await getFile(SUBS);
    const o = await decJ(JSON.parse(dec.decode(f.buf)), process.env.ARCHIVE_PASS);
    return { sha: f.sha, list: (o && o.list) || [] };
  } catch (e) { if (/ 404$/.test(e.message)) return { sha: undefined, list: [] }; throw e; }
}
const saveSubs = async (list, sha) => putFile(SUBS, enc.encode(JSON.stringify(await encJ({ list }, process.env.ARCHIVE_PASS))), sha, "Iscrizioni notifiche");
const same = (a, b) => { const x = Buffer.from(String(a)), y = Buffer.from(String(b)); return x.length === y.length && timingSafeEqual(x, y); };
function setup() {
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || "https://" + (process.env.VERCEL_PROJECT_PRODUCTION_URL || "wondernutrition.vercel.app"), process.env.VAPID_PUBLIC, process.env.VAPID_PRIVATE);
}
async function send({ tipo, ids, testo }) {
  setup();
  const { list } = await loadSubs();
  const targets = list.filter(s => tipo === "piano" ? (ids || []).includes(s.pid) : true);
  const msg = tipo === "avviso" ? { title: "WonderNutrition · nuovo avviso", body: String(testo || "Ci sono novità dallo studio.").slice(0, 140) }
    : tipo === "piano" ? { title: "Il tuo piano è aggiornato", body: "La dottoressa ha caricato novità per te." }
    : { title: "Nuova sfida del mese", body: "Wondy ha preparato una nuova sfida: vieni a scoprirla!" };
  const dead = new Set(); let sent = 0;
  await Promise.all(targets.map(async s => {
    try { await webpush.sendNotification(s.sub, JSON.stringify({ ...msg, url: "./" }), { TTL: 86400 }); sent++; }
    catch (e) { if (e.statusCode === 404 || e.statusCode === 410) dead.add(s.sub.endpoint); }
  }));
  if (dead.size) { const f = await loadSubs(); await saveSubs(f.list.filter(s => !dead.has(s.sub.endpoint)), f.sha); }
  return { sent, rimossi: dead.size };
}
module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  const out = (s, o) => res.status(s).json(o);
  try {
    if (req.method === "GET") {
      if (!process.env.CRON_SECRET || req.headers.authorization !== "Bearer " + process.env.CRON_SECRET) return out(401, { error: "Non autorizzato." });
      return out(200, await send({ tipo: "sfida" }));
    }
    if (req.method !== "POST") return out(405, { error: "Metodo non consentito." });
    const b = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    if (b.azione === "iscrivi") {
      const sub = b.sub, code = String(b.code || "").trim().toUpperCase();
      if (!sub || !/^https:\/\//.test(sub.endpoint || "") || !sub.keys || !sub.keys.p256dh || !sub.keys.auth) return out(400, { error: "Iscrizione non valida." });
      const af = await getFile("archivio.json");
      const arc = await decJ(JSON.parse(dec.decode(af.buf)), process.env.ARCHIVE_PASS);
      if (!arc) return out(500, { error: "Servizio non configurato correttamente." });
      const P = arc.D.patients.find(x => x.code === code);
      if (!P) return out(403, { error: "Codice non valido." });
      if (!P.id) return out(409, { error: "La dottoressa deve prima premere Pubblica adesso nell'area studio." });
      for (let t = 0; t < 2; t++) {
        const f = await loadSubs();
        const list = f.list.filter(s => s.sub.endpoint !== sub.endpoint);
        list.push({ pid: P.id, sub: { endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } }, t: Date.now() });
        try { await saveSubs(list, f.sha); return out(200, { ok: true }); } catch (e) { if (t) throw e; }
      }
    }
    if (b.azione === "invia") {
      if (!process.env.ARCHIVE_PASS || !same(b.pass || "", process.env.ARCHIVE_PASS)) return out(401, { error: "Non autorizzato." });
      const d = Math.min(Math.max(+b.delay || 0, 0), 45);
      if (d) await new Promise(r => setTimeout(r, d * 1000));
      return out(200, await send({ tipo: b.tipo, ids: b.ids, testo: b.testo }));
    }
    return out(400, { error: "Richiesta non valida." });
  } catch (e) { return out(500, { error: "Errore temporaneo, riprova tra poco." }); }
};
