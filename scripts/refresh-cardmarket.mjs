#!/usr/bin/env node
// DuelPrice 0.8 — Refresh ONLY independently verified Cardmarket product IDs.
// Usage: node scripts/refresh-cardmarket.mjs products_singles.json price_guide.json [--write]
import { readFileSync, writeFileSync } from 'node:fs';
const [catalogPath, guidePath, flag] = process.argv.slice(2);
if (!catalogPath || !guidePath || (flag && flag !== '--write')) {
  console.error('Uso: node scripts/refresh-cardmarket.mjs products_singles.json price_guide.json [--write]');
  process.exit(1);
}
const mappingPath = new URL('../data/cardmarket-verified-mappings.json', import.meta.url);
const mappings = JSON.parse(readFileSync(mappingPath, 'utf8'));
const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
const guide = JSON.parse(readFileSync(guidePath, 'utf8'));
if (!Array.isArray(catalog.products) || !Array.isArray(guide.priceGuides) || !guide.createdAt) throw Error('JSON Cardmarket non valido');
const productById = new Map(catalog.products.map(p => [Number(p.idProduct), p]));
const priceById = new Map(guide.priceGuides.map(p => [Number(p.idProduct), p]));
const round = x => typeof x === 'number' && Number.isFinite(x) ? x : null;
const updated = [];
for (const m of mappings.verifiedMappings) {
  const product = productById.get(Number(m.cardmarketProductId));
  const price = priceById.get(Number(m.cardmarketProductId));
  if (!product || !price) throw Error('Prodotto verificato non presente nel listino: ' + m.cardmarketProductId);
  if (product.name.trim().toLowerCase() !== m.cardName.trim().toLowerCase() ||
      Number(product.idExpansion) !== Number(m.cardmarketExpansionId)) {
    throw Error('Identità Cardmarket non coerente: ' + m.cardmarketProductId);
  }
  updated.push({...m,priceGuideDate:guide.createdAt,prices:{
    low:round(price.low),trend:round(price.trend),avg7:round(price.avg7),avg30:round(price.avg30)
  }});
}
const result = {...mappings,source:'Cardmarket official product catalogue and price guide; snapshot '+guide.createdAt,verifiedMappings:updated};
console.log('Listino:',guide.createdAt,'| stampe verificate:',updated.length);
for (const m of updated) console.log(m.ygoprodeckCode,m.cardmarketProductId,'trend',m.prices.trend);
if (flag === '--write') {
  writeFileSync(mappingPath,JSON.stringify(result,null,2)+'\n');
  console.log('Aggiornato data/cardmarket-verified-mappings.json');
} else console.log('Anteprima: aggiungi --write per salvare dopo la verifica.');
