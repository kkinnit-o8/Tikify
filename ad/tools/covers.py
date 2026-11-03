# Demo cover art in the style of Tikify's own screenshots: a diagonal two-colour gradient + soft translucent circles.
import sys, json, numpy as np
from PIL import Image, ImageDraw, ImageFilter
OUT = sys.argv[1]
C = {  # id: (colour A, colour B, circles [(cx, cy, r) in 0..1])
 'c1': ('#fe2c55', '#7b2cbf', [(.68,.30,.42),(.30,.72,.30),(.78,.80,.16)]),   # summer nights (sped up)
 'c2': ('#ff8a2a', '#e8336b', [(.32,.34,.36),(.74,.70,.34)]),                 # original sound
 'c3': ('#8b5cf6', '#2b3ff0', [(.62,.38,.40),(.26,.76,.22),(.82,.84,.12)]),   # slowed + reverb
 'c4': ('#25f4ee', '#2763ff', [(.36,.30,.30),(.70,.68,.40)]),                 # that one audio
 'c5': ('#ffb020', '#ff3d3d', [(.66,.34,.34),(.30,.70,.36)]),                 # gym phonk
 'c6': ('#1ec98a', '#1a6cff', [(.30,.40,.38),(.76,.74,.26)]),                 # late night drive
 'c7': ('#ff4fa3', '#ffb347', [(.60,.62,.44),(.24,.26,.20)]),                 # dance challenge
 'c8': ('#5b2cbf', '#fe2c55', [(.40,.64,.40),(.78,.26,.24)]),                 # midnight (slowed)
}
def hx(h): return np.array([int(h[i:i+2],16) for i in (1,3,5)], np.float32)
N = 640
y, x = np.mgrid[0:N, 0:N].astype(np.float32) / N
avg = {}
for k, (a, b, circ) in C.items():
    t = np.clip((x + y) / 2, 0, 1)[..., None]
    img = hx(a) * (1 - t) + hx(b) * t
    for i, (cx, cy, r) in enumerate(circ):
        d = np.sqrt((x - cx) ** 2 + (y - cy) ** 2)
        m = np.clip((r - d) * N / 2.5, 0, 1)[..., None] * (.32 + .06 * i)
        img = img * (1 - m) + np.array([255, 236, 210], np.float32) * m
    im = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))
    im.save(f'{OUT}/{k}.jpg', quality=92)
    avg[k] = [round(float(v)) for v in np.asarray(im.resize((8, 8))).reshape(-1, 3).mean(0)]
json.dump(avg, open(f'{OUT}/avg.json', 'w'))
print(avg)
