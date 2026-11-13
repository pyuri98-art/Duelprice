# Verifica Cardmarket: Stardust Dragon CT05-EN001

Dati esaminati: esportazioni ufficiali `products_singles_3.json` (2026-11-12) e `price_guide_3.json` (2026-11-13), fornite dall'utente.

- Il catalogo contiene **51** record il cui nome è esattamente `Stardust Dragon`.
- I 51 record appartengono a **31** distinti `idExpansion`.
- Tutti i 51 `idProduct` hanno una riga corrispondente nel listino prezzi.
- Il catalogo contiene `idProduct`, `name`, `idExpansion`, `idMetacard` e date; **non** contiene `CT05-EN001`, rarità o nome dell'espansione.
- Più prodotti possono condividere `idExpansion`, quindi non è corretto assegnare prezzi usando soltanto `idExpansion`.

**Stato:** collegamento prodotto/prezzo verificato; identificazione esatta di `CT05-EN001` **non verificata**. Non pubblicare una quotazione specifica prima di associare il codice stampa a un `idProduct` Cardmarket con evidenza indipendente.

## Prossima verifica

Trovare il prodotto Cardmarket corrispondente a `CT05-EN001` attraverso la pagina di dettaglio o una fonte ufficiale che mostri il codice della stampa, e registrare il suo `idProduct` in una tabella di mapping verificata. In seguito usare quel mapping per visualizzare `low`, `avg` e `trend` del listino, con data e avvertenza che non si tratta di offerte live.

Non caricare in GitHub i dump integrali Cardmarket senza aver verificato le condizioni di riutilizzo e redistribuzione.
