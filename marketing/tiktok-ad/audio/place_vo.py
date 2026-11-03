"""Place ONE natural voiceover take on the film timeline, untouched: no time-stretch, no pause edits, just a trim so the
first word starts at --at (film s). Writes vo.wav (48 kHz stereo) + vo_segments.json (phrase onsets, film s).
usage: python3 place_vo.py <take.wav> <out_dir> --onset 0.36 --at 0.05"""
import argparse, json, wave
import numpy as np
ap = argparse.ArgumentParser(); ap.add_argument('take'); ap.add_argument('out')
ap.add_argument('--onset', type=float, required=True, help='first speech onset in the take (s)')
ap.add_argument('--at', type=float, default=.05, help='where that onset lands in the film (s)')
a = ap.parse_args()
w = wave.open(a.take); sr = w.getframerate(); ch = w.getnchannels(); assert sr == 48000
x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768; x = x.reshape(-1, ch).mean(1)
shift = a.at - a.onset                                     # negative: trim leading silence
i0 = int(round(max(0, -shift) * sr)); y = x[i0:]
if shift > 0: y = np.concatenate([np.zeros(int(round(shift * sr)), np.float32), y])
f = int(.01 * sr); y[:f] *= np.linspace(0, 1, f)             # click-free start (the trimmed part is silence)
y *= .89 / np.abs(y).max()
st = np.repeat((np.clip(y, -1, 1) * 32767).astype(np.int16)[:, None], 2, 1)
with wave.open(f'{a.out}/vo.wav', 'wb') as o:
    o.setnchannels(2); o.setsampwidth(2); o.setframerate(sr); o.writeframes(st.tobytes())
print(f'take placed with shift {shift:+.3f} s (no stretch) → {a.out}/vo.wav')
