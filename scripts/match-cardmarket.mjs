#!/usr/bin/env node
// Import Cardmarket catalogue and price-guide JSON files downloaded from Cardmarket.
// Usage: node scripts/match-cardmarket.mjs catalog.json prices.json
// This tool produces candidate matches for manual review; it never silently assigns a price.
import { readFileSync, writeFileSync } from 'node:fs';
const [catalogPath, pricesPath] = process.argv.slice(2);
if (!catalogPath || !pricesPath) {
  console.error('Uso: node scripts/match-cardmarket.mjs catalog.json prices.json');
  process.exit(1);
}
const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
const guide = JSON.parse(readFileSync(pricesPath, 'utf8'));
if (!Array.isArray(catalog.products) || !Array.isArray(guide.priceGuides)) {
  throw new Error('Formato non riconosciuto: attesi products[] e priceGuides[].');
}
const normalize = v => String(v ?? '').normalize('NFKC').trim().toLowerCase().replace(/\s+/g, ' ');
const prices = new Map(guide.priceGuides.map(p => [String(p.idProduct), p]));
const source = catalog.products.filter(p => /yu.?gi.?oh/i.test(String(p.categoryName ?? p.category ?? '')));
const cards = source.length ? source : catalog.products; // if export is Yu-Gi-Oh-only
const byName = new Map();
for (const p of cards) {
  const name = normalize(p.name);
  if (!name || !p.idProduct) continue;
  if (!byName.has(name)) byName.set(name, []);
  byName.get(name).push(p);
}
const queries = JSON.parse(readFileSync(new URL('../data/cardmarket-targets.json', import.meta.url), 'utf8'));
const output = queries.map(q => {
  const matches = (byName.get(normalize(q.name)) ?? []).filter(p =>
    normalize(p.expansionName) === normalize(q.expansion));
  return { ...q, status: matches.length === 1 ? 'candidate-review' : matches.length ? 'ambiguous' : 'not-found',
    candidates: matches.map(p => ({
      idProduct: p.idProduct, name: p.name, expansionName: p.expansionName,
      number: p.number ?? null, rarity: p.rarity ?? null,
      // Prices belong to a Cardmarket product ID, not necessarily a YGOPRODeck print code.
      avg: prices.get(String(p.idProduct))?.avg ?? null,
      low: prices.get(String(p.idProduct))?.low ?? null,
      trend: prices.get(String(p.idProduct))?.trend ?? null
    }))
  };
});
writeFileSync('cardmarket-review.json', JSON.stringify({
  generatedAt: new Date().toISOString(), catalogueDate: catalog.createdAt ?? null,
  priceGuideDate: guide.createdAt ?? null, warning: 'Candidates only; verify printing before publishing.',
  results: output
}, null, 2));
console.log('Creato cardmarket-review.json: controlla le corrispondenze prima di pubblicare prezzi.');
