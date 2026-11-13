# Integrazione Cardmarket — preparazione 0.6

Cardmarket pubblica catalogo prodotti e guida prezzi scaricabili dal proprio sito.
Fonti ufficiali:
- https://news.cardmarket.com/it/YuGiOh/were-making-the-price-guide-and-product-catalogue-available-for-download
- https://www.cardmarket.com/en/YuGiOh/Data/Price-Guide
- https://www.cardmarket.com/en/YuGiOh/Data/Product-List

## Utilizzo
1. Scarica i due JSON di **Yu-Gi-Oh!** dal sito Cardmarket, senza inserirli nel repository.
2. Verifica che contengano rispettivamente `products[]` e `priceGuides[]`.
3. Esegui `node scripts/match-cardmarket.mjs catalog.json prices.json`.
4. Esamina `cardmarket-review.json`: le corrispondenze sono **candidate**, non pubblicate nell'app.
5. Verifica manualmente idProduct, nome, espansione, numero, rarità e codice della stampa. Il nome di una carta non identifica una stampa univoca.

Il file di output non deve essere presentato come prezzi live né usato automaticamente per popolare DuelPrice. La guida prezzi è aggiornata quotidianamente, non per lingua/condizione/venditore. Il codice YGOPRODeck non è necessariamente uguale all'identificativo Cardmarket. L'eventuale uso pubblico richiede una verifica delle condizioni applicabili ai dati.

La versione 0.5 continua a mostrare solo quotazioni aggregate indicative di YGOPRODeck. Il prossimo passo è validare lo schema dei file reali e l'associazione dei prodotti prima di integrare prezzi per stampa.
