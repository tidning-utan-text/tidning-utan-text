// Hämtar verkliga nyheter (SVT RSS) och översätter till emoji-artiklar. Ingen synlig text i output.
const RSS = [
  'https://www.svt.se/nyheter/rss.xml',
  'https://www.svt.se/sport/rss.xml'
];
const LEX = {"val":"🗳️","regering":"🏛️","riksdag":"📜","statsminister":"🧑‍💼","president":"👔","parti":"📢","omröstning":"🗳️","debatt":"💬","lag":"⚖️","skatt":"💰","krig":"⚔️","fred":"🕊️","militär":"🪖","vapen":"🔫","attack":"💥","flykting":"🧳","ränta":"📈","inflation":"💸","börs":"📊","ekonomi":"💵","jobb":"💼","arbetslöshet":"📉","bostad":"🏠","pris":"🏷️","lön":"🪙","företag":"🏢","fotboll":"⚽","hockey":"🏒","skid":"⛷️","match":"🏟️","guld":"🥇","seger":"🏆","derby":"🏟️","vinst":"🏆","förlust":"😞","mästare":"🏆","regn":"🌧️","snö":"❄️","sol":"☀️","storm":"🌪️","värme":"🌡️","klimat":"🌍","vind":"💨","åska":"⛈️","översvämning":"🌊","glaciär":"🧊","brott":"🚨","mord":"🔪","polis":"🚓","rån":"🥷","brand":"🔥","explosion":"🧨","domstol":"🔨","fängelse":"🔒","trafik":"🚦","bil":"🚗","tåg":"🚂","flyg":"✈️","olycka":"🚑","väg":"🛣️","mat":"🍽️","restaurang":"🍴","kaffe":"☕","film":"🎬","musik":"🎵","bok":"📚","konst":"🎨","teater":"🎭","ai":"🤖","mobil":"📱","dator":"💻","internet":"🌐","rymd":"🚀","sjukhus":"🏥","läkare":"🩺","sjukdom":"🤒","hälsa":"❤️","vaccin":"💉","skola":"🏫","lärare":"🧑‍🏫","universitet":"🎓","eu":"🌍","nato":"🛡️","olja":"🛢️","energi":"⚡","el":"⚡","kärnkraft":"☢️","trump":"👔","zelenskyj":"🪖","ukraina":"🌻","ryssland":"🐻","usa":"🌎","kina":"🐼","nobel":"🏅","fredspris":"🕊️","bordtennis":"🏓","tennis":"🎾","fest":"🎉","firande":"🎉","tränare":"🧑‍🏫","skada":"🤕","sjuk":"🤒","död":"💀","mördad":"💀","avrättning":"⚖️","pentagon":"🪖","glaciärer":"🧊","mätning":"📊","västkusten":"🌊","kraftiga":"💪"};
function hash(s){let h=0;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;return h;}
const EXTRA = {"smash":"🏓","segrare":"🏆","vinnare":"🏆","gruva":"⛏️","brandman":"🧑‍🚒","strid":"⚔️","gaza":"🏚️","djurgård":"⚽","derbyseger":"🏟️","sjukhus":"🏥","till":"➡️"};
Object.assign(LEX, EXTRA);
function clean(s){return (s||'').replace(/<!\[CDATA\[|\]\]>/g,'').replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").trim();}
function parseRSS(xml){
  const items=[];
  for(const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)){
    const b=m[1];
    const t=(b.match(/<title>([\s\S]*?)<\/title>/)||[])[1]||'';
    const d=(b.match(/<description>([\s\S]*?)<\/description>/)||[])[1]||'';
    items.push({title:clean(t), desc:clean(d)});
  }
  return items;
}
function toEmojis(title, desc){
  const txt=(title+' '+desc).toLowerCase();
  const keys=Object.keys(LEX).sort((a,b)=>b.length-a.length);
  const out=[];
  for(const k of keys){ if(txt.includes(k) && !out.includes(LEX[k])){ out.push(LEX[k]); if(out.length>=5) break; } }
  return out;
}
function catFor(emojis, txt){
  const t=txt.toLowerCase();
  if(emojis.includes('⚽')||emojis.includes('🏒')||emojis.includes('⛷️')||emojis.includes('🏟️')||emojis.includes('🏆')||emojis.includes('🏓')||/fotboll|hockey|derby|match|seger|tennis|mästare/.test(t)) return '⚽';
  if(emojis.includes('🌧️')||emojis.includes('❄️')||emojis.includes('☀️')||emojis.includes('🌪️')||emojis.includes('🌊')||emojis.includes('🧊')||/väder|regn|snö|storm|klimat|glaciär|översvämning/.test(t)) return '🌦️';
  if(emojis.includes('🍽️')||emojis.includes('🍴')||/restaurang|mat|kock/.test(t)) return '🍔';
  if(emojis.includes('🎬')||emojis.includes('🎵')||emojis.includes('🎭')||/film|musik|konsert|teater|bok/.test(t)) return '🎬';
  return '🌍';
}
function sentiment(txt){
  const t=txt.toLowerCase();
  if(/seger|guld|vinst|pris|firande|fest|fred|bäst|rekord/.test(t)) return 'pos';
  if(/krig|död|mord|attack|brand|olycka|kris|förlust|åtal|explosion|avrättning/.test(t)) return 'neg';
  return 'neu';
}
function buildStory(cat, em, feel){
  const e = em.length?em:[cat,'👀','❓'].slice(0,3);
  const react = feel==='pos' ? ['😍','🎉','👏'] : feel==='neg' ? ['😱','😞','😡'] : ['😮','🤔','👀'];
  const end = feel==='pos' ? ['🎉','🏆','👏'] : feel==='neg' ? ['🚨','🤝','🕊️'] : ['🔜','👀','🌍'];
  return [
    ['🕒','🌍','👀', e[0]||cat, e[1]||'➡️'],
    ['📰', e[0]||cat, '➡️', e[1]||e[0]||cat, react[0], '👥'],
    ['🔍', e[1]||e[0]||cat, '➕', e[2]||'❗', '➡️', react[1]],
    ['📍','🗺️','➡️', e[0]||cat, '👥','💬', react[0]],
    ['📈','➡️', e[2]||e[1]||cat, react[2], '👏','👥'],
    end.concat(['🔜','👀'])
  ].map(r=>r.slice(0,7));
}
async function main(){
  const date = process.argv[2]?.replace('--date=','') || new Date().toISOString().slice(0,10);
  let items=[];
  for(const url of RSS){
    try{
      const r = await fetch(url, {headers:{'user-agent':'tidning-utan-text'}});
      if(r.ok){ items.push(...parseRSS(await r.text())); }
    }catch(e){ console.error('fetch fail', url, e.message); }
    if(items.length>=10) break;
  }
  // dedup + max 5
  const seen=new Set(); items=items.filter(i=>{const k=i.title; if(!k||seen.has(k)) return false; seen.add(k); return true;}).slice(0,5);
  console.log(`Hämtade ${items.length} nyheter`);
  items.forEach(i=>console.log(' -', i.title));
  let articles;
  if(items.length>=3){
    articles = items.map((n,i)=>{
      const em = toEmojis(n.title, n.desc);
      const cat = catFor(em, n.title+' '+n.desc);
      const feel = sentiment(n.title+' '+n.desc);
      const title = [cat, ...em].slice(0,5);
      while(title.length<3) title.push(['👀','❗','🌍'][title.length%3]);
      return {id:i+1, cat, emojis:title, image:`https://picsum.photos/seed/nyhet${hash(n.title)%9973}/1200/700`, size:i===0?'large':'small', story:buildStory(cat, em, feel)};
    });
  } else {
    console.log('Fallback: för få nyheter, kör generate.mjs-mallar');
    const {execSync} = await import('child_process');
    execSync(`node scripts/generate.mjs --date=${date}`, {stdio:'inherit'});
    return;
  }
  const {writeFileSync, mkdirSync, existsSync} = await import('fs');
  mkdirSync('data/articles',{recursive:true});
  const out = JSON.stringify({date, articles}, null, 2);
  const dated = `data/articles/${date}.json`;
  if(!existsSync(dated)) writeFileSync(dated, out);
  writeFileSync('articles.json', out);
  // ASCII-kontroll på output
  const allEmoji = articles.flatMap(a=>[...a.emojis, ...a.story.flat()]);
  const bad = allEmoji.join(' ').match(/[A-Za-z0-9]/);
  console.log(bad ? 'VARNING: ASCII i emojis!' : 'OK: inga ASCII-tecken i emoji-fält');
  console.log(`OK ${date} -> ${articles.length} nyhetsartiklar`);
}
main();
