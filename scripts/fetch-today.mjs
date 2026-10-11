// Byggsteg 1 (Pi-cron): hämtar dagens RSS + riktiga og:image.
// Skriver build-input som INNEHÅLLER TEXT och därför aldrig committas (ligger i /tmp).
// Anrop: node scripts/fetch-today.mjs /tmp/opencode/tidning-nyheter.json
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
const RSS = ['https://www.svt.se/nyheter/rss.xml', 'https://www.svt.se/sport/rss.xml'];
const outPath = process.argv[2] || '/tmp/opencode/tidning-nyheter.json';
function clean(s) { return (s || '').replace(/<!\[CDATA\[|\]\]>/g, '').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').trim(); }
async function fetchOgImage(url) {
  if (!url || !url.startsWith('http')) return null;
  try {
    const c = new AbortController(); const t = setTimeout(() => c.abort(), 12000);
    const r = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0 (tidning-utan-text)' }, signal: c.signal });
    clearTimeout(t);
    if (!r.ok) return null;
    const html = await r.text();
    const m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    let img = m?.[1] || null;
    if (img?.startsWith('//')) img = 'https:' + img;
    if (img?.includes('logo')) return null;
    return img;
  } catch { return null; }
}
const items = [];
for (const url of RSS) {
  try {
    const r = await fetch(url, { headers: { 'user-agent': 'tidning-utan-text' } });
    if (!r.ok) continue;
    const xml = await r.text();
    for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
      const b = m[1];
      items.push({
        title: clean((b.match(/<title>([\s\S]*?)<\/title>/) || [])[1]),
        desc: clean((b.match(/<description>([\s\S]*?)<\/description>/) || [])[1]),
        link: clean((b.match(/<link>([\s\S]*?)<\/link>/) || [])[1]),
      });
    }
  } catch (e) { console.error('RSS fail', url, e.message); }
  if (items.length >= 10) break;
}
const seen = new Set();
const top = items.filter(n => n.title && !seen.has(n.title) && seen.add(n.title)).slice(0, 5);
if (top.length < 3) { console.error(`För få nyheter (${top.length}), avbryter`); process.exit(1); }
for (const n of top) {
  n.image = await fetchOgImage(n.link);
  console.log(n.image ? `Bild OK: ${n.image.slice(0, 70)}` : `Bild saknas: ${n.title.slice(0, 50)}`);
}
const date = new Date().toISOString().slice(0, 10);
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify({ date, items: top }, null, 2));
console.log(`OK ${date} -> ${top.length} nyheter i ${outPath}`);
