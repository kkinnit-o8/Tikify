"""Single source of truth for the film timeline (timeline.json) + the soundtrack mix (mix.wav).
Video time = song time − S0. Voice lines placed so "Tikify" lands just before the drop."""
import json, numpy as np, subprocess, os
SR = 48000
BASE = '/tmp/claude-0/-home-user-Tikify/ece3f78c-d3dd-5dde-b884-0f5893502a95/scratchpad'
AUD = BASE + '/audio'; VOI = BASE + '/voice'
DROP_SONG = 11.29          # first downbeat of the drop in the song
BPM = 168.9; BEAT = 60 / BPM; BAR = 4 * BEAT
DROP_V = 9.15              # where the drop lands in the video
S0 = DROP_SONG - DROP_V    # song time at video 0
BARS = 16
END_SONG = DROP_SONG + BARS * BAR          # 34.03
END_V = END_SONG - S0                       # 31.89
DUR = round(END_V + 0.06, 2)                # 31.95
V1 = 0.30   # voice line 1 start (file v1.wav)
V2 = 6.94   # voice line 2 start (file v2.wav)
# word timings inside the voice files (faster-whisper + energy onset)
W1 = [('Uhhhh,', 0.49, 1.45), ('why', 1.52, 2.32), ("can't", 2.32, 3.12), ('I', 3.12, 3.16), ('find', 3.16, 3.36), ('this', 3.36, 3.56),
      ('TikTok', 3.56, 3.86), ('sound', 3.86, 4.26), ('anywhere?', 4.26, 4.76)]
W2 = [("What's", 0.62, 1.14), ('Tikify?', 1.14, 1.96)]

def chars(words, off, lead=0.08):
    """per-character reveal times: each word's letters spread across its spoken span (typing slightly leads the voice)."""
    out = []; text = ''
    for i, (w, a, b) in enumerate(words):
        if i: text += ' '; out.append(a + off - lead - 0.03)
        n = len(w); a2, b2 = a + off - lead, b + off - lead
        for k in range(n): out.append(a2 + (b2 - a2) * k / max(1, n - 1) * 0.92)
        text += w
    return text, [round(t, 3) for t in out]

T1, C1 = chars(W1, V1)
T2, C2 = chars(W2, V2, lead=0.12)
SEND1 = round(C1[-1] + 0.30, 3)           # ≈ 5.3
TYPING_ON = SEND1 + 0.35; TYPING_OFF = 6.30
REPLY = 6.35
SEND2 = round(C2[-1] + 0.10, 3)            # ≈ 8.72
DIVE0 = SEND2 + 0.12                        # needle starts once the bubble has landed
bars = [round(DROP_V + i * BAR, 4) for i in range(BARS + 1)]
beats = [round(DROP_V + i * BEAT, 4) for i in range(BARS * 4 + 1)]
timeline = dict(fps=30, W=1080, H=1920, dur=DUR, S0=S0, DROP=DROP_V, BPM=BPM, BEAT=BEAT, BAR=BAR, END=round(END_V, 4),
                V1=V1, V2=V2, text1=T1, chars1=C1, text2=T2, chars2=C2, send1=SEND1, typingOn=round(TYPING_ON, 3), typingOff=TYPING_OFF,
                reply=REPLY, send2=SEND2, dive0=round(DIVE0, 3), bars=bars, beats=beats,
                vocal1=[round(22.52 - S0, 3), round(25.14 - S0, 3)], vocal2=[round(25.14 - S0, 3), round(28.82 - S0, 3)])
json.dump(timeline, open(BASE + '/timeline.json', 'w'), indent=1)
print({k: v for k, v in timeline.items() if k not in ('chars1', 'chars2', 'bars', 'beats')})
print('bars', bars)

