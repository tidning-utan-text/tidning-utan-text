// Genererar dagens tidning deterministiskt från datum-seed. Ingen text, bara emojis + picsum-seeds.
import { writeFileSync, mkdirSync, existsSync } from 'fs';
const date = process.argv[2]?.replace('--date=','') || new Date().toISOString().slice(0,10);
function hash(s){let h=0;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;return h;}
const h = hash(date);
const weatherSets = [[`🌧️`,`➡️`,`☀️`],[`⛅`,`🌤️`,`😎`],[`❄️`,`🌨️`,`🧣`],[`🌪️`,`🌊`,`⛵`]];
const sportSets = [[`⚽`,`🏟️`,`🎉`],[`🏀`,`⛹️`,`🏆`],[`🎾`,`🏓`,`🏅`],[`🏊`,`🌊`,`🥇`]];
const worldSets = [[`🌍`,`🔥`,`🌊`],[`🌳`,`🪓`,`🌱`],[`🏛️`,`🤝`,`✅`],[`🚇`,`🚧`,`🟢`]];
const foodSets = [[`🍔`,`👀`,`😍`],[`🍕`,`🔥`,`👏`],[`🍣`,`🐟`,`😋`],[`🍩`,`☕`,`🌙`]];
const cultSets = [[`🎬`,`🍿`,`🏆`],[`🎤`,`🎶`,`🎆`],[`🎭`,`👏`,`🔥`],[`📱`,`🤖`,`🛒`]];
const pick = (arr, n) => arr[(h+n)%arr.length];
const articles = [
  {id:1, cat:`🌦️`, emojis:pick(weatherSets,1), image:`https://picsum.photos/seed/vader${h%997}/1200/700`, size:'large'},
  {id:2, cat:`⚽`, emojis:pick(sportSets,2), image:`https://picsum.photos/seed/sport${h%997}/800/600`, size:'small'},
  {id:3, cat:`🌍`, emojis:pick(worldSets,3), image:`https://picsum.photos/seed/varld${h%997}/800/600`, size:'small'},
  {id:4, cat:`🍔`, emojis:pick(foodSets,4), image:`https://picsum.photos/seed/mat${h%997}/800/600`, size:'small'},
  {id:5, cat:`🎬`, emojis:pick(cultSets,5), image:`https://picsum.photos/seed/film${h%997}/800/600`, size:'small'},
];
mkdirSync('data/articles',{recursive:true});
const out = JSON.stringify({date, articles}, null, 2);
const dated = `data/articles/${date}.json`;
if(!existsSync(dated)) writeFileSync(dated, out);
writeFileSync('articles.json', out);
console.log(`OK ${date} -> articles.json + ${dated}`);
