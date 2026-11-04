"""Timeline + mix for the ~10 s cut. Reads voice word timings from voice10/words.json (faster-whisper), places the lines,
derives the dive/drop so the song's crash hit precedes the dive and its bass slam lands on the cut. Writes timeline.json → film10/tl.js, mix10.wav."""
import json, numpy as np, subprocess, os, wave
SR = 48000
BASE = '/tmp/claude-0/-home-user-Tikify/ece3f78c-d3dd-5dde-b884-0f5893502a95/scratchpad'
AUD = BASE + '/audio'; VOI = BASE + '/voice10'
W = json.load(open(VOI + '/words.json'))
HIT_SONG, SLAM_SONG = 11.29, 11.687
BPM = 168.9; BEAT = 60 / BPM; BAR = 4 * BEAT; BARS = 4
V1 = 0.22
def chars(words, off, lead=0.08):
    out = []; text = ''
    for i, (w, a, b) in enumerate(words):
        if i: text += ' '; out.append(a + off - lead - 0.03)
        n = len(w); a2, b2 = a + off - lead, b + off - lead
        for k in range(n): out.append(a2 + (b2 - a2) * k / max(1, n - 1) * 0.92)
        text += w
    return text, [round(t, 3) for t in out]
T1, C1 = chars(W['v1'], V1)
w1 = {w: (a + V1, b + V1) for w, a, b in W['v1']}
SEND1 = round(C1[-1] + 0.22, 3)
TYP_ON = round(SEND1 + 0.28, 3); REPLY = round(SEND1 + 0.62, 3)
V2 = round(REPLY + 0.10 - W['v2'][0][1], 3)          # first word of line 2 starts 0.10 s after the reply pops
T2, C2 = chars(W['v2'], V2, lead=0.12)
SEND2 = round(C2[-1] + 0.08, 3)
DIVE0 = round(SEND2 + 0.10, 3)
DROP_V = round(DIVE0 + 0.36, 3)                        # the crash hit (0.397 s before the slam) lands just before the dive
S0 = SLAM_SONG - (DROP_V + 0.022)
bars = [round(DROP_V + i * BAR, 4) for i in range(BARS + 1)]
beats = [round(DROP_V + i * BEAT, 4) for i in range(BARS * 4 + 1)]
DUR = round(bars[-1] + 0.6, 2)
cards = [round(w1['why'][0] - 0.05, 3), round(w1['this'][0], 3)]
chips = [round(w1['anywhere?'][0] + 0.02, 3), round(w1['anywhere?'][0] + 0.14, 3)]
shake = round(w1['anywhere?'][0] + 0.3, 3)
timeline = dict(fps=30, W=1080, H=1920, dur=DUR, S0=S0, DROP=DROP_V, BPM=BPM, BEAT=BEAT, BAR=BAR, END=bars[-1],
                V1=V1, V2=V2, text1=T1, chars1=C1, text2=T2, chars2=C2, send1=SEND1, typingOn=TYP_ON, typingOff=REPLY - 0.02, reply=REPLY,
                send2=SEND2, dive0=DIVE0, piv0=round(DIVE0 - 0.3, 3), cards=cards, chips=chips, shake=shake, bars=bars, beats=beats,
                hit=round(HIT_SONG - S0, 3), slam=round(SLAM_SONG - S0, 3))
timeline['pos'] = json.load(open(BASE + '/caps/add_preview_pos.json'))
json.dump(timeline, open(BASE + '/timeline10.json', 'w'), indent=1)
seq = {}
for n in ['player_open', 'player_close', 'add_lookup', 'add_save', 'sheet_open', 'card_tap', 'playlist_play', 'player_next', 'mini_play', 'search_type', 'player_seek', 'add_check', 'player_shuffle', 'player_repeat', 'player_repeat1', 'player_pause']:
    d = BASE + '/caps/' + n
    if not os.path.isdir(d): continue
    fs = sorted(f for f in os.listdir(d) if f.endswith('.jpg')); t = json.load(open(d + '/times.json')); seq[n] = {'files': fs, 'anim': t['times'], 'wall': t['wall']}
