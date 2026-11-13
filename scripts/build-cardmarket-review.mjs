#!/usr/bin/env node
// DuelPrice 0.7: generate a review queue, never auto-publish ambiguous print mappings.
// Usage: node scripts/build-cardmarket-review.mjs products_singles_3.json price_guide_3.json [output.json]
import { readFileSync, writeFileSync } from 'node:fs';
const [catalogPath, guidePath, outputPath = 'cardmarket-review.json'] = process.argv.slice(2);
if (!catalogPath || !guidePath) {
  console.error('Uso: node scripts/build-cardmarket-review.mjs products_singles_3.json price_guide_3.json [output.json]');
  process.exit(1);
}
const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
const guide = JSON.parse(readFileSync(guidePath, 'utf8'));
if (!Array.isArray(catalog.products) || !Array.isArray(guide.priceGuides)) throw Error('Formato Cardmarket non riconosciuto');
const normalize = x => String(x ?? '').normalize('NFKC').trim().toLowerCase().replace(/\s+/g, ' ');
const priceById = new Map(guide.priceGuides.map(p => [Number(p.idProduct), p]));
const byName = new Map();
for (const p of catalog.products) {
  if (p.idCategory !== 5 && !/yugioh single/i.test(p.categoryName ?? '')) continue;
  const key = normalize(p.name);
  if (!byName.has(key)) byName.set(key, []);
  byName.get(key).push(p);
}
const verified = JSON.parse(readFileSync(new URL('../data/cardmarket-verified-mappings.json', import.meta.url), 'utf8')).verifiedMappings;
const verifiedIds = new Set(verified.map(x => Number(x.cardmarketProductId)));
const groups = [...byName.entries()].map(([name, products]) => ({
  name: products[0].name,
  totalProducts: products.length,
  expansionCount: new Set(products.map(p => p.idExpansion)).size,
  status: 'requires-print-verification',
  candidates: products.map(p => {
    const price = priceById.get(Number(p.idProduct));
    return {idProduct:p.idProduct,idExpansion:p.idExpansion,idMetacard:p.idMetacard,
      low:price?.low ?? null,trend:price?.trend ?? null,avg7:price?.avg7 ?? null,avg30:price?.avg30 ?? null,
      alreadyVerified:verifiedIds.has(Number(p.idProduct))};
  })
}));
const result = {catalogueDate:catalog.createdAt,priceGuideDate:guide.createdAt,
  note:'These are candidate products, NOT verified YGOPRODeck print matches. idExpansion is not a set code; never publish candidates as confirmed.',
  stats:{catalogueProducts:catalog.products.length,pricedProducts:catalog.products.filter(p=>priceById.has(Number(p.idProduct))).length,cardNames:groups.length,verifiedMappings:verified.length},
  groups};
writeFileSync(outputPath,JSON.stringify(result,null,2));
console.log(JSON.stringify(result.stats,null,2));
console.log('Coda di revisione creata:',outputPath);
