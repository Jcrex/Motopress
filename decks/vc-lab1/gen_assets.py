#!/usr/bin/env python3
"""Genera las imágenes reales del deck vc-lab1 (resultados del lab 1). Reutiliza p1_soluciones.py."""
import os, sys
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

SOL = '/home/jcrex/uji/Master-Sistemas-Inteligentes/Computer-Vision/Teoria/Videos/03_Lab1_Realce/solucion'
sys.path.insert(0, SOL)
import p1_soluciones as p

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets')
os.makedirs(OUT, exist_ok=True)
FG, FG3, ACC, ACC2 = '#c0caf5', '#7c83ab', '#7aa2f7', '#ff9e64'
plt.rcParams.update({'text.color': FG, 'axes.labelcolor': FG, 'xtick.color': FG3, 'ytick.color': FG3,
                     'axes.edgecolor': '#545c7e', 'font.size': 18, 'axes.titlesize': 21})


def save(fig, name):
    fig.savefig(os.path.join(OUT, name), dpi=100, transparent=True, bbox_inches='tight')
    plt.close(fig)


def show(ax, im, title):
    ax.imshow(im, cmap='gray' if im.ndim == 2 else None, vmin=0, vmax=255)
    ax.set_title(title); ax.axis('off')


def hist(ax, im, title):
    ax.hist(im.ravel(), bins=np.arange(257) - .5, color=ACC)
    ax.set_xlim(-1, 256); ax.set_title(title); ax.set_yticks([])


def entropy(x):
    h = np.bincount(np.round(x).astype(int).ravel(), minlength=256) / x.size
    h = h[h > 0]
    return float(-(h * np.log2(h)).sum())


# --- ecualización: imagen, histograma, imagen ecualizada, histograma y CDF
for n in ('iglesia', 'huesos', 'cabeza'):
    im = p.load(n + '.pgm')
    im2, cdf = p.histeq(im)
    fig = plt.figure(figsize=(16.6, 6.0))
    gs = fig.add_gridspec(2, 4, width_ratios=[1, 1.6, 1, 1.6])
    ax = fig.add_subplot(gs[:, 0]); show(ax, im, 'original')
    hist(fig.add_subplot(gs[0, 1]), im, 'histograma original')
    ax = fig.add_subplot(gs[:, 2]); show(ax, im2, 'ecualizada')
    hist(fig.add_subplot(gs[0, 3]), im2, 'histograma ecualizado')
    axc = fig.add_subplot(gs[1, 1]); axc.plot(cdf / cdf[-1], color=ACC2, lw=2.5)
    axc.set_xlim(0, 255); axc.set_ylim(0, 1.02); axc.set_title('CDF (normalizada)')
    axt = fig.add_subplot(gs[1, 3]); axt.plot(np.arange(255), 255 * cdf / cdf[-1], color=ACC2, lw=2.5)
    axt.plot([0, 255], [0, 255], color=FG3, lw=1, ls='--')
    axt.set_xlim(0, 255); axt.set_ylim(0, 260); axt.set_title('T(l) = 255 · CDF(l)')
    fig.tight_layout()
    save(fig, f'heq_{n}.png')
    print(n, im.shape, im.min(), im.max(), 'H antes %.3f después %.3f' % (entropy(im), entropy(im2)))

# --- E3: peppers oscurecida y aclarada
q = p.load('peppers.ppm', gray=False)
dk = p.darkenImg(q, 2); br = p.brightenImg(dk, 2)
fig, axs = plt.subplots(1, 3, figsize=(16.6, 6.0))
show(axs[0], q, 'original'); show(axs[1], dk.astype(np.uint8), 'darkenImg(im, 2)'); show(axs[2], br.astype(np.uint8), 'brightenImg(darkenImg(im))')
fig.tight_layout(); save(fig, 'peppers.png')
print('peppers error ida y vuelta', np.abs(br - q).max())

# --- E4: tablero
im = p.load('iglesia.pgm')
fig, axs = plt.subplots(1, 3, figsize=(14, 6.2))
show(axs[0], im, 'original'); show(axs[1], p.checkBoardImg(im, 4, 4), 'checkBoardImg(im, 4, 4)'); show(axs[2], p.checkBoardImg(im, 5, 3), 'checkBoardImg(im, 5, 3)')
fig.tight_layout(); save(fig, 'tablero.png')

# --- E6: expTransf aplicada
f1 = p.expTransf(1e-4, 256, 0, 255); f2 = p.expTransf(1e-4, 256, 0, 255, False)
fig, axs = plt.subplots(1, 3, figsize=(14, 6.2))
show(axs[0], im, 'original')
show(axs[1], p.transfImage(im, f1), 'creciente (bInc=True)'); show(axs[2], p.transfImage(im, f2), 'decreciente (bInc=False)')
fig.tight_layout(); save(fig, 'exp_iglesia.png')

print('hecho')
