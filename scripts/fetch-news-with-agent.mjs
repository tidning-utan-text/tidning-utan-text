// Daglig agent-översättning: RSS -> LLM (GitHub Models) -> emoji-artiklar. Fallback till dictionary.
const RSS = ['https://www.svt.se/nyheter/rss.xml','https://www.svt.se/sport/rss.xml'];
const LEX = {"val":"🗳️","regering":"🏛️","riksdag":"📜","krig":"⚔️","fred":"🕊️","militär":"🪖","attack":"💥","ränta":"📈","börs":"📊","ekonomi":"💵","fotboll":"⚽","hockey":"🏒","match":"🏟️","seger":"🏆","segrare":"🏆","smash":"🏓","regn":"🌧️","snö":"❄️","storm":"🌪️","klimat":"🌍","översvämning":"🌊","brand":"🔥","polis":"🚓","trafik":"🚦","bil":"🚗","tåg":"🚂","flyg":"✈️","olycka":"🚑","film":"🎬","musik":"🎵","ai":"🤖","sjukhus":"🏥","skola":"🏫","energi":"⚡","olja":"🛢️","gruva":"⛏️","brandman":"🧑‍🚒","strid":"⚔️","gaza":"🏚️"};
function hash(s){let h=0;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;return h;}
function clean(s){return (s||'').replace(/<!\[CDATA\[|\]\]>/g,'').replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').trim();}
function parseRSS(xml){const o=[];for(const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)){const b=m[1];o.push({title:clean((b.match(/<title>([\s\S]*?)<\/title>/)||[])[1]),desc:clean((b.match(/<description>([\s\S]*?)<\/description>/)||[])[1])});}return o;}
function dictTranslate(items){
  return items.map((n,i)=>{
    const txt=(n.title+' '+n.desc).toLowerCase();
    let em=[];for(const k of Object.keys(LEX).sort((a,b)=>b.length-a.length)){if(txt.includes(k)&&!em.includes(LEX[k])){em.push(LEX[k]);if(em.length>=4)break;}}
    let cat='🌍';
    if(em.includes('⚽')||em.includes('🏒')||em.includes('🏟️')||em.includes('🏓'))cat='⚽';
    else if(em.includes('🌧️')||em.includes('🌊'))cat='🌦️';
    const title=[cat,...em].slice(0,5);while(title.length<3)title.push('👀');
    const story=[['🕒','🌍','👀',title[1]||cat],['📰',title[1]||cat,'➡️',title[2]||'❗','😮'],['🔍',title[2]||cat,'➕','❗','🤔'],['📍','🗺️',title[1]||cat,'👥'],['📈',title[1]||cat,'👀','👏'],['🔜','👀','🌍']];
    return {id:i+1,cat,emojis:title,image:`https://picsum.photos/seed/nyhet${hash(n.title)%9973}/1200/700`,size:i===0?'large':'small',story};
  });
}
async function agentTranslate(items){
  const token = process.env.GITHUB_TOKEN || process.env.GH_MODELS_TOKEN || process.env.OPENAI_API_KEY;
  if(!token){ console.log('Ingen LLM-token, använder dictionary-fallback'); return null; }
  const isOpenAI = !!process.env.OPENAI_API_KEY && !process.env.GITHUB_TOKEN;
  const url = isOpenAI ? 'https://api.openai.com/v1/chat/completions' : 'https://models.github.ai/inference/chat/completions';
  const model = isOpenAI ? 'gpt-4o-mini' : 'openai/gpt-4o-mini';
  const news = items.map((n,i)=>`${i+1}. ${n.title} / ${n.desc.slice(0,200)}`).join('\n');
  const prompt = `Översätt dessa 5 verkliga nyheter till emoji-artiklar för en textfri tidning. Förstå innebörden.\n${news}\n\nRegler per artikel: cat en av 🌦️⚽🌍🍔🎬, title 5 emojis (inga ASCII-bokstäver/siffror, inga 1️⃣🔟🆕), story 6 rader med 5-7 emojis var, tidslinje 🕒📰🔍📍📈 + reaktioner. Returnera BARA JSON-array [{"cat":"⚽","title":[...],"story":[[...]]}].`;
  try{
    const r = await fetch(url,{method:'POST',headers:{'content-type':'application/json','authorization':`Bearer ${token}`},body:JSON.stringify({model,messages:[{role:'user',content:prompt}],temperature:0.7,max_tokens:2000})});
    if(!r.ok){ console.log('LLM fail', r.status, await r.text().then(t=>t.slice(0,300))); return null; }
    const j = await r.json();
    let txt = j.choices?.[0]?.message?.content || '';
    txt = txt.replace(/```json|```/g,'').trim();
    const arr = JSON.parse(txt);
    console.log('Agent-översättning OK');
    return arr.map((a,i)=>({id:i+1,cat:['🌦️','⚽','🌍','🍔','🎬'].includes(a.cat)?a.cat:'🌍',emojis:(a.title||[]).slice(0,5),image:`https://picsum.photos/seed/agent${hash(items[i]?.title||String(i))%9973}/1200/700`,size:i===0?'large':'small',story:(a.story||[]).slice(0,7)}));
  }catch(e){ console.log('LLM error', e.message); return null; }
}
async function main(){
  const date = (process.argv.find(a=>a.startsWith('--date='))||'').replace('--date=','') || new Date().toISOString().slice(0,10);
  let items=[];
  for(const url of RSS){ try{ const r=await fetch(url,{headers:{'user-agent':'tidning-utan-text'}}); if(r.ok) items.push(...parseRSS(await r.text())); }catch(e){} if(items.length>=8)break; }
  const seen=new Set(); items=items.filter(n=>n.title&&!seen.has(n.title)&&seen.add(n.title)).slice(0,5);
  console.log(`Hämtade ${items.length} nyheter`); items.forEach(n=>console.log(' -',n.title));
  let articles = items.length>=3 ? await agentTranslate(items) : null;
  if(!articles || articles.length<3){ console.log('Fallback dictionary'); articles = items.length>=3 ? dictTranslate(items) : null; }
  if(!articles){ const {execSync}=await import('child_process'); execSync(`node scripts/generate.mjs --date=${date}`,{stdio:'inherit'}); return; }
  const {writeFileSync,mkdirSync,existsSync}=await import('fs');
  mkdirSync('data/articles',{recursive:true});
  const out=JSON.stringify({date,articles},null,2);
  if(!existsSync(`data/articles/${date}.json`)) writeFileSync(`data/articles/${date}.json`,out);
  writeFileSync('articles.json',out);
  console.log(`OK ${date} -> ${articles.length} agent-artiklar`);
}
main();
