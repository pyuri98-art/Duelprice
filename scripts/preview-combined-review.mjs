#!/usr/bin/env node
// Local, manual Cardmarket print verification. Never auto-publishes mappings.
import {readFileSync,writeFileSync} from 'node:fs';
const [reportPath,searchName,outputPath='imports/cardmarket-combined-preview.html']=process.argv.slice(2);
if(!reportPath||!searchName){console.error('Uso: node scripts/review-cardmarket.mjs imports/cardmarket-review.json "Stardust Dragon" [output.html]');process.exit(1)}
const report=JSON.parse(readFileSync(reportPath,'utf8'));
const groups=report.groups.filter(g=>g.name.toLowerCase().includes(searchName.trim().toLowerCase())).slice(0,25);
if(!groups.length)throw Error('Nessuna carta trovata: '+searchName);
const verified=JSON.parse(readFileSync(new URL('../data/cardmarket-verified-mappings.json',import.meta.url),'utf8')).verifiedMappings;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=v=>typeof v==='number'?v.toLocaleString('it-IT',{minimumFractionDigits:2,maximumFractionDigits:2})+' €':'—';
const rows=groups.map(g=>'<section><h2>'+esc(g.name)+'</h2><p>'+g.totalProducts+' prodotti · '+g.expansionCount+' ID espansione</p><div class="scroll"><table><thead><tr><th>Seleziona</th><th>ID prodotto</th><th>ID espansione</th><th>ID metacard</th><th>Minimo</th><th>Trend</th><th>Media 7g</th><th>Media 30g</th><th>Stato</th></tr></thead><tbody>'+g.candidates.map(p=>{
 const match=verified.find(v=>Number(v.cardmarketProductId)===Number(p.idProduct)&&v.cardName.toLowerCase()===g.name.toLowerCase());
 return '<tr data-name="'+esc(g.name)+'" data-product="'+esc(p.idProduct)+'" data-expansion="'+esc(p.idExpansion)+'" data-verified="'+Boolean(match)+'"><td><button class="choose" type="button">Seleziona</button></td><td>'+esc(p.idProduct)+'</td><td>'+esc(p.idExpansion)+'</td><td>'+esc(p.idMetacard)+'</td><td>'+money(p.low)+'</td><td>'+money(p.trend)+'</td><td>'+money(p.avg7)+'</td><td>'+money(p.avg30)+'</td><td>'+(match?'✓ '+esc(match.ygoprodeckCode):'Da verificare')+'</td></tr>';
 }).join('')+'</tbody></table></div></section>').join('');
