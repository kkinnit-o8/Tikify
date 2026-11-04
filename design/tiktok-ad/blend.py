# Averages each frame's sub-frames (linear light) into PNG frames: python3 blend.py <subDir> <outDir> <nFrames>
import sys, os, numpy as np
from PIL import Image
from multiprocessing import Pool
sub, out, n = sys.argv[1], sys.argv[2], int(sys.argv[3])
os.makedirs(out, exist_ok=True)
def one(f):
    N = int(open(os.path.join(sub, f'f{f:04d}.n')).read())
    acc = None
    for j in range(N):
        a = np.asarray(Image.open(os.path.join(sub, f'f{f:04d}_{j:02d}.jpg')).convert('RGB'), dtype=np.float32) / 255.0
        a = a ** 2.2
        acc = a if acc is None else acc + a
    img = (np.clip(acc / N, 0, 1) ** (1 / 2.2) * 255 + .5).astype(np.uint8)
    Image.fromarray(img).save(os.path.join(out, f'f_{f:04d}.png'), compress_level=1)
    return f
with Pool(4) as p:
    for i, _ in enumerate(p.imap_unordered(one, range(n), chunksize=4)):
        pass
print('blended', n)
