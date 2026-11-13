# DuelPrice 0.8 — Importazione Cardmarket sicura

Questa versione **non inventa corrispondenze** tra codici YGOPRODeck e ID Cardmarket. Il catalogo singles Cardmarket contiene `idProduct`, `idExpansion`, `idMetacard` e nome, ma **non** il codice stampa YGOPRODeck o la rarità. Pertanto una corrispondenza per nome, anche se unica, non è sufficiente per pubblicare il prezzo di una stampa.

## Preparare i file (solo in Codespaces, non committare i dump)

Caricare in Codespaces i due JSON ufficiali scaricati da Cardmarket, per esempio nella cartella `imports/`. Non inserirli in un commit pubblico senza verificare le condizioni di licenza.

## Creare la coda di revisione

```bash
node scripts/build-cardmarket-review.mjs imports/products_singles_3.json imports/price_guide_3.json imports/cardmarket-review.json
```

Il report contiene possibili prodotti per nome e ID espansione, **non corrispondenze confermate**. Per pubblicare una nuova stampa, verificare su Cardmarket nome, espansione, rarità e numero, quindi aggiungere manualmente la mappatura verificata in `data/cardmarket-verified-mappings.json` con `ygoprodeckCode`, `cardName`, `cardmarketProductId`, `cardmarketExpansionId`, `cardmarketUrl` ed evidenza.

## Aggiornare i prezzi delle stampe già verificate

Anteprima senza modifiche:

```bash
node scripts/refresh-cardmarket.mjs imports/products_singles_3.json imports/price_guide_3.json
```

Dopo aver controllato l'anteprima:

```bash
node scripts/refresh-cardmarket.mjs imports/products_singles_3.json imports/price_guide_3.json --write
npm run build
```

Lo script controlla che `idProduct`, nome e `idExpansion` corrispondano alla mappatura verificata prima di aggiornare `low`, `trend`, `avg7` e `avg30`. Se trova incongruenze, si ferma senza scrivere. Il listino è una fotografia datata, **non** mostra offerte live e non applica filtri lingua/condizione.

## Stato

- Scheda verificata: Stardust Dragon `CT05-EN001`, Cardmarket `244199`.
- Nuove stampe: coda candidati pronta per revisione, **non pubblicate automaticamente**.
- L'app evidenzia e ordina prima le stampe già verificate.
- Non è stato configurato un aggiornamento automatico in background: occorre un nuovo listino ufficiale e un'esecuzione esplicita dello script.