# ---------------- mix ----------------
def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).astype(np.float64)
song = load(AUD + '/song48.wav'); v1 = load(VOI + '/v1.wav'); v2 = load(VOI + '/v2.wav')
N = int(DUR * SR); t = np.arange(N) / SR
mix = np.zeros((N, 2))
# song segment
s0 = int(S0 * SR); seg = song[s0:s0 + N]; seg = np.pad(seg, ((0, N - len(seg)), (0, 0)))
gain = np.ones(N)
def ramp(a, b, ga, gb):                       # linear gain ramp between video times a..b
    i0, i1 = int(a * SR), int(b * SR); gain[i0:i1] = np.linspace(ga, gb, max(1, i1 - i0)); return gb
def hold(a, b, g): gain[int(a * SR):int(b * SR)] = g
db = lambda d: 10 ** (d / 20)
# intro under the dialogue: -4 dB bed, -11 dB while she speaks, back to 0 dB right at the drop
hold(0, DUR, 1.0)
hold(0, V1 + 0.45, db(-4)); ramp(V1 + 0.45, V1 + 0.75, db(-4), db(-11)); hold(V1 + 0.75, SEND1, db(-11))
ramp(SEND1, SEND1 + 0.4, db(-11), db(-5)); hold(SEND1 + 0.4, V2 + 0.55, db(-5)); ramp(V2 + 0.55, V2 + 0.8, db(-5), db(-11))
hold(V2 + 0.8, DIVE0, db(-11)); ramp(DIVE0, DROP_V - 0.02, db(-11), 1.0); hold(DROP_V - 0.02, DUR, 1.0)
fade_in = np.clip(t / 0.5, 0, 1); gain *= fade_in
end_fade = np.clip((DUR - t) / 0.09, 0, 1); gain *= end_fade        # tiny fade at the very end (bar 16 ends at END_V)
mix += seg * gain[:, None]
# voice (peak-normalise, trim leading silence handled by placement offsets)
def place(v, at, g):
    v = v / (np.abs(v).max() + 1e-9) * g; i0 = int(at * SR); n = min(len(v), N - i0); mix[i0:i0 + n] += v[:n]
place(v1, V1, 0.80); place(v2, V2, 0.80)
# SFX (synth): key ticks, send whoosh, receive ding
def tick(at, g=db(-30)):
    n = int(0.012 * SR); i0 = int(at * SR); env = np.exp(-np.arange(n) / (0.002 * SR)); r = np.random.default_rng(int(at * 1000)).normal(0, 1, n)
    mix[i0:i0 + n] += (r * env * g)[:, None]
for c in C1 + C2: tick(c)
def whoosh(at, g=db(-21)):
    n = int(0.16 * SR); x = np.arange(n) / n; r = np.random.default_rng(3).normal(0, 1, n)
    # crude band-pass by differencing + smoothing, with a rising envelope then quick decay
    y = np.convolve(r, np.ones(9) / 9, 'same'); y = y - np.convolve(y, np.ones(60) / 60, 'same')
    env = np.sin(np.pi * x) ** 2 * np.exp(-x * 2); i0 = int(at * SR); mix[i0:i0 + n] += (y / (np.abs(y).max() + 1e-9) * env * g)[:, None]
def ding(at, g=db(-19)):
    n = int(0.35 * SR); tt = np.arange(n) / SR; env = np.exp(-tt / 0.09)
    y = (np.sin(2 * np.pi * 1046.5 * tt) * 0.6 + np.sin(2 * np.pi * 1568 * tt) * 0.4) * env
    y2 = (np.sin(2 * np.pi * 1318.5 * tt) * 0.7) * np.exp(-np.clip(tt - 0.07, 0, 9) / 0.12) * (tt > 0.07)
    i0 = int(at * SR); mix[i0:i0 + n] += ((y + y2 * 0.8) * g)[:, None]
whoosh(SEND1); whoosh(SEND2); ding(REPLY); ding(TYPING_ON - 0.1, db(-30))
# soft limiter
peak = np.abs(mix).max(); print('pre-limit peak', round(peak, 3))
mix = np.tanh(mix * 1.05) / np.tanh(1.05) * 0.97
out = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
import wave
with wave.open(BASE + '/mix.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(out.tobytes())
print('mix.wav', DUR, 's; post peak', round(np.abs(mix).max(), 3))
