const grid = document.getElementById('grid');
let all = [];
async function load() {
  try {
    const r = await fetch('articles.json', {cache:'no-store'});
    if (!r.ok) throw 0;
    const d = await r.json();
    all = d.articles || [];
  } catch(e) {
    all = fallbackArticles();
  }
  render('all');
}
function fallbackArticles() {
  const day = new Date().toISOString().slice(0,10);
  let h = 0; for (const c of day) h = (h*31 + c.charCodeAt(0)) >>> 0;
  const pool = [
    {cat:'🌦️', emojis:['🌧️','➡️','☀️'], seed:'vader'},
    {cat:'⚽', emojis:['⚽','🏟️','🎉'], seed:'sport'},
    {cat:'🌍', emojis:['🌍','🔥','🌊'], seed:'varld'},
    {cat:'🍔', emojis:['🍔','👀','😍'], seed:'mat'},
    {cat:'🎬', emojis:['🎬','🍿','🏆'], seed:'film'}
  ];
  return pool.map((a,i)=>({id:i+1,cat:a.cat,emojis:a.emojis,image:`https://picsum.photos/seed/${a.seed}${h%97}/800/600`,size:i===0?'large':'small'}));
}
function render(filter) {
  const list = filter==='all' ? all : all.filter(a=>a.cat===filter||(a.emojis||[]).includes(filter));
  grid.innerHTML = list.map(a=>`
    <a class="card ${a.size||''}" href="#${a.id||''}" data-cat="${a.cat||'🌍'}" aria-label="${(a.emojis||[]).join(' ')}">
      <span class="cat" aria-hidden="true">${a.cat||'🌍'}</span>
      ${a.image?`<img src="${a.image}" alt="" loading="lazy" onerror="this.remove()">`:`<div class="fallback" aria-hidden="true">${(a.emojis||['🌍'])[0]}</div>`}
      <span class="emoji-bar" aria-hidden="true">${(a.emojis||[]).join(' ')}</span>
    </a>`).join('') || `<div class="loading" aria-hidden="true">🌵</div>`;
  document.querySelectorAll('.tabs a').forEach(t=>t.classList.toggle('active', t.dataset.filter===filter));
}
document.querySelectorAll('.tabs a').forEach(t=>t.addEventListener('click',()=>render(t.dataset.filter)));
document.getElementById('theme').addEventListener('click',()=>document.body.classList.toggle('dark'));
load();
