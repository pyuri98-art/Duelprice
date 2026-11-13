import React from 'react';
import { createRoot } from 'react-dom/client';
import { cards } from '../data/cards';
import './style.css';

const euro = n => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(n);
function App() {
  const [query, setQuery] = React.useState('');
  const [selected, setSelected] = React.useState(null);
  const [favorites, setFavorites] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('duelprice-favorites') || '[]'); } catch { return []; }
  });
  const [onlyFavorites, setOnlyFavorites] = React.useState(false);
  const filtered = cards.filter(c => (!onlyFavorites || favorites.includes(c.id)) &&
    [c.name,c.italianName,c.set,c.code,c.rarity].some(v => v.toLocaleLowerCase('it').includes(query.trim().toLocaleLowerCase('it'))));
  const toggleFavorite = id => setFavorites(old => {
    const next = old.includes(id) ? old.filter(x => x !== id) : [...old,id];
    localStorage.setItem('duelprice-favorites', JSON.stringify(next));
    return next;
  });
  return <div className="app">
    <header><div className="brand"><span className="bolt">⚡</span><span>Duel<span className="gold">Price</span></span></div><p>Trova le tue carte Yu-Gi-Oh!</p></header>
    <main>
      <div className="notice">VERSIONE DEMO · Prezzi illustrativi, non reali</div>
      <label className="searchbox"><span aria-hidden="true">⌕</span><input aria-label="Cerca carte" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cerca nome, set, codice o rarità..." /></label>
      <div className="toolbar"><span>{filtered.length} {filtered.length === 1 ? 'carta trovata' : 'carte trovate'}</span><button className={onlyFavorites?'filter active':'filter'} onClick={()=>setOnlyFavorites(v=>!v)} aria-pressed={onlyFavorites}>♥ Preferiti ({favorites.length})</button></div>
      <section className="cards" aria-label="Risultati di ricerca">{filtered.length === 0 ? <p className="empty">Nessuna carta trovata. Prova un altro termine.</p> : filtered.map(c=><article className="card" key={c.id}>
        <div className="cardhead"><div className="info"><h2>{c.name}</h2><div className="italian">{c.italianName}</div><div className="meta">{c.code} · {c.rarity}</div></div><div className="right"><strong className="price">{euro(c.price)}</strong><button className={favorites.includes(c.id)?'heart saved':'heart'} aria-label={favorites.includes(c.id)?'Rimuovi dai preferiti':'Aggiungi ai preferiti'} aria-pressed={favorites.includes(c.id)} onClick={()=>toggleFavorite(c.id)}>♥</button></div></div>
        {selected===c.id && <div className="details"><div><b>Set:</b> {c.set}</div><div><b>Tipo:</b> {c.type}</div><div><b>Attributo:</b> {c.attribute}</div><small>Prezzo dimostrativo · Nessun negozio collegato</small></div>}
        <button className="expand" aria-expanded={selected===c.id} onClick={()=>setSelected(selected===c.id?null:c.id)}>{selected===c.id?'Nascondi dettagli ▲':'Mostra dettagli ▼'}</button>
      </article>)}</section>
    </main><footer>DuelPrice · Prototipo PWA · Dati dimostrativi</footer>
  </div>;
}
createRoot(document.getElementById('root')).render(<App />);
