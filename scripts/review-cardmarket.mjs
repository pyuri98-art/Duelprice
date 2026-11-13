#!/usr/bin/env node
// Generate a standalone, local review page from the Cardmarket candidate report.
// Usage: node scripts/review-cardmarket.mjs imports/cardmarket-review.json "Stardust Dragon"
import {readFileSync,writeFileSync} from 'node:fs';
const [reportPath, searchName, outputPath='imports/cardmarket-review.html']=process.argv.slice(2);
if(!reportPath || !searchName) {console.error('Uso: node scripts/review-cardmarket.mjs imports/cardmarket-review.json "Stardust Dragon" [output.html]');process.exit(1)}
const report=JSON.parse(readFileSync(reportPath,'utf8'));
const matches=report.groups.filter(g=>g.name.toLowerCase().includes(searchName.trim().toLowerCase())).slice(0,25);
if(!matches.length){console.error('Nessuna carta trovata:',searchName);process.exit(1)}
const verified=JSON.parse(readFileSync(new URL('../data/cardmarket-verified-mappings.json',import.meta.url),'utf8')).verifiedMappings;
const escapeHtml=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=v=>typeof v==='number'?v.toLocaleString('it-IT',{minimumFractionDigits:2,maximumFractionDigits:2})+' €':'—';
const sections=matches.map(g=>{
 const rows=g.candidates.map(p=>{
 const confirmed=verified.find(v=>Number(v.cardmarketProductId)===Number(p.idProduct)&&v.cardName.toLowerCase()===g.name.toLowerCase());
 return '<tr><td>'+escapeHtml(p.idProduct)+'</td><td>'+escapeHtml(p.idExpansion)+'</td><td>'+escapeHtml(p.idMetacard)+'</td><td>'+fmt(p.low)+'</td><td>'+fmt(p.trend)+'</td><td>'+fmt(p.avg7)+'</td><td>'+fmt(p.avg30)+'</td><td>'+(confirmed?'✓ '+escapeHtml(confirmed.ygoprodeckCode):'Da verificare')+'</td></tr>';
 }).join('');
 return '<section><h2>'+escapeHtml(g.name)+'</h2><p>'+g.totalProducts+' prodotti · '+g.expansionCount+' ID espansione · Le corrispondenze NON sono automatiche</p><div class="scroll"><table><thead><tr><th>ID prodotto</th><th>ID espansione</th><th>ID metacard</th><th>Minimo</th><th>Trend</th><th>Media 7g</th><th>Media 30g</th><th>Stato</th></tr></thead><tbody>'+rows+'</tbody></table></div></section>';
}).join('');
const html='<!doctype html><html lang="it"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DuelPrice · Revisione Cardmarket</title><style>body{font:15px system-ui;background:#101827;color:#f2f4f8;margin:0;padding:24px}main{max-width:1200px;margin:auto}h1{color:#f2c76e}section{background:#1b283b;border:1px solid #39495d;border-radius:14px;padding:18px;margin:18px 0}.scroll{overflow-x:auto}table{width:100%;border-collapse:collapse;white-space:nowrap}th,td{text-align:left;padding:10px;border-bottom:1px solid #38485c}th{color:#f2c76e}p,small{color:#b8c4d6}input{padding:12px;width:min(100%,420px);box-sizing:border-box;background:#0c1321;border:1px solid #71829b;border-radius:8px;color:white}tr[hidden]{display:none}</style><main><h1>⚡ DuelPrice · Revisione Cardmarket</h1><p>Report locale, non pubblicare. Listino: '+escapeHtml(report.priceGuideDate??'data non indicata')+'. I prezzi non sono offerte live. ID espansione ≠ codice stampa: verificare set, codice e rarità su Cardmarket prima di pubblicare.</p><label>Filtra righe per ID o stato <input id="filter" placeholder="es. 244199"></label><p id="count"></p>'+sections+'<small>Questa pagina è di sola lettura. Non conferma né pubblica mappature.</small></main><script>const input=document.getElementById("filter");function update(){let n=0;document.querySelectorAll("tbody tr").forEach(tr=>{tr.hidden=!tr.textContent.toLowerCase().includes(input.value.toLowerCase());if(!tr.hidden)n++});document.getElementById("count").textContent=n+" prodotti visibili"}input.addEventListener("input",update);update()</script></html>';
writeFileSync(outputPath,html);
console.log('Pagina creata:',outputPath,'| carte:',matches.length,'| candidati:',matches.reduce((n,g)=>n+g.candidates.length,0));
