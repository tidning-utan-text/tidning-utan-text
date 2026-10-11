#!/bin/bash
# Daglig utgåva på Pi:en. Jag (samma agent som chefen) översätter nyheter till emojis.
# Körs via crontab vardagar 05:00. Logg: /tmp/opencode/tidning-daily.log
set -u
REPO=/home/banddans/tidning-utan-text
NEWS=/tmp/opencode/tidning-nyheter.json
LOG=/tmp/opencode/tidning-daily.log
OPENCODE=/home/banddans/.opencode/bin/opencode
MODEL=opencode/muse-spark-1.3-contributor-free
export GIT_SSH_COMMAND="ssh -i $HOME/.ssh/tidning-utan-text_ed25519 -o StrictHostKeyChecking=no"
mkdir -p /tmp/opencode
echo "===== $(date '+%F %T') start =====" >>"$LOG"

cd "$REPO" || exit 1
git pull --ff-only origin main >>"$LOG" 2>&1 || { echo "git pull fail" >>"$LOG"; exit 1; }

node scripts/fetch-today.mjs "$NEWS" >>"$LOG" 2>&1 || { echo "fetch fail" >>"$LOG"; exit 1; }

"$OPENCODE" run --auto -m "$MODEL" -f "$NEWS" \
  "Du är översättar-agent på Tidning utan text. Läs bifogad JSON med dagens 5 verkliga nyheter (title/desc/link/image).
Skriv ENDAST två filer i $REPO: articles.json och data/articles/DATE.json där DATE är fältet date i JSON:en.
Varje artikel: id 1-5, cat en av 🌦️⚽🌍🍔🎬, emojis=titel med exakt 5 emojis, image=nyhetens image-fält eller picsum-fallback https://picsum.photos/seed/nyhetID/1200/700, size=large för id 1 annars small, story=6 rader med 5-7 emojis var som tidslinje 🕒📰🔍📍📈 plus känsla.
HÅRDA REGLER: inga ASCII-bokstäver/siffror i cat/emojis/story (alltså inga 1️⃣🔟🆕, inga siffror i klartext, använd upprepning för antal och klock-emojis 🕗🕛🕕 för tid). alt-taggar ska vara tomma.
Verifiera själv med: python3 -c \"import json,re;d=json.load(open('articles.json'));t=' '.join(sum([a['emojis']+sum(a['story'],[]) for a in d['articles']],[]));assert not re.search(r'[A-Za-z0-9]',t),'ASCII hittad';print('ASCII-kontroll PASS')\".
Ändra inga andra filer. Svara kort med antal artiklar och PASS/FAIL." >>"$LOG" 2>&1 || { echo "agent fail" >>"$LOG"; exit 1; }

python3 textpolis.py index.html >>"$LOG" 2>&1 || { echo "textpolis FAIL" >>"$LOG"; exit 1; }
git add articles.json data/articles/*.json
git diff --staged --quiet && { echo "ingen ändring" >>"$LOG"; exit 0; }
git -c user.name="chefen-pi" -c user.email="chefen-pi@example.com" commit -m "🌍🌦️⚽🍔🎬" -m "$(date -u +%F)" >>"$LOG" 2>&1
git push origin main >>"$LOG" 2>&1 || { echo "push fail" >>"$LOG"; exit 1; }
echo "===== $(date '+%F %T') KLAR =====" >>"$LOG"
