const grid = document.getElementById('grid');
let all = [];
let filter = 'all';
async function load() {
  try {
    const r = await fetch('articles.json', {cache:'no-store'});
    if (!r.ok) throw 0;
    const d = await r.json();
    all = d.articles || [];
  } catch(e) {
    all = [];
  }
  route();
}
function card(a) {
  return `<a class="card ${a.size||''}" href="#/${a.id}" data-cat="${a.cat||'🌍'}" aria-label="${(a.emojis||[]).join(' ')}">
    <span class="cat" aria-hidden="true">${a.cat||'🌍'}</span>
    ${a.image?`<img src="${a.image}" alt="" loading="lazy" onerror="this.remove()">`:`<div class="fallback" aria-hidden="true">${(a.emojis||['🌍'])[0]}</div>`}
    <span class="emoji-bar" aria-hidden="true">${(a.emojis||[]).join(' ')}</span>
    <span class="more" aria-hidden="true">➡️</span>
  </a>`;
}
function renderGrid() {
  const list = filter==='all' ? all : all.filter(a=>a.cat===filter||(a.emojis||[]).includes(filter));
  grid.className = 'grid';
  grid.innerHTML = list.map(card).join('') || `<div class="loading" aria-hidden="true">🌵</div>`;
  document.querySelectorAll('.tabs a').forEach(t=>t.classList.toggle('active', t.dataset.filter===filter));
}
function renderArticle(id) {
  const a = all.find(x=>String(x.id)===String(id));
  if (!a) return renderGrid();
  grid.className = 'article';
  const rows = (a.story||[]).map(r=>`<div class="line" aria-hidden="true">${r.join(' ')}</div>`).join('');
  grid.innerHTML = `
    <a class="back" href="#/" aria-label="Tillbaka">⬅️</a>
    <div class="hero"><img src="${a.image||''}" alt="" onerror="this.remove()"><div class="hero-title" aria-hidden="true">${(a.emojis||[]).join(' ')}</div></div>
    <div class="meta" aria-hidden="true"><span>${a.cat||'🌍'}</span><span>➖</span><span>🕒</span></div>
    <div class="story">${rows}</div>
    <div class="react" aria-hidden="true"><span>😮</span><span>😡</span><span>😂</span><span>❤️</span></div>
    <div class="related">${all.filter(x=>x.id!==a.id).slice(0,3).map(x=>`<a href="#/${x.id}" aria-label="${(x.emojis||[]).join(' ')}">${(x.emojis||[]).slice(0,3).join(' ')}</a>`).join('')}</div>`;
  window.scrollTo(0,0);
}
function route() {
  const m = (location.hash||'').match(/^#\/(\d+)/);
  if (m) renderArticle(m[1]); else renderGrid();
}
document.querySelectorAll('.tabs a').forEach(t=>t.addEventListener('click',()=>{filter=t.dataset.filter;location.hash='#/';renderGrid();}));
document.getElementById('theme').addEventListener('click',()=>document.body.classList.toggle('dark'));
window.addEventListener('hashchange',route);
load();