const html=`<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DuelPrice · Verifica Cardmarket</title><style>
*{box-sizing:border-box}body{font:15px system-ui;background:#101827;color:#f2f4f8;margin:0;padding:22px}main{max-width:1250px;margin:auto}h1,h3,th{color:#f2c76e}section,.panel{background:#1b283b;border:1px solid #39495d;border-radius:14px;padding:18px;margin:18px 0}.scroll{overflow-x:auto}table{width:100%;border-collapse:collapse;white-space:nowrap}th,td{text-align:left;padding:10px;border-bottom:1px solid #38485c}p,small,.hint{color:#b8c4d6}input,textarea{padding:11px;width:100%;background:#0c1321;border:1px solid #71829b;border-radius:8px;color:white}label{display:block;margin:12px 0}button{background:#e6bb66;color:#131c2b;border:0;border-radius:8px;padding:10px 13px;font-weight:700;cursor:pointer}button:disabled{opacity:.45;cursor:not-allowed}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}.grid label{margin:4px 0}tr[hidden]{display:none}tr.selected{background:#34435a}select{padding:11px;width:100%;background:#0c1321;border:1px solid #71829b;border-radius:8px;color:white}#prints{max-width:100%}.warning{border-left:3px solid #e6bb66;padding-left:12px}a{color:#f2c76e}#status{min-height:1.5em}textarea{min-height:90px}#filter{max-width:420px}</style></head><body><main>
<h1>⚡ DuelPrice · Verifica stampe Cardmarket</h1><p class="warning">Report locale: non pubblicare. Listino: ${esc(report.priceGuideDate??'data non indicata')}. Prezzi storici, non offerte live. Un ID espansione NON identifica da solo il codice stampa. Nessuna associazione viene confermata automaticamente.</p>
<div class="panel"><h3>1. Seleziona un candidato Cardmarket</h3><label>Filtra per ID, nome o stato <input id="filter" placeholder="es. 244199"></label><p id="count"></p></div>
<div class="panel" id="verify"><h3>2. Verifica manualmente la stampa</h3><p id="selected">Seleziona una riga nella tabella.</p><p class="hint">Confronta codice stampa, nome, set ed esatta rarità su fonti attendibili. Il collegamento Cardmarket deve essere alla pagina della stampa specifica, non a una ricerca generica. La selezione non costituisce una verifica.</p>
<div class="panel"><h3>Stampe YGOPRODeck · confronto assistito</h3><p class="hint">Le stampe sono suggerimenti da YGOPRODeck, non corrispondenze Cardmarket verificate.</p><button id="load-prints" type="button" disabled>Carica stampe della carta</button><label>Stampa <select id="prints" disabled><option value="">Seleziona prima un prodotto</option></select></label><p id="print-info" role="status"></p></div><form id="form"><div class="grid"><label>Codice stampa YGOPRODeck<input name="ygoprodeckCode" required placeholder="CT05-EN001"></label><label>Nome set verificato<input name="set" required placeholder="Collector's Tins 2008"></label><label>Rarità verificata<input name="rarity" required placeholder="Secret Rare"></label><label>URL prodotto Cardmarket<input name="cardmarketUrl" required type="url" placeholder="https://www.cardmarket.com/en/YuGiOh/Products/Singles/..."></label></div>
<label>Prova concreta della corrispondenza<textarea name="evidence" required minlength="20" placeholder="Descrivi cosa hai confrontato e la fonte: codice stampa, set, rarità, URL..."></textarea></label>
<label><input type="checkbox" name="confirmed" required style="width:auto"> Ho verificato personalmente che il prodotto Cardmarket corrisponde esattamente a questa stampa.</label>
<button id="export" type="submit" disabled>Esporta proposta JSON</button><p id="status" role="status"></p></form>
<p class="hint">L'esportazione crea solo un file locale da sottoporre a revisione. Non modifica il repository e non pubblica prezzi.</p></div>
${rows}
<small>Per sicurezza le proposte richiedono una seconda revisione prima di entrare in data/cardmarket-verified-mappings.json.</small>
</main><script>
const input=document.getElementById('filter'),form=document.getElementById('form'),selected=document.getElementById('selected'),status=document.getElementById('status'),exportButton=document.getElementById('export');
const loadPrints=document.getElementById('load-prints'),prints=document.getElementById('prints'),printInfo=document.getElementById('print-info');
let printList=[],lookupVersion=0;
let active=null;
function update(){let n=0;document.querySelectorAll('tbody tr').forEach(tr=>{tr.hidden=!tr.textContent.toLowerCase().includes(input.value.trim().toLowerCase())&&!tr.dataset.name.toLowerCase().includes(input.value.trim().toLowerCase());if(!tr.hidden)n++});document.getElementById('count').textContent=n+' prodotti visibili'}
input.addEventListener('input',update);update();
document.querySelectorAll('.choose').forEach(btn=>btn.addEventListener('click',()=>{
 const tr=btn.closest('tr');document.querySelectorAll('tr.selected').forEach(x=>x.classList.remove('selected'));tr.classList.add('selected');
 active={cardName:tr.dataset.name,cardmarketProductId:Number(tr.dataset.product),cardmarketExpansionId:Number(tr.dataset.expansion),alreadyVerified:tr.dataset.verified==='true'};
 selected.textContent='Selezionato: '+active.cardName+' · prodotto '+active.cardmarketProductId+' · espansione '+active.cardmarketExpansionId+(active.alreadyVerified?' · GIÀ VERIFICATO':'');
 form.reset();lookupVersion++;printList=[];prints.replaceChildren(new Option('Carica le stampe',''));prints.disabled=true;loadPrints.disabled=false;printInfo.textContent='';exportButton.disabled=active.alreadyVerified;status.textContent=active.alreadyVerified?'Questa corrispondenza è già verificata: non esportare duplicati.':'Verifica la stampa e compila tutti i campi prima di esportare.';
 document.getElementById('verify').scrollIntoView({behavior:'smooth',block:'start'});
}));
loadPrints.addEventListener('click',async()=>{
 if(!active)return;
 const name=active.cardName,version=++lookupVersion;
 loadPrints.disabled=true;prints.disabled=true;printInfo.textContent='Caricamento stampe...';
 try{
  const response=await fetch('https://db.ygoprodeck.com/api/v7/cardinfo.php?name='+encodeURIComponent(name),{headers:{Accept:'application/json'}});
  if(!response.ok)throw Error('HTTP '+response.status);
  const data=await response.json();
  if(version!==lookupVersion)return;
  const cards=(Array.isArray(data.data)?data.data:[]).filter(card=>String(card.name??'').trim().toLowerCase()===name.trim().toLowerCase());
  printList=cards.flatMap(card=>Array.isArray(card.card_sets)?card.card_sets:[]).map(p=>({code:String(p.set_code??''),set:String(p.set_name??''),rarity:String(p.set_rarity??'')})).filter(p=>p.code&&p.set);
  prints.replaceChildren(new Option('Scegli una stampa ('+printList.length+')',''));
  printList.forEach((p,i)=>prints.add(new Option(p.code+' · '+p.set+' · '+p.rarity,String(i))));
  prints.disabled=!printList.length;
  printInfo.textContent=printList.length+' stampe disponibili. La selezione NON verifica il prodotto Cardmarket.';
 }catch(error){if(version===lookupVersion)printInfo.textContent='Errore YGOPRODeck: '+error.message}
 finally{if(version===lookupVersion)loadPrints.disabled=false}
});
prints.addEventListener('change',()=>{
 if(!active||prints.value==='')return;
 const p=printList[Number(prints.value)];if(!p)return;
 form.elements.namedItem('ygoprodeckCode').value=p.code;
 form.elements.namedItem('set').value=p.set;
 form.elements.namedItem('rarity').value=p.rarity;
 form.elements.namedItem('confirmed').checked=false;
 printInfo.textContent='Precompilato '+p.code+'. Controlla manualmente che Cardmarket prodotto '+active.cardmarketProductId+' sia questa stampa.';
});
form.addEventListener('submit',event=>{
 event.preventDefault();if(!active||active.alreadyVerified)return;
 const data=new FormData(form);const code=String(data.get('ygoprodeckCode')).trim().toUpperCase(),set=String(data.get('set')).trim(),rarity=String(data.get('rarity')).trim(),evidence=String(data.get('evidence')).trim(),url=String(data.get('cardmarketUrl')).trim();
 if(!/^[A-Z0-9]+(?:-[A-Z0-9]+)+$/.test(code)){status.textContent='Codice stampa non valido.';return}
 let parsed;try{parsed=new URL(url)}catch{status.textContent='URL non valido.';return}
 if(parsed.protocol!=='https:'||!['cardmarket.com','www.cardmarket.com'].includes(parsed.hostname)||!parsed.pathname.includes('/YuGiOh/Products/Singles/')){status.textContent='Serve un URL HTTPS Cardmarket di un prodotto Yu-Gi-Oh! Singles.';return}
 if(!set||!rarity||evidence.length<20||data.get('confirmed')!=='on'){status.textContent='Completa la verifica e descrivi la prova.';return}
 const proposal={reviewStatus:'pending-second-review',ygoprodeckCode:code,cardName:active.cardName,set,rarity,cardmarketProductId:active.cardmarketProductId,cardmarketExpansionId:active.cardmarketExpansionId,cardmarketUrl:url,evidence,priceGuideDate:${JSON.stringify(report.priceGuideDate??null)}};
 const blob=new Blob([JSON.stringify(proposal,null,2)+'\\n'],{type:'application/json'}),href=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=href;a.download='duelprice-proposta-'+active.cardmarketProductId+'-'+code+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(href),1000);
 status.textContent='Proposta JSON esportata. Non è stata aggiunta alle mappature verificate.';
});
</script></body></html>`;
writeFileSync(outputPath,html);
console.log('Pannello di verifica creato:',outputPath,'| carte:',groups.length,'| candidati:',groups.reduce((n,g)=>n+g.candidates.length,0));
