"""Average sub-frames → frames/f_NNNNN.png (parallel), then encode with the mix. Usage: python3 blend_encode.py <subdir> <framesdir> <out.mp4> [--encode-only]"""
import sys, os, re, subprocess, numpy as np
from PIL import Image
from multiprocessing import Pool
SUB, FRAMES, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
MIX = '/tmp/claude-0/-home-user-Tikify/ece3f78c-d3dd-5dde-b884-0f5893502a95/scratchpad/mix.wav'
os.makedirs(FRAMES, exist_ok=True)

def blend(f):
    out = os.path.join(FRAMES, f'f_{f:05d}.png')
    if os.path.exists(out): return f
    single = os.path.join(SUB, f'f_{f:05d}.png')
    if os.path.exists(single): os.link(single, out); return f
    subs = sorted(x for x in os.listdir(SUB) if x.startswith(f'f_{f:05d}_'))
    if not subs: return None
    acc = None
    for s in subs:
        a = np.asarray(Image.open(os.path.join(SUB, s)).convert('RGB'), dtype=np.float32)
        acc = a if acc is None else acc + a
    Image.fromarray(np.clip(acc / len(subs) + 0.5, 0, 255).astype(np.uint8)).save(out, compress_level=1)
    return f

if '--encode-only' not in sys.argv:
    frames = sorted({int(m.group(1)) for x in os.listdir(SUB) for m in [re.match(r'f_(\d{5})', x)] if m})
    print('frames to blend:', len(frames), 'from', frames[0], 'to', frames[-1])
    missing = [f for f in range(frames[0], frames[-1] + 1) if f not in set(frames)]
    if missing: print('MISSING FRAMES:', missing[:20], '…', len(missing)); sys.exit(1)
    with Pool(4) as pool:
        for i, r in enumerate(pool.imap_unordered(blend, frames, chunksize=8)):
            if i % 100 == 0: print('blended', i)
n = len([x for x in os.listdir(FRAMES) if x.endswith('.png')])
print('frames:', n)
cmd = ['ffmpeg', '-y', '-v', 'error', '-framerate', '30', '-i', os.path.join(FRAMES, 'f_%05d.png'), '-i', MIX,
       '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-profile:v', 'high', '-level', '4.1',
       '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', OUT]
subprocess.run(cmd, check=True)
print('encoded', OUT)
subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'stream=codec_type,width,height,r_frame_rate,nb_frames,duration', '-of', 'csv=p=0', OUT])
