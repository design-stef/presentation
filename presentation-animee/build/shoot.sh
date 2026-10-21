#!/usr/bin/env bash
# Photographie chaque slide après ses animations (Chrome headless).
# Usage : bash build/shoot.sh <dossier de sortie> [délai ms] [numéros de slides…]
# Le serveur (node serve.mjs) doit tourner sur le port 4173.
OUT="$1"; BUDGET="${2:-6000}"; shift 2
CHROME="/c/Program Files/Google/Chrome/Application/chrome.exe"
mkdir -p "$OUT"
SLIDES="$*"; [ -z "$SLIDES" ] && SLIDES=$(seq 1 28)
for i in $SLIDES; do
  n=$(printf %02d "$i")
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --window-size=1920,1080 \
    --virtual-time-budget="$BUDGET" --screenshot="$OUT/s$n.png" \
    "http://localhost:4173/composition/index.html?capture#$i" >/dev/null 2>&1
done
