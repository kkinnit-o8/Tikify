#!/bin/bash
# Render the film page to MP4 with N parallel headless Chromium workers (interleaved frames), optional sub-frame motion
# blur (blend.py), optional lens pass, then H.264 via ffmpeg.
#   ./render.sh <out.mp4> [sub=1] [workers=4] [subhi=0] [hiwin="a-b,c-d"]
# env: TOOLS (dir with capture.mjs/blend.py), HFT_BROWSER, WORK (frame dir), MBPS (24), LENS=1 (lens.py), FROM/TO
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
OUT="$(realpath -m "$1")"; SUB=${2:-1}; WK=${3:-4}; SUBHI=${4:-0}; HIWIN="${5:-}"
FPS=30; MBPS=${MBPS:-24}; TOOLS=${TOOLS:?set TOOLS}
WORK="${WORK:-${OUT%.*}.work}"; rm -rf "$WORK"; mkdir -p "$WORK/sub" "$WORK/frames" "$WORK/tmp"
export CAP_TMP="$WORK/tmp"
EXTRA=(); [ -n "$TO" ] && EXTRA+=(--to "$TO"); [ "$SUBHI" -gt 0 ] && EXTRA+=(--subhi "$SUBHI" --hiwin "$HIWIN")
DEST="$WORK/sub"; [ "$SUB" -le 1 ] && [ "$SUBHI" -le 0 ] && DEST="$WORK/frames"
T0=$(date +%s)
for i in $(seq 0 $((WK-1))); do
  F=$(python3 -c "print((round(${FROM:-0}*$FPS)+$i)/$FPS)")
  CAP_PORT=$((9600+i*13)) node "$TOOLS/capture.mjs" "$HERE/film/index.html" "$DEST" --from $F --every $WK --sub $SUB "${EXTRA[@]}" --jpg > "$WORK/log_$i.txt" 2>&1 &
done
wait
grep -h "SCENE ERRORS\|EXC\|did not" "$WORK"/log_*.txt | sort -u | head -8 || true
if [ "$DEST" = "$WORK/sub" ]; then python3 "$TOOLS/blend.py" "$WORK/sub" "$WORK/frames"; rm -rf "$WORK/sub"; fi
N=$(ls "$WORK/frames" | wc -l); echo "frames: $N"
[ "$LENS" = 1 ] && python3 "$TOOLS/lens.py" "$WORK/frames" --fps $FPS ${LENS_ARGS}
EXT=$(ls "$WORK/frames" | head -1 | sed 's/.*\.//')
ffmpeg -v error -y -framerate $FPS -start_number ${START:-0} -i "$WORK/frames/f_%05d.$EXT" -c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p \
  -b:v ${MBPS}M -maxrate $((MBPS*3/2))M -bufsize $((MBPS*2))M -color_primaries bt709 -color_trc bt709 -colorspace bt709 -movflags +faststart "$OUT"
rm -rf "$WORK/tmp"; [ "$KEEP" = 1 ] || rm -rf "$WORK"
echo "-> $OUT ($(( $(date +%s) - T0 )) s)"
