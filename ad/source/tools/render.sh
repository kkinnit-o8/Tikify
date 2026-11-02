#!/bin/bash
# Linux port of render_film.sh: N interleaved headless-Chromium workers -> optional sub-frame blur -> frames dir.
#   render.sh <page.html> <frames_out_dir> [sub=1] [workers=4] [subhi=0] [hiwin="a-b,c-d"]
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
PAGE="$1"; OUT="$(realpath -m "$2")"; SUB=${3:-1}; WK=${4:-4}; SUBHI=${5:-0}; HIWIN="${6:-}"
FPS=30
# set HFT_BROWSER=/path/to/chrome if no Chromium is found in the usual places (capture.mjs lists them)
WORK="$OUT.work"; rm -rf "$WORK" "$OUT"; mkdir -p "$WORK/sub" "$WORK/tmp" "$OUT"
export CAP_TMP="$WORK/tmp"
EXTRA=(); [ "$SUBHI" -gt 0 ] && EXTRA+=(--subhi "$SUBHI" --hiwin "$HIWIN")
DEST="$WORK/sub"; [ "$SUB" -le 1 ] && [ "$SUBHI" -le 0 ] && DEST="$OUT"
T0=$(date +%s)
for i in $(seq 0 $((WK-1))); do
  F=$(python3 -c "print($i/$FPS)")
  CAP_PORT=$((9600+i*13)) node "$HERE/capture.mjs" "$PAGE" "$DEST" --from $F --every $WK --sub $SUB "${EXTRA[@]}" --jpg > "$WORK/log_$i.txt" 2>&1 &
done
wait
grep -h "SCENE ERRORS\|EXC\|did not\|Error" "$WORK"/log_*.txt | sort -u | head -8 || true
if [ "$DEST" = "$WORK/sub" ]; then python3 "$HERE/blend.py" "$WORK/sub" "$OUT"; fi
N=$(ls "$OUT" | grep -c '^f_') ; echo "frames: $N  ($(( $(date +%s) - T0 )) s)"
rm -rf "$WORK"
