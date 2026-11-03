"""Beat-sync check: where does the PICTURE change most, and how close is that to the music's beat grid?
    python3 tools/sync_check.py out/tikify_tiktok_ad_9x16_nosound.mp4
Decodes the video small (ffmpeg), measures the mean absolute change between consecutive frames, finds the local peaks of
that 'visual onset' curve and prints, for each, the nearest beat of the grid in film/lib.js (0.188 + 0.619·k s).
"""
import subprocess, sys
import numpy as np

src = sys.argv[1]
W, H, FPS = 54, 96, 30
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-vf', f'scale={W}:{H}', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'],
                     capture_output=True, check=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
d = np.r_[0, np.abs(np.diff(fr, axis=0)).mean((1, 2))]           # change INTO frame n
t = np.arange(len(d)) / FPS
beats = .188 + .619 * np.arange(31)
half = .188 + .3095 * np.arange(62)
thr = np.percentile(d, 85)
pk = [i for i in range(1, len(d) - 1) if d[i] > thr and d[i] >= d[i - 1] and d[i] >= d[i + 1]]
print(f'{len(fr)} frames · {len(pk)} visual peaks above the 85th percentile ({thr:.2f})')
err = []
for i in pk:
    b = beats[np.argmin(np.abs(beats - t[i]))]; h = half[np.argmin(np.abs(half - t[i]))]
    e = (t[i] - h) * 1000; err.append(abs(e))
    print(f'  {t[i]:6.3f}s  change {d[i]:5.2f}   nearest beat {b:6.3f} ({(t[i] - b) * 1000:+5.0f} ms)   nearest half-beat {e:+5.0f} ms')
print(f'median |error| to the half-beat grid: {np.median(err):.0f} ms (one frame = 33 ms)')
