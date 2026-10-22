import sys, numpy as np
x = np.fromfile(sys.argv[1], dtype=np.float32); sr = 22050
hop = 256; win = 1024
n = (len(x) - win) // hop
frames = np.lib.stride_tricks.as_strided(x, (n, win), (x.strides[0]*hop, x.strides[0]))
spec = np.abs(np.fft.rfft(frames * np.hanning(win), axis=1))
logs = np.log1p(spec * 10)
flux = np.maximum(0, np.diff(logs, axis=0)).sum(1)
flux = np.concatenate([[0], flux]); flux = (flux - flux.mean()) / flux.std()
fr = sr / hop
# low-band energy (kick) over time, and RMS per 0.5s
low = spec[:, :int(150 / (sr / win))].sum(1)
rms = np.sqrt((frames ** 2).mean(1))
print('RMS per second:')
print(' '.join(f'{i}:{20*np.log10(rms[int(i*fr):int((i+1)*fr)].mean()+1e-9):.0f}' for i in range(int(len(x)/sr))))
# tempo by autocorrelation of onset flux
ac = np.correlate(flux, flux, 'full')[len(flux)-1:]
lags = np.arange(len(ac)) / fr
best = []
for bpm in np.arange(60, 200, 0.5):
    lag = 60 / bpm * fr
    s = sum(np.interp(lag * k, np.arange(len(ac)), ac) for k in (1, 2, 4))
    best.append((s, bpm))
best.sort(reverse=True)
print('tempo candidates:', [b for _, b in best[:8]])
bpm = best[0][1]; period = 60 / bpm * fr
# beat phase: offset maximizing flux on the grid
ph = max(range(int(period)), key=lambda o: flux[o::1][::1][np.round(np.arange(0, len(flux) - o, period)).astype(int)].sum() if False else sum(flux[int(round(o + k * period))] for k in range(int((len(flux) - o) / period))))
print('bpm', bpm, 'first beat at', round(ph / fr, 3), 's')
# strongest onsets
idx = np.argsort(flux)[::-1]
picked = []
for i in idx:
    if all(abs(i - j) > fr * 0.4 for j in picked): picked.append(i)
    if len(picked) >= 25: break
print('strong onsets:', sorted(round(i / fr, 2) for i in picked))
# low-energy onset peaks (kicks / drops)
lowd = np.maximum(0, np.diff(np.log1p(low), prepend=0))
idx = np.argsort(lowd)[::-1]; picked = []
for i in idx:
    if all(abs(i - j) > fr * 0.3 for j in picked): picked.append(i)
    if len(picked) >= 30: break
print('kick onsets:', sorted(round(i / fr, 2) for i in picked))
