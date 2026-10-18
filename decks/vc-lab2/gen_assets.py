#!/usr/bin/env python3
"""Genera assets/*.png y assets/datos.json del deck vc-lab2 (lab 2). Ejecutar con el venv con skimage/matplotlib."""
import os, sys, json, time
import numpy as np
from PIL import Image
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from scipy.ndimage import gaussian_filter, convolve, median_filter
from scipy.signal import medfilt2d
from scipy.signal.windows import gaussian

SRC = '/home/jcrex/uji/Master-Sistemas-Inteligentes/Computer-Vision/Teoria/Videos/04_Lab2_Filtrado_Espacial/assets/'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets') + os.sep
BG, FG = '#10141c', '#e6e9ef'
plt.rcParams.update({'figure.facecolor': BG, 'axes.facecolor': BG, 'text.color': FG, 'font.size': 17})

def load(n, gray=True):
    im = Image.open(SRC + n)
    return np.array(im.convert('L') if gray else im.convert('RGB'), dtype=float)
def psnr(ref, im): return 10*np.log10(255**2/np.mean((np.asarray(ref, float)-im)**2))

def addSPNoise(im, percent):
    v = np.array(im).flatten(); N = v.size; m = int(np.floor(percent*N/100))
    v[np.random.randint(0, N, m)] = 255*np.random.randint(0, 2, m); return v.reshape(np.shape(im))
def addGaussianNoise(im, sd=5): return im + np.random.normal(0, sd, np.shape(im))
def averageFilter(im, n): return convolve(im, np.ones((n, n))/n**2)
def gaussianFilter(im, s): return gaussian_filter(im, s)
def medianFilter(im, n): return medfilt2d(np.asarray(im, float), n)

def grid(imgs, titles, name, ncols, w=3.4, rgb=False, vmin=0, vmax=255, tight=False):
    n = len(imgs); nr = int(np.ceil(n/ncols))
    fig, axs = plt.subplots(nr, ncols, figsize=(w*ncols, (w+0.55)*nr), squeeze=False)
    for ax in axs.ravel(): ax.axis('off')
    for ax, im, t in zip(axs.ravel(), imgs, titles):
        if rgb: ax.imshow(np.clip(im, 0, 255).astype(np.uint8), interpolation='none')
        else: ax.imshow(im, cmap='gray', vmin=vmin, vmax=vmax, interpolation='none')
        ax.set_title(t, fontsize=17, pad=6)
    fig.tight_layout(pad=0.4)
    fig.savefig(OUT+name, dpi=100, facecolor=BG, **({'bbox_inches': 'tight', 'pad_inches': 0.08} if tight else {})); plt.close(fig)

D = {}
im = load('arch256.pgm')
np.random.seed(0)
sp3 = addSPNoise(im, 3)
D['sp_changed'] = float(np.mean(sp3 != im))
gs = {s: addGaussianNoise(im, s) for s in (3, 5, 10, 20)}
D['gauss_range20'] = [float(gs[20].min()), float(gs[20].max())]
grid([im, sp3, *[np.clip(gs[s], 0, 255) for s in (3, 5, 10, 20)]],
     ['original', 'S&P 3 %', 'gauss σ=3', 'gauss σ=5', 'gauss σ=10', 'gauss σ=20'], 'ruidos.png', 3, w=2.63)
D['psnr_noise'] = {'sp3': psnr(im, sp3), **{f'g{s}': psnr(im, np.clip(gs[s], 0, 255)) for s in gs}}
# histograma del ruido gaussiano σ=5 y σ=20 (de la diferencia real)
for s in (5, 20):
    h, _ = np.histogram((gs[s]-im).ravel(), bins=np.arange(-60, 61, 4))
    D[f'hist_noise_{s}'] = (h/h.sum()*100).round(2).tolist()
hsp, _ = np.histogram(sp3.ravel(), bins=16, range=(0, 256))
D['hist_sp'] = (hsp/hsp.sum()*100).round(2).tolist()

