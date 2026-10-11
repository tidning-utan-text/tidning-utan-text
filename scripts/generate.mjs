// Genererar dagens tidning deterministiskt från datum-seed. Långa emoji-artiklar, ingen synlig text.
import { writeFileSync, mkdirSync, existsSync } from 'fs';
const date = process.argv[2]?.replace('--date=','') || new Date().toISOString().slice(0,10);
function hash(s){let h=0;for(const c of s)h=(h*31+c.charCodeAt(0))>>>0;return h;}
const h = hash(date);
const base = [
  {cat:`🌦️`, title:[`🌅`,`🌤️`,`⛈️`,`🌈`,`🌃`], seed:`vader`, story:[
    [`🕗`,`🌅`,`🌤️`,`😎`,`🚶`,`🌳`,`😊`],
    [`🕙`,`☁️`,`☁️`,`🌬️`,`🧥`,`😟`,`🚶`],
    [`🕛`,`🌧️`,`🌧️`,`☂️`,`💧`,`😞`,`🏃`],
    [`🕑`,`⛈️`,`⚡`,`💥`,`🌊`,`😱`,`🏠`],
    [`🕓`,`🌦️`,`🌈`,`😍`,`📸`,`🌳`,`👏`],
    [`🕕`,`🌤️`,`🚴`,`🐕`,`🌳`,`😊`,`💨`],
    [`🕙`,`🌙`,`⭐`,`😴`,`🛌`,`🌃`,`💤`]]},
  {cat:`⚽`, title:[`⚽`,`🏟️`,`👟`,`🏆`,`🎉`], seed:`sport`, story:[
    [`🏟️`,`👥`,`🎺`,`📣`,`🎉`,`⚽`,`🏃`],
    [`🕗`,`🏃`,`💨`,`🥅`,`❌`,`😩`,`😞`],
    [`🕘`,`👟`,`💥`,`⚽`,`🥅`,`🎉`,`😊`],
    [`🕙`,`🏃`,`👟`,`⚽`,`🥅`,`🎉`,`👏`],
    [`🕛`,`👟`,`⚽`,`⚽`,`🥅`,`🔥`,`😍`],
    [`🕐`,`🤕`,`🟥`,`😱`,`😭`,`🩹`,`🤝`],
    [`🏁`,`🏆`,`🎉`,`🍾`,`🎊`,`👏`,`🔥`]]},
  {cat:`🌍`, title:[`🚧`,`🏗️`,`🚗`,`🚦`,`🏙️`], seed:`stad`, story:[
    [`🕗`,`🚗`,`🚙`,`🚗`,`🚦`,`😤`,`😡`],
    [`🕘`,`🚧`,`⛔`,`🏗️`,`👷`,`🔨`,`🚗`],
    [`🕙`,`🚗`,`↗️`,`🗺️`,`😵‍💫`,`🌀`,`🚙`],
    [`🕛`,`🏗️`,`🧱`,`🏙️`,`👷`,`🔧`,`👏`],
    [`🕑`,`🚌`,`🚋`,`🛤️`,`🚏`,`👥`,`😊`],
    [`🕓`,`🚦`,`🟢`,`🚗`,`💨`,`😊`,`🎉`],
    [`🌃`,`🏙️`,`💡`,`🚗`,`😴`,`🌙`,`💤`]]},
  {cat:`🍔`, title:[`🍕`,`👨‍🍳`,`😋`,`⭐`,`🍽️`], seed:`mat`, story:[
    [`😋`,`🍽️`,`👫`,`🚶`,`🍕`,`👀`,`😊`],
    [`🥖`,`🧀`,`🫒`,`👍`,`😊`,`🍽️`,`👏`],
    [`🍕`,`♨️`,`🧀`,`🍅`,`😍`,`🤤`,`👏`],
    [`👄`,`🍕`,`😋`,`👍`,`⭐`,`😍`,`🎉`],
    [`🍨`,`🍓`,`🍫`,`☕`,`😊`,`😋`,`👍`],
    [`⭐`,`⭐`,`⭐`,`🍕`,`🎉`,`❤️`,`👏`]]},
  {cat:`🎬`, title:[`🎶`,`🎸`,`🎤`,`🎆`,`👏`], seed:`kultur`, story:[
    [`🌙`,`👥`,`🎟️`,`🚶`,`🎶`,`😊`,`👏`],
    [`🎭`,`💡`,`🎶`,`👏`,`😊`,`🎸`,`🎤`],
    [`🎸`,`🥁`,`🎤`,`🔥`,`📣`,`🎉`,`😍`],
    [`👥`,`🎶`,`💃`,`🕺`,`🔥`,`😍`,`👏`],
    [`🎆`,`🎆`,`👏`,`😭`,`😍`,`🎤`,`🎸`],
    [`👕`,`💿`,`☕`,`🚶`,`🌙`,`😴`,`💭`]]}
];
const articles = base.map((a,i)=>({
  id:i+1, cat:a.cat, emojis:a.title,
  image:`https://picsum.photos/seed/${a.seed}${h%997}/1200/700`,
  size:i===0?'large':'small', story:a.story
}));
mkdirSync('data/articles',{recursive:true});
const out = JSON.stringify({date, articles}, null, 2);
const dated = `data/articles/${date}.json`;
if(!existsSync(dated)) writeFileSync(dated, out);
writeFileSync('articles.json', out);
console.log(`OK ${date} -> ${articles.length} långartiklar`);
