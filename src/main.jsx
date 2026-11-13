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
        if (!controller.signal.aborted) setRemote((json.data || []).slice(0, 80).map(c => ({id:String(c.id),name:c.name,italianName:'',set:c.card_sets?.[0]?.set_name || '—',code:c.card_sets?.[0]?.set_code || '—',rarity:c.card_sets?.[0]?.set_rarity || '—',type:c.type || '—',attribute:c.attribute || '—',image:c.card_images?.[0]?.image_url_small || imageFor(c.id),price:null})));
      } catch (e) { if (!controller.signal.aborted) {setError('Catalogo non raggiungibile. Riprova.'); setRemote([]);} }
      finally {if (!controller.signal.aborted) setLoading(false);}
    }, 450);
    return () => {clearTimeout(timer); controller.abort();};
  }, [query]);
  const [selected, setSelected] = React.useState(null);
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
  return <div className="app">
    <header><div className="brand"><span className="bolt">⚡</span><span>Duel<span className="gold">Price</span></span></div><p>Trova le tue carte Yu-Gi-Oh!</p></header>
    <main>
      <div className="notice">CATALOGO ONLINE · Prezzi reali non ancora disponibili</div>
      <label className="searchbox"><span aria-hidden="true">⌕</span><input aria-label="Cerca carte" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cerca nome, set, codice o rarità..." /></label>
      <p className="hint">Cerca per nome inglese (almeno 3 caratteri) per interrogare il catalogo online.</p><div className="toolbar"><span>{filtered.length} {filtered.length === 1 ? 'carta trovata' : 'carte trovate'}</span><button className={onlyFavorites?'filter active':'filter'} onClick={()=>setOnlyFavorites(v=>!v)} aria-pressed={onlyFavorites}>♥ Preferiti ({favorites.length})</button></div>
      {loading && <p className="hint" role="status">Caricamento carte...</p>}{error && <p className="hint" role="alert">{error}</p>}<section className="cards" aria-label="Risultati di ricerca">{filtered.length === 0 ? <p className="empty">Nessuna carta trovata. Prova un altro termine.</p> : filtered.map(c=><article className="card" key={c.id}>
        <div className="cardhead"><img className="cardimage" src={c.image || imageFor(c.id)} alt={`Carta ${c.name}`} loading="lazy" onError={e=>{e.currentTarget.style.visibility='hidden'}}/><div className="info"><h2>{c.name}</h2><div className="italian">{c.italianName}</div><div className="meta">{c.code} · {c.rarity}</div></div><div className="right"><strong className="price">{c.price == null ? 'Prezzo non disponibile' : euro(c.price)}</strong><button className={favorites.includes(c.id)?'heart saved':'heart'} aria-label={favorites.includes(c.id)?'Rimuovi dai preferiti':'Aggiungi ai preferiti'} aria-pressed={favorites.includes(c.id)} onClick={()=>toggleFavorite(c.id)}>♥</button></div></div>
        {selected===c.id && <div className="details"><div><b>Set:</b> {c.set}</div><div><b>Tipo:</b> {c.type}</div><div><b>Attributo:</b> {c.attribute}</div><small>Prezzo dimostrativo · Nessun negozio collegato</small></div>}
        <button className="expand" aria-expanded={selected===c.id} onClick={()=>setSelected(selected===c.id?null:c.id)}>{selected===c.id?'Nascondi dettagli ▲':'Mostra dettagli ▼'}</button>
      </article>)}</section>
    </main><footer>DuelPrice · Dati carte: YGOPRODeck · Prezzi demo o non disponibili</footer>
  </div>;
}
createRoot(document.getElementById('root')).render(<App />);
