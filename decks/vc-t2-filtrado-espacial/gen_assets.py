#!/usr/bin/env python3
"""Genera los PNG de la presentación vc-t2-filtrado-espacial (imágenes reales del lab 2)."""
import os
import numpy as np
from PIL import Image
from scipy import ndimage as nd
from scipy.signal import medfilt2d
from matplotlib import cm

IMGS = '/home/jcrex/uji/Master-Sistemas-Inteligentes/Computer-Vision/lab/lab2/p2-4students/imgs-P2/'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets')
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)


def load(n):
    return np.array(Image.open(IMGS + n).convert('L'), dtype=float)


def save(name, a, scale=2):
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    im = im.resize((im.width * scale, im.height * scale), Image.NEAREST)
    im.save(os.path.join(OUT, name))


def gauss(im, sd):
    return np.clip(im + rng.normal(0, sd, im.shape), 0, 255)


def sp(im, pct, mode='both'):
    out = im.copy().ravel()
    m = int(pct * out.size / 100)
    loc = rng.choice(out.size, m, replace=False)
    out[loc] = {'both': 255 * rng.integers(0, 2, m), 'salt': 255, 'pepper': 0}[mode]
    return out.reshape(im.shape)


arch = load('arch256.pgm')
save('arch.png', arch)
for s in (5, 10, 20):
    save(f'arch_g{s}.png', gauss(arch, s))
save('arch_sp3.png', sp(arch, 3))
sp10 = sp(arch, 10)
save('arch_sp10.png', sp10)

# mediana frente a sal y pimienta
save('med_1.png', medfilt2d(sp10, 3))
m3 = sp10
for _ in range(3):
    m3 = medfilt2d(m3, 3)
save('med_3.png', m3)
save('med_big.png', medfilt2d(sp10, 15))
save('media3_sp10.png', nd.uniform_filter(sp10, 3))

# máx. contra pimienta, mín. contra sal
pep = sp(arch, 5, 'pepper')
sal = sp(arch, 5, 'salt')
save('pep.png', pep)
save('pep_max.png', nd.maximum_filter(pep, 3))
save('sal.png', sal)
save('sal_min.png', nd.minimum_filter(sal, 3))
save('arch_max.png', nd.maximum_filter(arch, 3))
save('arch_min.png', nd.minimum_filter(arch, 3))

# template matching sobre boat256
boat = load('boat256.pgm')
y0, x0, h, w = 150, 100, 28, 28   # parche
patch = boat[y0:y0 + h, x0:x0 + w]
save('tm_img.png', boat)
Image.fromarray(boat.astype(np.uint8)).convert('RGB')
raw = nd.correlate(boat, patch, mode='constant')
from skimage.feature import match_template
ncc = match_template(boat, patch, pad_input=True)


def heat(a, name, lo=None, hi=None):
    lo = a.min() if lo is None else lo
    hi = a.max() if hi is None else hi
    rgb = (cm.inferno((a - lo) / (hi - lo + 1e-12))[..., :3] * 255).astype(np.uint8)
    im = Image.fromarray(rgb).resize((512, 512), Image.NEAREST)
    im.save(os.path.join(OUT, name))
    return np.unravel_index(np.argmax(a), a.shape)


print('patch en', (y0 + h // 2, x0 + w // 2))
print('max correlación cruda', heat(raw, 'tm_raw.png'))
print('max NCC', heat(ncc, 'tm_ncc.png'), ncc.max())
pm = np.zeros_like(boat) + 0
pp = Image.fromarray(patch.astype(np.uint8)).resize((patch.shape[1] * 4, patch.shape[0] * 4), Image.NEAREST)
pp.save(os.path.join(OUT, 'tm_patch.png'))
# marca del parche en la imagen
b = np.stack([boat] * 3, -1).astype(np.uint8)
b[y0:y0 + h, [x0, x0 + w - 1]] = (255, 200, 0)
b[[y0, y0 + h - 1], x0:x0 + w] = (255, 200, 0)
Image.fromarray(b).resize((512, 512), Image.NEAREST).save(os.path.join(OUT, 'tm_img.png'))


# ---------- añadidos en el pase de revisión ----------
# Suavizado real: ruido gaussiano sigma=20, media 5x5 frente a gaussiano sigma=1
g20 = np.clip(arch + np.random.default_rng(11).normal(0, 20, arch.shape), 0, 255)
save('sm_g20.png', g20)
save('sm_mean5.png', nd.convolve(g20, np.ones((5, 5)) / 25))
save('sm_gauss1.png', nd.gaussian_filter(g20, 1))
save('sm_mean11.png', nd.convolve(g20, np.ones((11, 11)) / 121))


def psnr(a, b):
    return 10 * np.log10(255 ** 2 / np.mean((a - b) ** 2))


# Tabla de PSNR (dB) ruido x filtro, ventanas 3x3, gaussiano sigma=1
r2 = np.random.default_rng(3)
def sp2(im, pct, mode):
    out = im.copy().ravel(); m = int(pct * out.size / 100)
    loc = r2.choice(out.size, m, replace=False)
    out[loc] = {'both': 255 * r2.integers(0, 2, m), 'salt': 255, 'pepper': 0}[mode]
    return out.reshape(im.shape)
noisy = {'gauss20': np.clip(arch + r2.normal(0, 20, arch.shape), 0, 255),
         'sp10': sp2(arch, 10, 'both'), 'sal5': sp2(arch, 5, 'salt'), 'pim5': sp2(arch, 5, 'pepper')}
filt = {'ninguno': lambda x: x,
        'media': lambda x: nd.convolve(x, np.ones((3, 3)) / 9),
        'gauss': lambda x: nd.gaussian_filter(x, 1),
        'mediana': lambda x: nd.median_filter(x, 3),
        'min': lambda x: nd.minimum_filter(x, 3),
        'max': lambda x: nd.maximum_filter(x, 3)}
PSNR = [[round(psnr(arch, f(n)), 1) for n in noisy.values()] for f in filt.values()]
print('PSNR filas', list(filt), 'columnas', list(noisy))
for k, row in zip(filt, PSNR):
    print(k, row)
