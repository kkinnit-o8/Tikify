import sys
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
def cover(path, c1, c2, circles, size=600):
    y, x = np.mgrid[0:size, 0:size] / size
    t = (x + y) / 2
    img = (np.array(c1)[None,None,:]*(1-t[...,None]) + np.array(c2)[None,None,:]*t[...,None]).astype('uint8')
    im = Image.fromarray(img).convert('RGBA')
    ov = Image.new('RGBA', im.size, (0,0,0,0)); d = ImageDraw.Draw(ov)
    for cx, cy, r, a in circles:
        d.ellipse([(cx-r)*size, (cy-r)*size, (cx+r)*size, (cy+r)*size], fill=(255, 220, 190, a))
    im = Image.alpha_composite(im, ov).convert('RGB')
    im.save(path, quality=92)
cover(sys.argv[1] + '/cover_night.jpg', (37, 120, 235), (123, 44, 191), [(0.68,0.32,0.36,70),(0.3,0.7,0.26,80),(0.55,0.62,0.14,90)])
