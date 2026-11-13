import React from 'react';
import { createRoot } from 'react-dom/client';
import { cards } from '../data/cards';
import './style.css';

const imageFor = id => `https://images.ygoprodeck.com/images/cards_small/${id}.jpg`;
const euro = n => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n);
function App() {
  const [query, setQuery] = React.useState('');
  const [remote, setRemote] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  React.useEffect(() => {
    const term = query.trim();
    if (term.length < 3) { setRemote(null); setLoading(false); setError(''); return; }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true); setError('');
      try {
        const res = await fetch(`https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(term)}`, {signal: controller.signal});
        if (res.status === 400) { setRemote([]); return; }
        if (!res.ok) throw new Error('API non disponibile');
        const json = await res.json();
        if (!controller.signal.aborted) setRemote((json.data || []).slice(0, 80).map(c => ({id:String(c.id),name:c.name,italianName:'',set:c.card_sets?.[0]?.set_name || '—',code:c.card_sets?.[0]?.set_code || '—',rarity:c.card_sets?.[0]?.set_rarity || '—',prints:(c.card_sets||[]).map(p=>({code:p.set_code,name:p.set_name,rarity:p.set_rarity})),description:c.desc||'',type:c.type || '—',attribute:c.attribute || '—',image:c.card_images?.[0]?.image_url_small || imageFor(c.id),price:null,marketPrice:c.card_prices?.[0]?.cardmarket_price ?? null,tcgPrice:c.card_prices?.[0]?.tcgplayer_price ?? null})));
      } catch (e) { if (!controller.signal.aborted) {setError('Catalogo non raggiungibile. Riprova.'); setRemote([]);} }
      finally {if (!controller.signal.aborted) setLoading(false);}
    }, 450);
    return () => {clearTimeout(timer); controller.abort();};
  }, [query]);
  const [selected, setSelected] = React.useState(null);
  const [printIndex,setPrintIndex] = React.useState(0);
  const [language,setLanguage] = React.useState('IT');
  const [condition,setCondition] = React.useState('Near Mint');
  const [favorites, setFavorites] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('duelprice-favorites') || '[]'); } catch { return []; }
  });
  const [onlyFavorites, setOnlyFavorites] = React.useState(false);
  const filtered = (remote === null ? cards : remote).filter(c => (!onlyFavorites || favorites.includes(c.id)) &&
    [c.name,c.italianName,c.set,c.code,c.rarity].some(v => v.toLocaleLowerCase('it').includes(query.trim().toLocaleLowerCase('it'))));
  const toggleFavorite = id => setFavorites(old => {
    const next = old.includes(id) ? old.filter(x => x !== id) : [...old,id];
    localStorage.setItem('duelprice-favorites', JSON.stringify(next));
    return next;
  });
  const detailCard = (remote === null ? cards : remote).find(c=>c.id===selected);
  const prints = detailCard?.prints?.length ? detailCard.prints : detailCard ? [{code:detailCard.code,name:detailCard.set,rarity:detailCard.rarity}] : [];
  const chosenPrint = prints[Math.min(printIndex,prints.length-1)];
  return <div className="app">
    <header><div className="brand"><span className="bolt">⚡</span><span>Duel<span className="gold">Price</span></span></div><p>Trova le tue carte Yu-Gi-Oh!</p></header>
    <main>{detailCard ? <section className="detailpage"><button className="back" onClick={()=>setSelected(null)}>← Torna alla ricerca</button><div className="detailhero"><img src={detailCard.image || imageFor(detailCard.id)} alt={detailCard.name}/><div><h1>{detailCard.name}</h1><p>{detailCard.type}</p><p>{detailCard.attribute}</p></div></div><h2>Seleziona la stampa</h2><label className="field">Espansione / stampa<select value={Math.min(printIndex,prints.length-1)} onChange={e=>setPrintIndex(Number(e.target.value))}>{prints.map((p,i)=><option key={i} value={i}>{p.code} · {p.name} · {p.rarity}</option>)}</select></label><div className="printdata"><b>Codice:</b> {chosenPrint?.code}<br/><b>Set:</b> {chosenPrint?.name}<br/><b>Rarità:</b> {chosenPrint?.rarity}</div><div className="twofields"><label className="field">Lingua<select value={language} onChange={e=>setLanguage(e.target.value)}>{[['IT','Italiano'],['EN','Inglese'],['DE','Tedesco'],['FR','Francese'],['ES','Spagnolo'],['PT','Portoghese']].map(([v,t])=><option key={v} value={v}>{t}</option>)}</select></label><label className="field">Condizioni<select value={condition} onChange={e=>setCondition(e.target.value)}>{['Mint','Near Mint','Excellent','Good','Light Played','Played','Poor'].map(v=><option key={v}>{v}</option>)}</select></label></div><div className="pricepanel"><h2>Confronto prezzi</h2><div>Cardmarket <strong>{detailCard.marketPrice != null && Number.isFinite(Number(detailCard.marketPrice)) ? euro(Number(detailCard.marketPrice)) : "Quotazione non disponibile"}</strong></div><small>Quotazione indicativa aggregata fornita da YGOPRODeck: minimo rilevato tra diverse versioni della carta, NON specifico per stampa, lingua o condizione. Non è un’offerta live.</small><p className="hint">Ricerca esterna per {detailCard.name} · {chosenPrint?.code || "stampa da verificare"}. Controlla codice, lingua e condizioni su Cardmarket prima di confrontare le offerte.</p><a className="marketlink" href={`https://www.cardmarket.com/en/YuGiOh/Products/Search?searchString=${encodeURIComponent(detailCard.name)}`} target="_blank" rel="noopener noreferrer">Cerca su Cardmarket ↗</a><div>TCGplayer <strong>{detailCard.tcgPrice != null && Number.isFinite(Number(detailCard.tcgPrice)) ? `${Number(detailCard.tcgPrice).toFixed(2)} USD (indicativo)` : "Quotazione non disponibile"}</strong></div><small>I valori aggregati non sono confrontabili per singola stampa. Lingua e condizioni sono filtri preparatori; verifica sempre le offerte effettive sul marketplace.</small></div>{detailCard.description&&<div className="description"><h2>Descrizione</h2><p>{detailCard.description}</p></div>}</section> : <>
      <div className="notice">CATALOGO ONLINE · Prezzi reali non ancora disponibili</div>
      <label className="searchbox"><span aria-hidden="true">⌕</span><input aria-label="Cerca carte" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cerca nome, set, codice o rarità..." /></label>
      <p className="hint">Cerca per nome inglese (almeno 3 caratteri) per interrogare il catalogo online.</p><div className="toolbar"><span>{filtered.length} {filtered.length === 1 ? 'carta trovata' : 'carte trovate'}</span><button className={onlyFavorites?'filter active':'filter'} onClick={()=>setOnlyFavorites(v=>!v)} aria-pressed={onlyFavorites}>♥ Preferiti ({favorites.length})</button></div>
      {loading && <p className="hint" role="status">Caricamento carte...</p>}{error && <p className="hint" role="alert">{error}</p>}<section className="cards" aria-label="Risultati di ricerca">{filtered.length === 0 ? <p className="empty">Nessuna carta trovata. Prova un altro termine.</p> : filtered.map(c=><article className="card" key={c.id}>
        <div className="cardhead"><img className="cardimage" src={c.image || imageFor(c.id)} alt={`Carta ${c.name}`} loading="lazy" onError={e=>{e.currentTarget.style.visibility='hidden'}}/><div className="info"><h2>{c.name}</h2><div className="italian">{c.italianName}</div><div className="meta">{c.code} · {c.rarity}</div></div><div className="right"><strong className="price">{c.price == null ? 'Prezzo non disponibile' : euro(c.price)}</strong><button className={favorites.includes(c.id)?'heart saved':'heart'} aria-label={favorites.includes(c.id)?'Rimuovi dai preferiti':'Aggiungi ai preferiti'} aria-pressed={favorites.includes(c.id)} onClick={()=>toggleFavorite(c.id)}>♥</button></div></div>
        {selected===c.id && <div className="details"><div><b>Set:</b> {c.set}</div><div><b>Tipo:</b> {c.type}</div><div><b>Attributo:</b> {c.attribute}</div><small>Prezzo dimostrativo · Nessun negozio collegato</small></div>}
        <button className="expand" aria-expanded={selected===c.id} onClick={()=>{setSelected(c.id);setPrintIndex(0);window.scrollTo(0,0)}}>Apri scheda carta →</button>
      </article>)}</section></>}
    </main><footer>DuelPrice · Dati carte: YGOPRODeck · Prezzi demo o non disponibili</footer>
  </div>;
}
createRoot(document.getElementById('root')).render(<App />);
