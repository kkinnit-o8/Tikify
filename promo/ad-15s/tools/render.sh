#!/bin/bash
# Render the film page to MP4 on Linux: N headless Chromium workers (interleaved frames) → sub-frame motion blur → lens → H.264.
#   tools/render.sh <page.html> <out.mp4> [sub=1] [workers=4] [subhi=0] [hiwin="a-b,c-d"]
# env: FPS (30) CRF (14) FROM/TO (seconds) WORK (frame dir) LENS=1 (photographic pass) KEEP=1
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
PAGE="$1"; OUT="$(realpath -m "$2")"; SUB=${3:-1}; WK=${4:-4}; SUBHI=${5:-0}; HIWIN="${6:-}"
FPS=${FPS:-30}; CRF=${CRF:-14}
WORK="${WORK:-${OUT%.*}.work}"; rm -rf "$WORK"; mkdir -p "$WORK/sub" "$WORK/frames" "$WORK/tmp"
export CAP_TMP="$WORK/tmp" HFT_BROWSER="${HFT_BROWSER:-/opt/pw-browsers/chromium}"
EXTRA=(); [ -n "$TO" ] && EXTRA+=(--to "$TO")
[ "$SUBHI" -gt 0 ] && EXTRA+=(--subhi "$SUBHI" --hiwin "$HIWIN")
DEST="$WORK/sub"; [ "$SUB" -le 1 ] && [ "$SUBHI" -le 0 ] && DEST="$WORK/frames"
T0=$(date +%s)
for i in $(seq 0 $((WK-1))); do
  F=$(python3 -c "print((round(${FROM:-0}*$FPS)+$i)/$FPS)")
  CAP_PORT=$((9600+i*13)) node "$HERE/capture.mjs" "$PAGE" "$DEST" --from $F --every $WK --sub $SUB "${EXTRA[@]}" --jpg > "$WORK/log_$i.txt" 2>&1 &
done
wait
grep -h "SCENE ERRORS\|EXC\|did not" "$WORK"/log_*.txt | sort -u | head -8 || true
if [ "$DEST" = "$WORK/sub" ]; then python3 "$HERE/blend.py" "$WORK/sub" "$WORK/frames"; rm -rf "$WORK/sub"; fi
python3 - "$WORK/frames" "$FPS" "${FROM:-0}" "${TO:-15}" <<'PY'
import os, sys, re
d, fps, a, b = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), float(sys.argv[4])
have = set(int(re.match(r'f_(\d+)', f).group(1)) for f in os.listdir(d) if f.startswith('f_'))
miss = [n for n in range(round(a * fps), round(b * fps)) if n not in have]
if miss: sys.exit(f'render: {len(miss)} frames missing, e.g. {miss[:8]}')
PY
[ "$LENS" = 1 ] && python3 "$HERE/lens.py" "$WORK/frames" --fps $FPS ${LENS_ARGS}
EXT=$(ls "$WORK/frames" | head -1 | sed 's/.*\.//')
ffmpeg -v error -y -framerate $FPS -start_number $(ls "$WORK/frames" | head -1 | sed 's/f_0*\([0-9]*\)\..*/\1/;s/^$/0/') -i "$WORK/frames/f_%05d.$EXT" \
  -c:v libx264 -preset slow -crf $CRF -pix_fmt yuv420p -profile:v high -colorspace bt709 -color_primaries bt709 -color_trc bt709 -movflags +faststart "$OUT"
rm -rf "$WORK/tmp"; [ "$KEEP" = 1 ] || rm -rf "$WORK"
echo "-> $OUT  ($(( $(date +%s) - T0 )) s)"
