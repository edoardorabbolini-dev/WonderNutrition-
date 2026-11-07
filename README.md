# WonderNutrition – app pazienti

File: `index.html` (app pazienti), `admin.html` (area studio), `style.css`, `crypto.js`, `wondy.js` (la mascotte), `data.json` (dati pubblicati).

## Pubblicare su GitHub Pages
1. Crea un repository su GitHub e carica tutti i file nella radice.
2. Settings → Pages → Source: "Deploy from a branch" → branch `main`, cartella `/ (root)`.
3. L'app sarà su `https://TUOUSERNAME.github.io/NOMEREPO/` – condividi quel link ai pazienti.

## Uso quotidiano
1. Apri `admin.html` (dal tuo computer o dal sito): aggiungi pazienti, piani, sfida del mese, avvisi.
2. Ogni paziente riceve un codice di 8 caratteri: daglielo di persona o in privato.
3. Premi "Scarica data.json" e caricalo su GitHub sostituendo quello esistente.
4. Conserva il "backup privato" (contiene codici e piani in chiaro): non caricarlo su GitHub.

## Privacy
I piani sono cifrati (AES-256) con il codice del paziente: nel repository pubblico non sono leggibili senza codice.
Non usare nomi o dati sanitari nel titolo della sfida o negli avvisi: questi sono pubblici.
I progressi delle sfide restano sul telefono del paziente.
