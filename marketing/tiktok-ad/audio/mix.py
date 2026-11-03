"""Soundtrack for the Tikify ad: the supplied track from 16.72 s (on the beat; drop at film 8.47 s), the voiceover on top
with the music ducked under it, and a few quiet picture sounds (whips, taps, pops, a riser into the dive) synthesised
with sound_kit (numpy only). Loudness: −14 LUFS integrated, −1.5 dBTP (ffmpeg loudnorm, two passes).
usage: python3 mix.py <track.mp3> <vo.wav> <sound_kit dir> <out_dir> [--start 16.72] [--dur 19.0667]"""
import argparse, json, subprocess, sys, wave
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument('track'); ap.add_argument('vo'); ap.add_argument('kit'); ap.add_argument('out')
ap.add_argument('--start', type=float, default=16.72); ap.add_argument('--dur', type=float, default=572 / 30)
a = ap.parse_args()
sys.path.insert(0, a.kit); import sound_kit as S
SR = 48000; N = int(round(a.dur * SR))

def decode(path, start=0.0, dur=None):
    cmd = ['ffmpeg', '-v', 'error', '-ss', str(start), '-i', path] + (['-t', str(dur)] if dur else []) + ['-ac', '2', '-ar', str(SR), '-f', 'f32le', '-']
    x = np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, dtype=np.float32).reshape(-1, 2).T.astype(np.float64)
    return x

