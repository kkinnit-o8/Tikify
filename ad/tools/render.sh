#!/bin/bash
# render.sh <page.html> <out.mp4> [sub=1] [workers=4] [subhi=0] [hiwin="a-b,c-d"]
#   draft:  render.sh film/index.html out/draft.mp4 1 4
#   final:  LENS=1 render.sh film/index.html out/final_nosound.mp4 4 4 10 "5.8-6.4,9.6-10.1,17.2-17.9"
# env: FPS (30) CRF (16) FROM/TO (s) WORK (frame dir) KEEP=1 (keep frames) LENS=1 LENS_ARGS="..."
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
PAGE="$1"; OUT="$(cd "$(dirname "$2")" && pwd)/$(basename "$2")"; SUB=${3:-1}; WK=${4:-4}; SUBHI=${5:-0}; HIWIN="${6:-}"
FPS=${FPS:-30}; CRF=${CRF:-16}
WORK="${WORK:-${OUT%.*}.work}"; [ "$KEEP" = 1 ] || rm -rf "$WORK"; mkdir -p "$WORK/sub" "$WORK/frames" "$WORK/tmp"
export CAP_TMP="$WORK/tmp"
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
END=${TO:-$(grep -ho '"duration":[0-9.]*' "$WORK"/log_0.txt | head -1 | cut -d: -f2)}
python3 - "$WORK/frames" "$FPS" "${FROM:-0}" "$END" <<'PY'
import os, sys, re
d, fps, a, b = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), sys.argv[4]
have = set(int(re.match(r'f_(\d+)', f).group(1)) for f in os.listdir(d) if f.startswith('f_'))
if not have: sys.exit('render: no frames rendered — see log_*.txt')
n0, n1 = round(a * fps), round(float(b) * fps)
miss = [n for n in range(n0, n1) if n not in have]
if miss: sys.exit(f'render: {len(miss)} frames missing, e.g. {miss[:8]}')
print('frames ok', n0, '..', n1 - 1)
PY
[ "$LENS" = 1 ] && python3 "$HERE/lens.py" "$WORK/frames" --fps $FPS $LENS_ARGS
EXT=$(ls "$WORK/frames" | head -1 | sed 's/.*\.//')
ffmpeg -v error -y -framerate $FPS -start_number $(python3 -c "print(round(${FROM:-0}*$FPS))") -i "$WORK/frames/f_%05d.$EXT" \
  -c:v libx264 -preset slow -crf $CRF -pix_fmt yuv420p -profile:v high -colorspace bt709 -color_primaries bt709 -color_trc bt709 \
  -movflags +faststart "$OUT"
rm -rf "$WORK/tmp"; [ "$KEEP" = 1 ] || rm -rf "$WORK"
echo "-> $OUT  ($(( $(date +%s) - T0 )) s)"
