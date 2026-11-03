"""Assemble the voiceover from one natural Higgsfield take (seed_audio): cut it into phrases at its pauses (vo_cuts_*.json:
[label, start, end] in take seconds), shrink pauses inside a phrase to ≤ 60 ms, time-stretch with rubberband (pitch and
formants kept) and place the phrases on the film timeline so "Search no more." ends just before the drop (8.47 s).
The tempo is solved so the last phrase ends at --end. Writes vo.wav (48 kHz stereo) + vo_segments.json.
usage: python3 build_vo.py <take.wav> <cuts.json> <out_dir> [--end 8.33] [--tempo T]"""
import argparse, json, subprocess, sys, wave
import numpy as np

SR = 48000
ap = argparse.ArgumentParser()
ap.add_argument('take'); ap.add_argument('cuts'); ap.add_argument('out')
ap.add_argument('--end', type=float, default=8.33); ap.add_argument('--tempo', type=float, default=0)
a = ap.parse_args()
CUTS = json.load(open(a.cuts))
GAPS = [.05, .20, .08, .08, .12, .12, .07, .07, .07, .14]          # silence before each phrase (film s, after stretching)
PAD_IN, PAD_OUT, MAXP = .025, .05, .06

def read(fn):
    w = wave.open(fn); ch = w.getnchannels(); assert w.getframerate() == SR
    x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    return x.reshape(-1, ch).mean(1)

def squeeze(seg):
    """shorten internal pauses (< thr for > MAXP) to MAXP, with 10 ms crossfades"""
    hop = int(SR * .005); n = len(seg) // hop
    db = 20 * np.log10(np.array([np.sqrt((seg[i*hop:(i+1)*hop]**2).mean()) for i in range(n)]) + 1e-9)
    thr = db.max() - 34; quiet = db < thr
    out, i, last = [], 0, 0
    while i < n:
        if quiet[i]:
            j = i
            while j < n and quiet[j]: j += 1
            if (j - i) * .005 > MAXP and i > 0 and j < n:            # internal pause only
                keep = int(MAXP / .005); cut0, cut1 = (i + keep // 2) * hop, (j - keep // 2) * hop
                out.append(seg[last:cut0]); last = cut1
            i = j
        else: i += 1
    out.append(seg[last:])
    res = out[0]
    for o in out[1:]:                                               # crossfade joins
        f = min(int(.01 * SR), len(res), len(o))
        ramp = np.linspace(0, 1, f, dtype=np.float32)
        res = np.concatenate([res[:-f], res[-f:] * (1 - ramp) + o[:f] * ramp, o[f:]]) if f else np.concatenate([res, o])
    return res

def stretch(x, tempo):
    p = subprocess.run(['ffmpeg', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-i', '-',
                        '-af', f'rubberband=tempo={tempo}:formant=preserved:pitchq=quality:transients=crisp',
                        '-f', 'f32le', '-ar', str(SR), '-ac', '1', '-'], input=x.astype(np.float32).tobytes(), capture_output=True)
    if p.returncode: sys.exit(p.stderr.decode()[:400])
    return np.frombuffer(p.stdout, dtype=np.float32)

x = read(a.take)
segs = []
for (label, s0, s1) in CUTS:
    seg = x[int(max(0, s0 - PAD_IN) * SR):int((s1 + PAD_OUT) * SR)].copy()
    seg = squeeze(seg)
    fi, fo = int(.006 * SR), int(.03 * SR)
    seg[:fi] *= np.linspace(0, 1, fi); seg[-fo:] *= np.linspace(1, 0, fo) ** 1.5
    segs.append((label, seg))
speech = sum(len(s) for _, s in segs) / SR - len(segs) * (PAD_IN + PAD_OUT)
tempo = a.tempo or round(speech / (a.end - sum(GAPS)), 3)
print(f'speech after squeeze {speech:.2f} s → tempo {tempo}')
track = np.zeros(int(SR * 10), np.float32); t, info = 0.0, []
for (label, seg), gap in zip(segs, GAPS):
    st = stretch(seg, tempo); t += gap
    i = int(round((t - PAD_IN / tempo) * SR)); track[i:i + len(st)] += st
    on, off = t, t + len(st) / SR - (PAD_IN + PAD_OUT) / tempo
    info.append({'text': label, 'on': round(on, 3), 'off': round(off, 3)}); t = off
print('\n'.join(f"{s['on']:6.2f}–{s['off']:5.2f}  {s['text']}" for s in info))
print(f'VO ends at {t:.2f} s (tempo {tempo})')
track = track[:int(SR * (t + .4))]; track *= .89 / np.abs(track).max()
st = np.repeat((np.clip(track, -1, 1) * 32767).astype(np.int16)[:, None], 2, 1)
with wave.open(f'{a.out}/vo.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes())
json.dump({'tempo': tempo, 'phrases': info}, open(f'{a.out}/vo_segments.json', 'w'), indent=1)
