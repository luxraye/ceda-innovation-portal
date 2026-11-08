#!/bin/bash
# Usage: build-site.sh <appdir> <config.json> <port>
set -e
APP=$1; CFG=$2; PORT=$3
OUT=$(node -e "console.log(require('$CFG').out)")
BP=$(node -e "console.log(require('$CFG').bp)")
rm -rf "$OUT"; mkdir -p "$OUT"
cd "$APP"
(PORT=$PORT npx next start -p $PORT > /tmp/start-$PORT.log 2>&1 &)
for i in $(seq 1 60); do curl -s -o /dev/null "http://localhost:$PORT$BP/" && break; sleep 1; done
node /home/user/preview-tools/crawl.mjs "$CFG"
pkill -f "next start -p $PORT" || true; pkill -f next-server || true
cp -r public/. "$OUT"/ 2>/dev/null || true
[ -f src/app/favicon.ico ] && cp src/app/favicon.ico "$OUT/favicon.ico"
mkdir -p "$OUT/_next"; cp -r .next/static "$OUT/_next/"
cp /home/user/preview-tools/shim.js "$OUT/__preview-shim.js"
# prefix root-relative url() in CSS
node /home/user/preview-tools/fixcss.mjs "$OUT/_next/static" "$BP"
du -sh "$OUT"
