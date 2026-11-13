# DuelPrice — PWA demo

Prima versione web installabile di DuelPrice, realizzata con React e Vite.

## Avvio locale
```bash
npm install
npm run dev
```

## Build di produzione
```bash
npm run build
npm run preview
```

## Funzioni
- Ricerca di carte Yu-Gi-Oh! per nome, nome italiano, set, codice e rarità.
- Schede con dettagli e prezzi **dimostrativi**, non aggiornati in tempo reale.
- Preferiti salvati nel browser (localStorage).
- Manifest per aggiungere l'app alla schermata Home di iPhone e Android.

## Pubblicazione
Distribuire la cartella `dist/` su un hosting statico HTTPS (es. Vercel o Netlify).
La PWA è installabile dalla schermata Home tramite Safari/Chrome. Non è ancora dotata di service worker offline.

## Nota
Non sono integrate API o quotazioni reali di marketplace.
