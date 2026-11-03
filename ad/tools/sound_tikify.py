"""Placeholder soundtrack for the Tikify TikTok ad, synthesised in code (numpy only) from the film's own cue list.
    node tools/capture.mjs film/index.html /tmp --cues film/cues.json
    python3 tools/sound_tikify.py film/cues.json film/sound.wav
Shape copied from the reference ad: a quiet, airy intro while the sounds parade (one pluck per sound), a riser while
they collapse into the seek bar, the beat DROPS on the wordmark (4.5 s), a steady 120 BPM groove under the app demo,
UI foley on every tap, a hit on the end card, and a soft tail. On TikTok you will likely post with a trending sound
instead: the *_nosound.mp4 master is the one to use for that.
"""
import os, sys, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np
import sound_kit as S

cues_path, out = sys.argv[1], sys.argv[2]
d = json.load(open(cues_path)); comp = d.get('comp', {})
S.init(comp.get('duration', 24.0), seed=11)
CUES = {q['name']: q['t'] for q in d.get('cues', [])}
KIND = [(q['name'], q['t'], q['kind']) for q in d.get('cues', [])]
BPM = 120; beat = 60 / BPM; DROP = CUES.get('drop', 4.5); END = CUES.get('end', 21.0)

# chords: Fmaj7 – Am7 – Dm7 – Bbmaj7, one bar (2 s) each, from the drop on; the intro floats on Fmaj9
PROG = [[53, 57, 60, 64], [57, 60, 64, 67], [50, 57, 60, 65], [46, 53, 57, 62]]
S.add(S.pad([53, 60, 64, 67, 69], DROP + .4, .9), 0.0, .17, bus='mus', hall=.35)
t, i = DROP, 0
while t < S.DUR:
    ch = PROG[i % 4]; L = min(2.0, S.DUR - t) + .3
    S.add(S.pad(ch, L, .9), t, .36 if t < END else .3, bus='mus', hall=.25)
    if t < END:
        for k in range(8):                                   # bass on 8ths, root/fifth, ducked by the kick
            nb = ch[0] - 12 + (7 if k in (3, 7) else 0)
            S.add(S.bass(nb, .22, .8), t + k * .25, .3 if k % 2 == 0 else .2, bus='mus')
    t += 2.0; i += 1

# intro: one pluck per sound tile (C D F G A), a soft bell chord on "All in one place.", shimmer hats
for n, m in enumerate([72, 74, 77, 79, 81]):
    tt = CUES.get(f'tile{n}', n * .5)
    S.add(S.pluck(m, .5, 1.0), tt, .24, pan=-.3 + .15 * n, bus='duckfx', hall=.3, echo=.18)
S.add(S.bell(84, 1.6, 1.0), CUES.get('row', 2.45) + .3, .16, hall=.4, echo=.2)
S.add(S.bell(77, 1.6, 1.0), CUES.get('row', 2.45) + .3, .12, hall=.4)
x = 1.0
while x < DROP - .1:
    S.add(S.hat2(1.0, .02), x, .025, pan=.35 if int(x * 4) % 2 else -.35, bus='drum'); x += .25
S.add_end(S.whip(.28), CUES.get('row', 2.45) + .05, .22)
S.add_end(S.riser2(1.0), DROP, .5, hall=.15)                 # the collapse → knob → bar run builds into the drop
S.add(S.wpop(1200), CUES.get('knob', 4.0), .22, room=.2)

# the drop + groove (kick on every beat, clap on 2 & 4, 8th hats with an open hat on the off-beat)
S.hit(DROP, 1.2, 1.0, chord=[65, 69, 72, 76], clap_g=.25, cym=.12)
b = DROP + beat; nbeat = 1
LOCK = CUES.get('lock', 14.96)
while b < END - .01:
    gap = LOCK - .02 <= b < LOCK + .2                         # the screen locks: one beat of air
    if not gap:
        S.add(S.kick_t(.9, decay=7), b, .5, bus='drum'); S.SIDECHAIN.append(b)
        if nbeat % 2 == 1: S.add(S.clap(1.0), b, .16, bus='drum', room=.25)
    for h in (0, .25):
        S.add(S.hat2(1.0, .022 if h == 0 else .05), b + h, .05 if h == 0 else .07, pan=.25 if h else -.2, bus='drum')
    b += beat; nbeat += 1

# picture sounds on their frames
for name, t, k in KIND:
    if k == 'tap': S.add(S.mclick(.9), t, .3, pan=.1, room=.15)
    elif k == 'pop': S.add(S.wpop(980), t, .26, room=.15)
    elif k == 'success': S.add(S.boop(620, 1240, .18, 1.0), t, .22, room=.2); S.add(S.chime(88, 1.0, .8), t + .06, .1, hall=.3)
    elif k == 'swish': S.add(S.whoosh(.32, 300, 1200, 1500, 6000, 1.0), t, .2)
    elif k == 'whoosh' and name not in ('row',): S.add_end(S.whip(.24), t + .2, .26)
    elif k == 'lock': S.add(S.thunk(1.0), t, .3, room=.2)
    elif k == 'chime': S.add(S.chime(84, 1.0, 1.2), t, .14, hall=.35, echo=.2)
    elif k == 'roll': S.decode(t, .85, g=.035, rate=55)
    elif k == 'tick': S.add(S.tick(1.0), t, .14, room=.15)
    elif k == 'sparkle':
        for j, f in enumerate([2600, 3300, 4200, 5200]): S.add(S.sparkle(f, .08, 1.0), t + j * .04, .05, pan=-.3 + .2 * j, hall=.3)

# end card: hero hit, then the groove thins to pad + hats and fades
S.add_end(S.riser2(.5), END, .35, hall=.12)
S.hit(END, 1.15, 1.0, chord=[65, 69, 72, 77], clap_g=.2, cym=.14)
x = END + .5
while x < S.DUR - .3:
    S.add(S.hat2(1.0, .02), x, .03, pan=.3 if int(x * 4) % 2 else -.3, bus='drum'); x += .25
S.master(out, fade_from=S.DUR - .6, fade_len=.6)
S.verify([('drop', DROP, 'lf'), ('end', END, 'lf')] + [(n[:12], t, 'hf') for n, t, k in KIND if k == 'tap'][:4])
