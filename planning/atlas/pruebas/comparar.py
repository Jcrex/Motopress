import sys, os
from PIL import Image, ImageChops
a, b = sys.argv[1], sys.argv[2]; dif = []
for f in sorted(os.listdir(a)):
    pb = os.path.join(b, f)
    if not os.path.exists(pb): dif.append((f, 'falta')); continue
    d = ImageChops.difference(Image.open(os.path.join(a, f)).convert('RGB'), Image.open(pb).convert('RGB'))
    box = d.getbbox()
    if box: dif.append((f, box, (box[2]-box[0])*(box[3]-box[1])))
print(len(os.listdir(a)), 'comparadas,', len(dif), 'distintas')
for x in dif: print(x)