open(BASE + '/film10/tl.js', 'w').write('window.TL=' + json.dumps(timeline) + ';\nwindow.SEQ=' + json.dumps(seq) + ';\n')
print({k: v for k, v in timeline.items() if k not in ('chars1', 'chars2', 'beats', 'pos')})

# ---------------- mix ----------------
def load(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).astype(np.float64)
song = load(AUD + '/song48.wav'); v1 = load(VOI + '/' + W['file1']); v2 = load(VOI + '/' + W['file2'])
N = int(DUR * SR); t = np.arange(N) / SR
mix = np.zeros((N, 2))
s0 = int(S0 * SR); seg = song[s0:s0 + N]; seg = np.pad(seg, ((0, N - len(seg)), (0, 0)))
gain = np.ones(N)
def ramp(a, b, ga, gb):
    i0, i1 = int(a * SR), int(b * SR); gain[i0:i1] = np.linspace(ga, gb, max(1, i1 - i0))
def hold(a, b, g): gain[int(a * SR):int(b * SR)] = g
db = lambda d: 10 ** (d / 20)
HIT_V = HIT_SONG - S0
hold(0, DUR, 1.0)
hold(0, V1 + 0.3, db(-5)); ramp(V1 + 0.3, V1 + 0.5, db(-5), db(-11)); hold(V1 + 0.5, SEND1, db(-11))
ramp(SEND1, SEND1 + 0.3, db(-11), db(-6)); hold(SEND1 + 0.3, V2 + 0.2, db(-6)); ramp(V2 + 0.2, V2 + 0.4, db(-6), db(-11))
hold(V2 + 0.4, HIT_V - 0.12, db(-11)); ramp(HIT_V - 0.12, HIT_V - 0.01, db(-11), 1.0); hold(HIT_V - 0.01, DUR, 1.0)
gain *= np.clip(t / 0.4, 0, 1)
gain *= np.clip((DUR - t) / 0.16, 0, 1)
mix += seg * gain[:, None]
def place(v, at, g):
    v = v / (np.abs(v).max() + 1e-9) * g; i0 = int(at * SR); n = min(len(v), N - i0); mix[i0:i0 + n] += v[:n]
place(v1, V1, 0.82); place(v2, V2, 0.82)
def tick(at, g=db(-30)):
    n = int(0.012 * SR); i0 = int(at * SR); env = np.exp(-np.arange(n) / (0.002 * SR)); r = np.random.default_rng(int(at * 1000)).normal(0, 1, n)
    mix[i0:i0 + n] += (r * env * g)[:, None]
for c in C1 + C2: tick(c)
def whoosh(at, g=db(-21)):
    n = int(0.16 * SR); x = np.arange(n) / n; r = np.random.default_rng(3).normal(0, 1, n)
    y = np.convolve(r, np.ones(9) / 9, 'same'); y = y - np.convolve(y, np.ones(60) / 60, 'same')
    env = np.sin(np.pi * x) ** 2 * np.exp(-x * 2); i0 = int(at * SR); mix[i0:i0 + n] += (y / (np.abs(y).max() + 1e-9) * env * g)[:, None]
def ding(at, g=db(-19)):
    n = int(0.35 * SR); tt = np.arange(n) / SR; env = np.exp(-tt / 0.09)
    y = (np.sin(2 * np.pi * 1046.5 * tt) * 0.6 + np.sin(2 * np.pi * 1568 * tt) * 0.4) * env
    y2 = (np.sin(2 * np.pi * 1318.5 * tt) * 0.7) * np.exp(-np.clip(tt - 0.07, 0, 9) / 0.12) * (tt > 0.07)
    i0 = int(at * SR); mix[i0:i0 + n] += ((y + y2 * 0.8) * g)[:, None]
whoosh(SEND1); whoosh(SEND2); ding(REPLY); ding(TYP_ON - 0.1, db(-30))
mix = np.tanh(mix * 1.05) / np.tanh(1.05) * 0.97
out = (np.clip(mix, -1, 1) * 32767).astype(np.int16)
with wave.open(BASE + '/mix10.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(out.tobytes())
print('mix10.wav', DUR, 's; peak', round(np.abs(mix).max(), 3), 'hit@%.3f slam@%.3f' % (HIT_V, SLAM_SONG - S0))
