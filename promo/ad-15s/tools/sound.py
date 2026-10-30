"""Soundtrack for the Tikify ad: the supplied track from 4.044 s (one beat of intro, the drop on 0.566 s) + a quiet UI
foley layer synthesised from the film's own cues (clicks on click frames, keys per typed character, risers that END on
the needles). Writes music_only.wav and mix.wav (48 kHz stereo, 15.000 s, −14 LUFS-ish, peak ≤ −1 dBFS).

usage: python3 tools/sound.py <track.mp3> <cues.json> <out_dir>
       cues.json from: node tools/capture.mjs film/index.html /tmp --cues cues.json
"""
import json, os, subprocess, sys, wave
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import sound_kit as S

TRACK, CUES, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
START, DUR, SR = 4.044, 15.0, 48000          # 4.044 s = one beat (60/106 s) before the drop at 4.61 s
FADE_OUT = (14.45, 15.0)                     # the last hit (b25, 14.15 s) rings, then a short fade to silence
SFX_DB = -15.0                               # foley sits well under the music
os.makedirs(OUT, exist_ok=True)


def read_wav(p):
    with wave.open(p) as w:
        x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(float) / 32768
    return x.reshape(-1, 2).T


# ---- music: exact cut, 5 ms fade-in (no click), cosine fade-out
mp = os.path.join(OUT, 'music_cut.wav')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{START}', '-t', f'{DUR}', '-i', TRACK, '-ar', str(SR), '-ac', '2', '-c:a', 'pcm_s16le', mp], check=True)
mus = read_wav(mp); n = int(SR * DUR)
mus = np.pad(mus, ((0, 0), (0, max(0, n - mus.shape[1]))))[:, :n]
t = np.arange(n) / SR
fade = np.clip(t / .005, 0, 1) * (.5 + .5 * np.cos(np.pi * np.clip((t - FADE_OUT[0]) / (FADE_OUT[1] - FADE_OUT[0]), 0, 1)))
mus = mus * fade

# ---- foley from the picture's cues
S.init(DUR, seed=11, sr=SR)
d = json.load(open(CUES)); cues = d['cues']
keys = [c['t'] for c in cues if c['kind'] == 'key']
pops = 0
for c in cues:
    k, tc, name = c['kind'], c['t'], c['name']
    if k == 'ui': S.add(S.blip(1650, .07, .5), tc, .5, room=.2)
    elif k == 'decode': S.decode(tc, .42, g=.05, rate=55)
    elif k == 'pop':
        if name.startswith('dot'): S.add(S.wpop(760 + 95 * int(name[3:]), .5), tc, .55, pan=-.2 + .1 * int(name[3:]), room=.2)
        elif name == 'final': S.add(S.sparkle(2600, .5, .5), tc + .05, .5, hall=.3); S.add(S.wpop(1050, .5), tc, .5, room=.2)
        else: S.add(S.wpop(880 + 60 * (pops % 3), .5), tc, .5, room=.2); pops += 1
    elif k == 'riser': S.add_end(S.riser2(.42 if name == 'dive' else .3, g=.5), tc, .55, hall=.15)
    elif k == 'click': S.add(S.mclick(.6), tc, .75, pan=.15, room=.12)
    elif k == 'whoosh': S.add(S.paper(.3, .6), tc, .55, room=.15)
    elif k == 'tick': S.add(S.tick(.6), tc, .6); S.add(S.boop(520, 900, .14, .4), tc + .01, .4, room=.2)
    elif k == 'thunk': S.add(S.mclick(.6), tc, .7); S.add(S.pop(380, .5), tc, .4, room=.25)
for tk in keys: S.add(S.keyclick(.5, .35), tk, .32, pan=float(np.random.default_rng(int(tk * 1000)).uniform(-.25, .25)), room=.08)

sfx = S.BUS['sfx'] + S.BUS['duckfx'] + S.BUS['mus'] + S.BUS['drum'] + S.verb(S.BUS['hall'], S.IR_HALL) * .42 + S.verb(S.BUS['room'], S.IR_ROOM) * .38
sfx = sfx[:, :n] * fade
rms = lambda x: np.sqrt(np.mean(x ** 2) + 1e-12)
# level the foley against the music's RMS (only where foley is active), then mix
act = np.abs(sfx).max(0) > 1e-3
g = 10 ** (SFX_DB / 20) * rms(mus[:, act]) / max(rms(sfx[:, act]), 1e-9)
mix = mus + sfx * g


def write(path, x):
    x = x / max(1e-9, np.abs(x).max()) * 10 ** (-1.0 / 20)               # peak −1 dBFS
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(np.round(x.T * 32767).astype(np.int16).tobytes())
    print('wrote', path, f'{x.shape[1] / SR:.3f}s')


write(os.path.join(OUT, 'music_only.wav'), mus)
write(os.path.join(OUT, 'mix.wav'), mix)
print(f'foley gain {20 * np.log10(g):.1f} dB')
