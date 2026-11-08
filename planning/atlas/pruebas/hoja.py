import sys, glob, os
from PIL import Image, ImageDraw
d, pref, out = sys.argv[1], sys.argv[2], sys.argv[3]
orden = [l.strip() for l in open(sys.argv[4])] if len(sys.argv) > 4 else None
fs = sorted(glob.glob(f'{d}/{pref}-*.png'))
if orden: fs = [f'{d}/{pref}-{i}.png' for i in orden if os.path.exists(f'{d}/{pref}-{i}.png')]
cols, w, h = 3, 640, 360
img = Image.new('RGB', (cols * w, ((len(fs) + cols - 1) // cols) * h), 'white')
for i, f in enumerate(fs):
    img.paste(Image.open(f).resize((w, h)), ((i % cols) * w, (i // cols) * h))
img.save(out); print(len(fs), out)