# filtros (slide 13)
np.random.seed(0)   # mismo ruido que e1_tabla (solución del lab)
sp = addSPNoise(im, 5); ga = addGaussianNoise(im, 20)
def panel(name, noisy, filts, tag, save=True):
    imgs = [noisy]; tt = [f'{tag}: {psnr(im, noisy):.1f} dB']
    for lab, f in filts:
        r = f(noisy); imgs.append(r); tt.append(f'{lab}: {psnr(im, r):.1f} dB')
    if save: grid(imgs, [t.split(':')[0] for t in tt], name, 4, w=2.5)   # PSNR en la gráfica del deck
    return {t.split(':')[0]: float(t.split(': ')[1].split()[0]) for t in tt}
D['ps_media'] = panel('f_media_sp.png', sp, [(f'media {n}', lambda x, n=n: averageFilter(x, n)) for n in (3, 7, 15)], 'S&P 5 %')
D['ps_mediana'] = panel('f_mediana_sp.png', sp, [(f'mediana {n}', lambda x, n=n: medianFilter(x, n)) for n in (3, 7, 15)], 'S&P 5 %')
D['pg_media'] = panel('f_media_g.png', ga, [(f'media {n}', lambda x, n=n: averageFilter(x, n)) for n in (3, 7, 15)], 'gauss σ=20', save=False)
D['pg_gauss'] = panel('f_gauss_g.png', ga, [(f'gauss σ={s}', lambda x, s=s: gaussianFilter(x, s)) for s in (1, 2, 4)], 'gauss σ=20', save=False)
D['pg_mediana'] = panel('f_mediana_g.png', ga, [(f'mediana {n}', lambda x, n=n: medianFilter(x, n)) for n in (3, 7, 15)], 'gauss σ=20', save=False)
D['ps_gauss'] = {str(s): psnr(im, gaussianFilter(sp, s)) for s in (1, 2, 4)}

# E1 (como e1_tabla: seed 0, sp=5, sd=20)
ruidos = {'S&P 5 %': sp, 'Gauss σ=20': ga}
filtros = {'media 3×3': lambda x: averageFilter(x, 3), 'Gauss σ=1': lambda x: gaussianFilter(x, 1), 'mediana 3×3': lambda x: medianFilter(x, 3)}
D['e1'] = {nr: {'sin filtrar': psnr(im, s), **{nf: psnr(im, f(s)) for nf, f in filtros.items()}} for nr, s in ruidos.items()}
d = np.abs(np.asarray(medianFilter(ruidos['S&P 5 %'], 3), float) - im)
D['e1_bordes'] = 'ok'

# E2
a, s = averageFilter(im, 7), convolve(convolve(im, np.ones((1, 7))/7), np.ones((7, 1))/7)
D['e2_diff'] = float(np.abs(a-s).max())
t = json.load(open(SRC + 'tiempos.json'))
D['e2_mask'] = {n: [v[0][0]*1000, v[1][0]*1000] for n, v in t['mask'].items()}
D['e2_size'] = {n: [v[0][0]*1000, v[1][0]*1000] for n, v in t['size'].items()}

# E3
sigma = 4; n = 2*int(4*sigma+0.5)+1
g = gaussian(n, sigma).reshape(n, 1); g = g/g.sum(); g2 = g @ g.T
o2 = convolve(im, g2); osp = convolve(convolve(im, g), g.T); ref = gaussian_filter(im, sigma)
D['e3'] = dict(n=n, d_sep=float(np.abs(o2-osp).max()), d_ref=float(np.abs(o2-ref).max()))
g15 = gaussian(15, 4); D['g15_raw'] = g15.round(3).tolist(); g15n = g15/g15.sum(); D['g15'] = g15n.round(3).tolist()
g2_15 = np.outer(g15n, g15n)
D['g15_2d_mid'] = g2_15[7].round(4).tolist(); D['g15_2d_max'] = float(g2_15.max()); D['g15_sum'] = float(g15.sum())
D['e3_15_vs_ref'] = float(np.abs(convolve(im, g2_15) - ref).max())
D['e3_rank'] = int(np.linalg.matrix_rank(g2_15))
grid([im, o2, osp, np.abs(o2-ref)*1e3], ['original', 'convolve 2D', '2 × 1D', '|2D − gaussian_filter|×1000'], 'e3.png', 4, w=3.2)

