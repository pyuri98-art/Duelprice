# DuelPrice 0.9 — Revisione visiva delle stampe

## Generare la pagina di revisione

Dopo aver caricato i file Cardmarket nella cartella locale `imports/` e generato `imports/cardmarket-review.json`, eseguire:

```bash
git pull --rebase origin main
node scripts/review-cardmarket.mjs imports/cardmarket-review.json "Stardust Dragon"
```

Il programma crea `imports/cardmarket-review.html`, che si può aprire con l'anteprima HTML di Codespaces o scaricare e aprire nel browser. Per una carta diversa, sostituire il nome tra virgolette.

La pagina permette di filtrare i prodotti per ID e visualizza prezzo minimo, trend, medie a 7/30 giorni e stato della verifica. Non effettua scritture nel file delle mappature.

**Limite importante:** il catalogo Cardmarket non fornisce direttamente il codice stampa YGOPRODeck. L'ID espansione non equivale al codice set. Ogni nuova corrispondenza richiede una verifica indipendente prima di essere aggiunta a `data/cardmarket-verified-mappings.json`.

Non pubblicare i file sotto `imports/`; sono ignorati da Git.
