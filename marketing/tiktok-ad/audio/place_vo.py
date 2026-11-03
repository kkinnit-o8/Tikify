"""Place natural voiceover takes on the film timeline UNTOUCHED: no time-stretch, no pause edits inside a phrase.
Each piece is a span of a take [from, to] (cut in its silences) whose first word (onset) lands at `at` film seconds.
Writes vo.wav (48 kHz stereo) and vo_segments.json. usage: python3 place_vo.py vo_pieces.json <out_dir> [--dur 21.2]"""
import argparse, json, wave
import numpy as np
ap = argparse.ArgumentParser(); ap.add_argument('spec'); ap.add_argument('out'); ap.add_argument('--dur', type=float, default=636 / 30)
a = ap.parse_args()
SR = 48000; spec = json.load(open(a.spec)); out = np.zeros(int(a.dur * SR), np.float32); cache = {}
def take(fn):
    if fn not in cache:
        w = wave.open(fn); assert w.getframerate() == SR; ch = w.getnchannels()
        cache[fn] = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32).reshape(-1, ch).mean(1) / 32768
    return cache[fn]
info = []
for p in spec['pieces']:
    x = take(p['take']); i0, i1 = int(p['from'] * SR), int(p['to'] * SR); seg = x[i0:i1].copy()
    fi, fo = int(.008 * SR), int(.03 * SR); seg[:fi] *= np.linspace(0, 1, fi); seg[-fo:] *= np.linspace(1, 0, fo)
    d = int(round((p['at'] - (p['onset'] - p['from'])) * SR))
    if d < 0: seg, d = seg[-d:], 0                                   # leading silence that would fall before t=0
    n = min(len(seg), len(out) - d); out[d:d + n] += seg[:n]
    info.append({'text': p['text'], 'on': p['at'], 'off': round(p['at'] + (p['to'] - p['onset']) - .03, 3)})
out *= .89 / np.abs(out).max()
st = np.repeat((np.clip(out, -1, 1) * 32767).astype(np.int16)[:, None], 2, 1)
with wave.open(f'{a.out}/vo.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes())
json.dump({'tempo': 1.0, 'note': 'natural takes placed untouched (no stretch)', 'phrases': info}, open(f'{a.out}/vo_segments.json', 'w'), indent=1)
print('\n'.join(f"{s['on']:6.2f}–{s['off']:6.2f}  {s['text']}" for s in info))
