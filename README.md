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

## PDF e sfide automatiche
- Nell'area studio puoi caricare il piano in PDF per ogni paziente: viene cifrato con il suo codice. Dopo "Scarica pacchetto (.zip)" decomprimi e carica su GitHub `data.json` e la cartella `p/`.
- Ogni mese l'app propone da sola una sfida (vedi `challenges.js`, modificabile). Dall'area studio puoi sostituirla solo per quel mese.

## Pubblicazione automatica e archivio
In `admin.html`, sezione "Collegamento a GitHub": inserisci repository, token (permesso Contents: Read and write su quel solo repository) e una frase segreta. Da quel momento ogni modifica ai pazienti, ai PDF, alla sfida e agli avvisi viene pubblicata da sola (`data.json`, cartella `p/`) e archiviata in `archivio.json`, cifrato con la frase segreta. Con "Ripristina l'archivio" recuperi tutto su un nuovo dispositivo.

## Icona
Cartella `icons/` e `manifest.webmanifest`: icona dell'app (logo dello studio) per schermata Home, scheda del browser e installazione.