# E4 color
pep = load('peppers.ppm', gray=False)
np.random.seed(0)
noisy = addGaussianNoise(pep, 25)
bien = gaussian_filter(noisy, (2, 2, 0)); mal = gaussian_filter(noisy, 2)
por_banda = np.dstack([gaussian_filter(noisy[..., k], 2) for k in range(3)])
nz = noisy-pep
D['e4'] = dict(igual=bool(np.allclose(bien, por_banda)), corr=float(np.corrcoef(nz[..., 0].ravel(), nz[..., 1].ravel())[0, 1]),
               std=[float(nz[..., k].std()) for k in range(3)])
grid([pep, noisy, bien, mal], ['original', 'ruido σ=25', 'sigma=(2,2,0)', 'sigma=2 (mezcla)'], 'e4.png', 4, w=2.9, rgb=True)

# E5
ein = load('einstein.pgm')
luz = np.linspace(0.25, 1.0, ein.shape[1]); osc = ein*luz
Q = lambda x, s: x/(gaussian_filter(x, s)+1e-6)
q1, q2 = Q(ein, 8), Q(osc, 8)
D['e5'] = dict(corr=float(np.corrcoef(q1.ravel(), q2.ravel())[0, 1]), corr_raw=float(np.corrcoef(ein.ravel(), osc.ravel())[0, 1]),
               qmin=float(q2.min()), qmax=float(q2.max()))
def qn(q): return np.clip(q/2*255, 0, 255)
grid([ein, osc, qn(q1), qn(q2)], ['original', 'luz variable', 'Q (original)', 'Q (con luz variable)'], 'e5.png', 4, w=2.9, tight=True)

# E7 zoom con región
sucia = addSPNoise(im, 5)
r0, r1, c0, c1 = 60, 140, 90, 170
outs = [sucia, averageFilter(sucia, 3), medianFilter(sucia, 3)]
grid([o[r0:r1, c0:c1] for o in outs], ['S&P 5 %', 'media', 'mediana'], 'e7.png', 3, w=2.6)

# Bordes
big = 21; sig = 8
cst = gaussian_filter(im, sig, mode='constant'); rfl = gaussian_filter(im, sig, mode='reflect')
grid([im, cst, rfl], ['original', "mode='constant'", "mode='reflect'"], 'bordes.png', 3, w=3.6)
D['bordes'] = dict(c_corner=float(cst[:5, :5].mean()), r_corner=float(rfl[:5, :5].mean()), o_corner=float(im[:5, :5].mean()))

# perfil horizontal junto al borde izquierdo (media de todas las filas), sigma = 8
D['bordes_perfil'] = {k: v[:, :40].mean(axis=0).round(1).tolist() for k, v in (('o', im), ('c', cst), ('r', rfl))}

# E1: recortes 80×80 de cada ruido con cada filtro (mismo sp/ga que la tabla)
fl = [('ruidosa', lambda x: x)] + list(filtros.items())
imgs, tt = [], []
for nr, s_ in ruidos.items():
    for nf, f in fl:
        imgs.append(f(s_)[r0:r1, c0:c1]); tt.append(f"{nr.split()[0]} · {nf}" if nf == 'ruidosa' else nf)
grid(imgs, tt, 'e1.png', 4, w=2.5)

# blurFgBk (ejercicio 3 del examen) con una máscara circular de ejemplo
def blurFgBk(im, fgMask, bFg, sigma):
    im_f = gaussian_filter(im, sigma)
    a, b = (1 - fgMask, fgMask) if bFg else (fgMask, 1 - fgMask)
    return a * im + b * im_f
yy, xx = np.mgrid[:im.shape[0], :im.shape[1]]
fg = (((yy - 170)**2 + (xx - 128)**2) < 75**2).astype(float)
grid([fg*255, blurFgBk(im, fg, False, 4), blurFgBk(im, fg, True, 4)], ['fgMask', 'bFg=False', 'bFg=True'], 'ex2.png', 3, w=2.4)

json.dump(D, open(OUT+'datos.json', 'w'), indent=1, ensure_ascii=False)
print(json.dumps({k: v for k, v in D.items() if not k.startswith('hist') and not k.startswith('g15')}, indent=1, ensure_ascii=False))
