#!/bin/bash
# stills.sh <page.html[?query]> <out_dir> t1,t2,...  → PNG stills + a labelled contact sheet (sheet.jpg)
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
OUT="$(mkdir -p "$2" && cd "$2" && pwd)"; rm -f "$OUT"/still_*.png
CAP_TMP="$OUT" CAP_PORT=${CAP_PORT:-9333} node "$HERE/capture.mjs" "$1" "$OUT" --stills "$3" 2>&1 | grep -v "^comp:" | tail -4
python3 "$HERE/sheet.py" "$OUT" "$OUT/sheet.jpg" --cols ${COLS:-4} --width ${SW:-360}