mus = decode(a.track, a.start, a.dur + .1)[:, :N]
mus = np.pad(mus, ((0, 0), (0, N - mus.shape[1])))
vo = decode(a.vo)[:, :N]; vo = np.pad(vo, ((0, 0), (0, N - vo.shape[1])))
# --- levels (in LUFS, as heard): the drop is the loudest part; the voice sits 1 LU under it and ~8 LU over the
#     (ducked) bass-less breakdown ---
def lufs(args):
    o = subprocess.run(['ffmpeg', '-hide_banner'] + args + ['-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float([l for l in o.split('Integrated loudness')[-1].splitlines() if 'I:' in l][0].split()[1])
DROP = 8.47
L_brk = lufs(['-ss', str(a.start), '-t', str(DROP - .1), '-i', a.track])
L_drop = lufs(['-ss', str(a.start + DROP + .1), '-t', '8.3', '-i', a.track])
L_vo = lufs(['-t', str(DROP), '-i', a.vo])
L_TARGET = -14.0
mus *= 10 ** ((L_TARGET - L_drop) / 20)
vo *= 10 ** ((L_TARGET - 6.0 - L_vo) / 20)
print(f'music breakdown {L_brk:.1f} / drop {L_drop:.1f} LUFS, voice {L_vo:.1f} LUFS → drop {L_TARGET}, voice {L_TARGET - 6.0}')

# --- duck the music under the voice (smoothed VO envelope, −5 dB at full speech) ---
env = np.sqrt(np.convolve(vo[0] ** 2, np.ones(int(.03 * SR)) / int(.03 * SR), 'same'))
env = np.minimum(1, env / (np.percentile(env[env > 1e-4], 70) + 1e-9))
att, rel = np.exp(-1 / (.015 * SR)), np.exp(-1 / (.25 * SR)); sm = np.zeros(N); v = 0.0
for i in range(0, N, 32):                                           # block-wise one-pole follower (fast enough)
    e = env[i:i + 32].max(); v = att * v + (1 - att) * e if e > v else rel * v + (1 - rel) * e; sm[i:i + 32] = v
gain = 10 ** (-6 * sm / 20)
# the song's drop is mostly sub-bass (only ~1 LU louder than the breakdown): hold the breakdown 4 dB down and open it up
# into the drop, so the drop reads as the loudest moment
tt = np.arange(N) / SR
ramp = np.clip((tt - 7.95) / (8.42 - 7.95), 0, 1); ramp = ramp * ramp * (3 - 2 * ramp)
gain *= 10 ** (-4 * (1 - ramp) / 20)
# +2 dB ride on the first bar after the drop, easing back to 0 dB by the next bar
ride = np.interp(tt, [8.47, 10.59, 12.71], [2, 2, 0], left=0, right=0)
gain *= 10 ** (ride / 20)
mus *= gain
# high-pass the music below ~120 Hz until the drop (the breakdown's bass tail), opening at 8.47 in 10 ms:
# the drop then brings ALL the sub-bass in at once
cut = int(8.50 * SR); seg = mus[:, :cut]
F = np.fft.rfft(seg, axis=1); fr = np.fft.rfftfreq(seg.shape[1], 1 / SR)
F *= (1 / np.sqrt(1 + (120 / np.maximum(fr, 1e-3)) ** 8))[None, :]          # 4th-order-like magnitude response
hp = np.fft.irfft(F, n=seg.shape[1], axis=1)
w = np.clip((tt[:cut] - 8.46) / .01, 0, 1)
mus[:, :cut] = hp * (1 - w) + seg * w

# --- picture sounds ---
S.init(a.dur, seed=11)

def put(sig, t, g, pan=0.0):
    sig = np.asarray(sig, float); i = int(round(t * SR)); n = min(len(sig), N - i)
    if n <= 0 or i < 0: return
    l, r = np.cos((pan + 1) * np.pi / 4) * 1.4142, np.sin((pan + 1) * np.pi / 4) * 1.4142
    sfx[0, i:i + n] += sig[:n] * g * l; sfx[1, i:i + n] += sig[:n] * g * r
def put_end(sig, t, g, pan=0.0): put(sig, t - len(sig) / SR, g, pan)
sfx = np.zeros((2, N))
put_end(S.whoosh(.22, 400, 1500, 2500, 9000, .4), 1.40 + .04, .28, -.3)     # whip "here,"
put_end(S.whoosh(.22, 400, 1500, 2500, 9000, .4), 1.90 + .04, .28, .3)      # whip "there,"
put(S.whoosh(.7, 3000, 9000, 300, 1200, .4), 2.30, .22)                     # pull back to the wall
put(S.pop(700, .3), 3.46, .25)                                              # sound card born
for t in (6.28, 6.48): put(S.thunk(.5), t, .35)                             # bass boosted
put(np.asarray(S.whoosh(.16, 2000, 6000, 3000, 12000, .3)), 6.98, .15)      # glitch
put_end(S.riser2(.75, f0=200, f1=2600, g=.4), 8.47, .32)                    # dive into the capsule
imp = np.asarray(S.impact2(.8, decay=3.2, d=1.4)); put(imp / np.abs(imp).max(), 8.47, .30)   # weight under the drop
for t, g in [(10.02, .5), (10.31, .5), (10.84, .5), (11.30, .45), (11.66, .5), (12.18, .5), (13.24, .45)]:
    put(S.mclick(.3), t, g)                                                 # taps on glass
put(S.pop(1100, .3), 11.76, .22)                                            # toast
for k, tp in enumerate((14.82, 15.09, 15.61)): put(S.pop(820 + 140 * k, .3), tp, .28)   # feature pills (on the track's hits)
put(np.asarray(S.thunk(.45)), 9.27, .22)                                   # the strong hit at 9.27 (icon pulse)
put(S.whoosh(.5, 300, 1200, 2500, 9000, .4), 16.52, .2)                     # phone closes into the icon

mix = mus + vo * 1.0 + sfx
# fade out before the stab that starts at 18.80 (a new hit would be chopped at the loop point), silence after
fo = np.interp(tt, [18.30, 18.78], [1, 0]) ** 2; mix *= fo[None, :]
raw = f'{a.out}/mix_raw.wav'
with wave.open(raw, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(mix.T * .5, -1, 1) * 32767).astype(np.int16).tobytes())   # -6 dB headroom; loudnorm restores
# --- loudness: ONE static gain to -14 LUFS, then a true-peak limiter (loudnorm's dynamic mode would flatten the drop) ---
I_raw = lufs(['-i', raw])
g = -14.0 - I_raw
for _ in range(3):                                                 # the limiter takes a little loudness: correct for it
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', raw, '-af', f'volume={g:.2f}dB,alimiter=limit=0.84:attack=1:release=50:level=false',
                    '-ar', str(SR), '-c:a', 'pcm_s16le', f'{a.out}/mix.wav'], check=True)
    I = lufs(['-i', f'{a.out}/mix.wav']); g += -14.0 - I
    if abs(I + 14.0) < .15: break
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', f'{a.out}/mix.wav', '-c:a', 'aac', '-b:a', '256k', f'{a.out}/mix.m4a'], check=True)
p2 = subprocess.run(['ffmpeg', '-hide_banner', '-i', f'{a.out}/mix.wav', '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
print('\n'.join(l.strip() for l in p2.splitlines()[-12:] if any(k in l for k in ('I:', 'LRA:', 'Peak:'))))
print('music start', a.start, 'dur', round(a.dur, 4), '->', a.out + '/mix.wav')
