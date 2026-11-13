#!/usr/bin/env node
// Experimental standalone preview. Does not alter the working Cardmarket review page.
import {writeFileSync} from 'node:fs';
const output=process.argv[2]??'imports/ygoprodeck-print-preview.html';
const html=`<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DuelPrice · Anteprima stampe</title><style>
*{box-sizing:border-box}body{font:15px system-ui;background:#101827;color:#f2f4f8;margin:0;padding:24px}main{max-width:1000px;margin:auto}h1,th{color:#f2c76e}.panel{background:#1b283b;border:1px solid #39495d;border-radius:14px;padding:18px;margin:18px 0}label{display:block;margin:10px 0}input{background:#0c1321;color:white;border:1px solid #71829b;border-radius:8px;padding:12px;max-width:420px;width:100%}button{background:#e6bb66;color:#101827;border:0;border-radius:8px;padding:12px;cursor:pointer;font-weight:700}button:disabled{opacity:.5}table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:10px;border-bottom:1px solid #38485c}.scroll{overflow:auto}p{color:#b8c4d6}#status{white-space:pre-wrap}</style></head><body><main>
<h1>⚡ DuelPrice · Anteprima stampe YGOPRODeck</h1><p>Pagina sperimentale indipendente: non modifica il catalogo Cardmarket e non crea associazioni verificate.</p>
<div class="panel"><form id="search"><label>Nome esatto della carta <input id="name" value="Stardust Dragon" required></label><button id="load" type="submit">Carica stampe</button></form><p id="status" role="status">Pronto.</p></div>
<div class="panel"><div class="scroll"><table><thead><tr><th>Codice stampa</th><th>Set</th><th>Rarità</th></tr></thead><tbody id="results"></tbody></table></div></div>
<p>Fonte: API pubblica YGOPRODeck. Nessuna corrispondenza con ID Cardmarket è implicita.</p></main><script>
const form=document.getElementById('search'),input=document.getElementById('name'),status=document.getElementById('status'),results=document.getElementById('results'),button=document.getElementById('load');
let request=0;
form.addEventListener('submit',async event=>{
 event.preventDefault();const token=++request,name=input.value.trim();if(!name)return;
 button.disabled=true;results.replaceChildren();status.textContent='Caricamento di '+name+'...';
 try{
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),12000);
  let response;try{response=await fetch('https://db.ygoprodeck.com/api/v7/cardinfo.php?name='+encodeURIComponent(name),{signal:controller.signal,headers:{Accept:'application/json'}})}finally{clearTimeout(timeout)}
  if(!response.ok)throw new Error('HTTP '+response.status);
  const payload=await response.json();if(token!==request)return;
  const cards=(Array.isArray(payload.data)?payload.data:[]).filter(card=>String(card.name??'').trim().toLowerCase()===name.toLowerCase());
  const prints=cards.flatMap(card=>Array.isArray(card.card_sets)?card.card_sets:[]).filter(p=>p.set_code&&p.set_name);
  for(const p of prints){const tr=document.createElement('tr');for(const value of [p.set_code,p.set_name,p.set_rarity??'—']){const td=document.createElement('td');td.textContent=String(value);tr.appendChild(td)}results.appendChild(tr)}
  status.textContent=prints.length+' stampe trovate per '+name+'. Verificare sempre separatamente la corrispondenza con Cardmarket.';
 }catch(error){if(token!==request)return;status.textContent='Caricamento non riuscito: '+error.message+'. Controlla connessione e console del browser.'}
 finally{if(token===request)button.disabled=false}
});
</script></body></html>`;
writeFileSync(output,html);
console.log('Anteprima YGOPRODeck creata:',output);
