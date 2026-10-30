#!/bin/bash
# Exact stills at given times + one labelled contact sheet:  tools/stills.sh <page.html[?query]> <out_dir> t1,t2,...
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
OUT="$(realpath -m "$2")"; rm -rf "$OUT"; mkdir -p "$OUT"
HFT_BROWSER="${HFT_BROWSER:-/opt/pw-browsers/chromium}" CAP_TMP="$OUT" node "$HERE/capture.mjs" "$1" "$OUT" --stills "$3" 2>&1 | grep -v "^comp:" | tail -4
python3 "$HERE/sheet.py" "$OUT" "$OUT/sheet.jpg" --cols ${COLS:-3} --width ${SW:-640}
