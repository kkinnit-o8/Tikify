# vertical contact sheet: python3 vsheet.py <dir> <out.jpg> [cols] [tile_w] [glob-prefix]
import os, re, sys
from PIL import Image, ImageDraw
d, out = sys.argv[1], sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 7
tw = int(sys.argv[4]) if len(sys.argv) > 4 else 216
pre = sys.argv[5] if len(sys.argv) > 5 else 'still_'
fs = [f for f in os.listdir(d) if f.startswith(pre) and f.endswith(('.png', '.jpg'))]
key = lambda f: float(re.findall(r'[\d.]+', f[len(pre):])[0].rstrip('.'))
fs.sort(key=key)
th = tw * 16 // 9
rows = (len(fs) + cols - 1) // cols
sh = Image.new('RGB', (cols * tw, rows * (th + 22)), (30, 30, 30))
dr = ImageDraw.Draw(sh)
for i, f in enumerate(fs):
    im = Image.open(os.path.join(d, f)).convert('RGB').resize((tw, th))
    x, y = (i % cols) * tw, (i // cols) * (th + 22)
    sh.paste(im, (x, y + 22)); dr.text((x + 4, y + 4), f[len(pre):].rsplit('.', 1)[0] if pre == 'still_' else f, fill=(255, 255, 255))
sh.save(out, quality=88)
print(out, len(fs))
