"""Genera los PNG de assets/ a partir de las imágenes del lab 4 (resultados reales).
Uso: python gen_assets.py   (con el Python que tenga numpy, scipy, scikit-image, pillow y matplotlib)."""
import os, json
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from scipy.ndimage import sobel
from skimage import feature
from skimage.transform import hough_line, hough_line_peaks, probabilistic_hough_line
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

IMGS = '/home/jcrex/uji/Master-Sistemas-Inteligentes/Computer-Vision/lab/lab4/p4-4students/imgs-P4/'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets')
os.makedirs(OUT, exist_ok=True)
BG, FG, FG2, ACC, ERR = '#1a1b26', '#c0caf5', '#a9b1d6', '#7aa2f7', '#f7768e'
plt.rcParams.update({'figure.facecolor': BG, 'axes.facecolor': BG, 'savefig.facecolor': BG, 'text.color': FG,
                     'axes.labelcolor': FG2, 'xtick.color': FG2, 'ytick.color': FG2, 'font.size': 15})

cu = np.array(Image.open(IMGS + 'cuadros.png').convert('L'))
ei = np.array(Image.open(IMGS + 'einstein.pgm').convert('L'))
rng = np.random.default_rng(0)
noise = lambda im: im + rng.normal(0, 5, im.shape)
SIG = {}   # números para las diapositivas


def tiles(name, items, ncols=None, cell=3.2, title_size=15, ncols_fixed=None):
    n = len(items); ncols = ncols or n; nrows = (n + ncols - 1) // ncols
    fig, axs = plt.subplots(nrows, ncols, figsize=(cell * ncols, cell * nrows * 1.0 + 0.5 * nrows), squeeze=False)
    for ax in axs.ravel():
        ax.axis('off')
    for ax, (im, t, kw) in zip(axs.ravel(), items):
        ax.imshow(im, **({'cmap': 'gray', 'interpolation': 'nearest'} | kw))
        ax.set_title(t, fontsize=title_size * 1.25, color=FG2, family='monospace')
    fig.tight_layout(pad=1.0)
    fig.savefig(os.path.join(OUT, name), dpi=100)
    plt.close(fig)


def sym(a):
    m = np.abs(a).max()
    return dict(vmin=-m, vmax=m)

# ---- Sobel: signo del nivel de gris (cuadros) ----
f = cu.astype(float)
gx, gy = sobel(f, 1), sobel(f, 0)
tiles('sobel_cuadros.png', [(cu, 'im', dict(vmin=0, vmax=255)), (gy, 'sobel(im, 0)', sym(gy)), (gx, 'sobel(im, 1)', sym(gx))])
# perfil 1D para explicar el signo (fila de cuadros)
row = 60
SIG['row'] = [int(v) for v in cu[row, 40:60]]

# ---- gradiente en ambas direcciones y magnitud ----
for nm, im in (('cuadros', cu), ('einstein', ei)):
    f = im.astype(float); gx, gy = sobel(f, 1), sobel(f, 0); mag = np.hypot(gx, gy)
    tiles(f'grad_{nm}.png', [(im, 'im', dict(vmin=0, vmax=255)), (gx, 'gx = sobel(im, 1)', sym(gx)),
                             (gy, 'gy = sobel(im, 0)', sym(gy)), (mag, 'hypot(gx, gy)', dict(cmap='gray'))], cell=3.1, title_size=13)

# ---- binarizar: magnitud vs suma de absolutos ----
f = ei.astype(float); gx, gy = sobel(f, 1), sobel(f, 0)
mag = np.hypot(gx, gy); ap = np.abs(gx) + np.abs(gy); t = 0.2
b1, b2 = mag > t * mag.max(), ap > t * ap.max()
SIG['bin'] = dict(n1=int(b1.sum()), n2=int(b2.sum()), diff=int((b1 != b2).sum()), mx=float(mag.max()), mx2=float(ap.max()),
                  ratio=float((ap[mag > 0] / mag[mag > 0]).max()), ratio_axis=float(ap[(np.abs(gx) > 0) & (gy == 0)].min() / mag[(np.abs(gx) > 0) & (gy == 0)].min()))
t_abs = t * mag.max()      # mismo umbral absoluto para las dos magnitudes
b3 = ap > t_abs
tiles('binar.png', [(b1, 'hypot > t', {}), (b3, '|gx|+|gy| > t', {}),
                    (b1 ^ b3, 'diferencia', {})], cell=3.4, title_size=12)
SIG['bin']['abs_true'] = int(b1.sum()); SIG['bin']['abs_ap'] = int(b3.sum()); SIG['bin']['abs_xor'] = int((b1 ^ b3).sum())

# ---- ruido ----
fc = cu.astype(float); magc = np.hypot(sobel(fc, 1), sobel(fc, 0))
cn = noise(fc); magn = np.hypot(sobel(cn, 1), sobel(cn, 0))
tn = 0.05
tiles('ruido.png', [(magc, 'sin ruido: magnitud', {}), (magn, 'con ruido: magnitud', {}),
                    (magc > tn * magc.max(), 'sin ruido, umbral', {}), (magn > tn * magn.max(), 'con ruido, umbral', {})], ncols=2, cell=3.4, title_size=12)
SIG['ruido'] = dict(clean=int((magc > tn * magc.max()).sum()), noisy=int((magn > tn * magn.max()).sum()), mx=float(magc.max()), mxn=float(magn.max()),
                    medn=float(np.median(magn)), p99=float(np.percentile(magn, 99)))

# ---- Canny: rejilla sigma con y sin ruido ----
for nm, im in (('cuadros', cu), ('einstein', ei)):
    items = []
    for ruido in (False, True):
        x = noise(im.astype(float)) if ruido else im.astype(float)
        for s in (1, 3, 5):
            e = feature.canny(x, sigma=s, low_threshold=0.2 * 255, high_threshold=0.25 * 255, use_quantiles=False)
            items.append((e, f'σ={s}  {"ruido" if ruido else "limpia"}', {}))
            SIG.setdefault('canny_' + nm, {})[f'{s}{"n" if ruido else "c"}'] = int(e.sum())
    tiles(f'canny_{nm}.png', items, ncols=3, cell=3.3, title_size=12)

# ---- Canny: umbrales (einstein, sigma=2) ----
combos = [(20, 60), (20, 120), (5, 60), (60, 60)]
items = []
for lo, hi in combos:
    e = feature.canny(ei.astype(float), sigma=2, low_threshold=lo, high_threshold=hi)
    items.append((e, f'low={lo}, high={hi}', {}))
    SIG.setdefault('umbrales', {})[f'{lo}-{hi}'] = int(e.sum())
tiles('umbrales.png', items, ncols=4, cell=3.2, title_size=12)

# ---- Ejercicio 4.2: reproducción del experimento ----
r2 = np.random.default_rng(0)
sq = np.zeros((128, 128)); sq[35:95, 35:95] = 1
sq = ndi.gaussian_filter(sq, 4) * 0.8 + 0.1 + r2.normal(0, 0.05, (128, 128))
CB = [('a', 1, .1, .2), ('b', 1, .4, .6), ('c', 3, .1, .2), ('d', 3, .01, .02)]
items = [(sq, 'entrada', dict(vmin=0, vmax=1))]
for n, s, lo, hi in CB:
    e = feature.canny(sq, sigma=s, low_threshold=lo, high_threshold=hi, use_quantiles=False)
    items.append((e, f'{n}: σ={s}  {str(lo).replace(".", ",")}/{str(hi).replace(".", ",")}', {}))
    SIG.setdefault('ej42', {})[n] = int(e.sum())
tiles('ej42.png', items, ncols=5, cell=3.2, title_size=11)

# ---- Hough sobre cuadros (como el código: ruido, sigma=5) ----
x = cu.astype(float)   # bAddNoise = False
edges = feature.canny(x, sigma=5, low_threshold=0.2 * 255, high_threshold=0.25 * 255, use_quantiles=False)
thetas_in = np.linspace(-np.pi / 2, np.pi / 2, 200)
H, thetas, rhos = hough_line(edges, thetas_in)
pv, pa, pd = hough_line_peaks(H, thetas, rhos, num_peaks=np.inf, threshold=0.15 * H.max(), min_angle=20, min_distance=15)
SIG['hough'] = dict(shape=list(H.shape), nth=len(thetas), nrho=len(rhos), r5=[float(v) for v in rhos[:5]], r5e=[float(v) for v in rhos[-5:]],
                    hmax=int(H.max()), npk=len(pv), nedges=int(edges.sum()),
                    peaks=[(int(v), round(float(np.rad2deg(a)), 1), float(d)) for v, a, d in zip(pv, pa, pd)])
tiles('hough_edges.png', [(cu, 'cuadros', dict(vmin=0, vmax=255)), (edges, 'canny σ=5', {})], cell=3.6, title_size=13)
ext = [np.rad2deg(thetas[0]), np.rad2deg(thetas[-1]), rhos[-1], rhos[0]]
fig, ax = plt.subplots(figsize=(6.4, 5.0))
ax.imshow(np.log(H + 1), cmap='gray', extent=ext, aspect='auto')
ax.set_xlabel('θ (grados)'); ax.set_ylabel('ρ (píxeles)'); ax.set_title('log(H + 1)', color=FG2, family='monospace', fontsize=14)
for s in ax.spines.values(): s.set_color(FG2)
fig.tight_layout(); fig.savefig(os.path.join(OUT, 'hough_H.png'), dpi=100); plt.close(fig)
fig, ax = plt.subplots(figsize=(6.4, 5.0))
ax.imshow(np.log(H + 1), cmap='jet', extent=ext, aspect='auto')
ax.plot(np.rad2deg(pa), pd, 's', mfc='none', mec='white', ms=12, mew=2)
ax.set_xlabel('θ (grados)'); ax.set_ylabel('ρ (píxeles)'); ax.set_title(f'log(H+1) y {len(pv)} picos', color=FG2, family='monospace', fontsize=14)
fig.tight_layout(); fig.savefig(os.path.join(OUT, 'hough_peaks.png'), dpi=100); plt.close(fig)


def draw_lines(ax, im, ths, rs):
    Hh, Ww = im.shape
    ax.imshow(im, cmap='gray', vmin=0, vmax=255)
    for t, r in zip(ths, rs):
        if abs(np.sin(t)) > 1e-6:
            x1, x2 = 0, Ww; y1 = (r - x1 * np.cos(t)) / np.sin(t); y2 = (r - x2 * np.cos(t)) / np.sin(t)
        else:
            x1 = x2 = r / np.cos(t); y1, y2 = 0, Hh
        ax.plot((x1, x2), (y1, y2), '-', color=ERR, lw=2)
    ax.set_xlim(0, Ww); ax.set_ylim(Hh, 0); ax.axis('off')

fig, ax = plt.subplots(figsize=(5.2, 5.2)); draw_lines(ax, cu, pa, pd); fig.tight_layout(pad=0.2)
fig.savefig(os.path.join(OUT, 'lines.png'), dpi=100); plt.close(fig)

# ---- rotación ----
rows = []; fig, axs = plt.subplots(1, 3, figsize=(10.5, 3.6))
for ax, al in zip(axs, (0, 15, 30)):
    xr = ndi.rotate(cu, al, mode='nearest') if al else cu
    xr = xr.astype(float)
    e = feature.canny(xr, sigma=5, low_threshold=0.2 * 255, high_threshold=0.25 * 255, use_quantiles=False)
    Hr, tr, rr = hough_line(e, thetas_in)
    v, a, d = hough_line_peaks(Hr, tr, rr, num_peaks=np.inf, threshold=0.15 * Hr.max(), min_angle=20, min_distance=15)
    rows.append(dict(alpha=al, shape=list(xr.shape), n=len(v), nrho=len(rr), nedges=int(e.sum()), peaks=[(int(p), round(float(np.rad2deg(t)), 1), float(q)) for p, t, q in zip(v, a, d)]))
    draw_lines(ax, xr, a, d); ax.set_title(f'α = {al}°  {xr.shape[0]}×{xr.shape[1]}', color=FG2, family='monospace', fontsize=12)
fig.tight_layout(pad=1.0); fig.savefig(os.path.join(OUT, 'rot.png'), dpi=100); plt.close(fig)
SIG['rot'] = rows

# ---- HOG (histograma ponderado, 36 bins) ----
f = cu.astype(float); gx, gy = sobel(f, 1), sobel(f, 0); mag = np.hypot(gx, gy); ang = np.arctan2(gy, gx)
hw, _ = np.histogram(ang, bins=36, range=(-np.pi, np.pi), weights=mag)
hu, _ = np.histogram(ang, bins=36, range=(-np.pi, np.pi))
SIG['hog'] = dict(w=[round(float(v) / hw.max(), 3) for v in hw], u=[round(float(v) / hu.max(), 3) for v in hu],
                  u_raw=[int(v) for v in hu], w8=[int(v) for v in np.histogram(ang, bins=8, range=(-np.pi, np.pi), weights=mag)[0]],
                  u8=[int(v) for v in np.histogram(ang, bins=8, range=(-np.pi, np.pi))[0]], flat=int(((gx == 0) & (gy == 0)).sum()), total=int(gx.size))

# ---- segmentos ----
segs = probabilistic_hough_line(edges, threshold=5, line_length=50, line_gap=5, rng=0)
fig, axs = plt.subplots(1, 2, figsize=(9.2, 4.6)); draw_lines(axs[0], cu, pa, pd); axs[0].set_title('rectas (infinitas)', color=FG2, family='monospace', fontsize=13)
axs[1].imshow(cu, cmap='gray', vmin=0, vmax=255)
for (p0, p1) in segs: axs[1].plot((p0[0], p1[0]), (p0[1], p1[1]), '-', color=ERR, lw=4)
axs[1].set_title(f'{len(segs)} segmentos', color=FG2, family='monospace', fontsize=13); axs[1].axis('off')
fig.tight_layout(pad=1.0); fig.savefig(os.path.join(OUT, 'segmentos.png'), dpi=100); plt.close(fig)
SIG['nseg'] = len(segs)

# ---- ej 4.1: dtype ----
k = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], float)
a = sobel(cu.astype(float), 1)
SIG['e41'] = dict(conv=float(np.abs(a - ndi.convolve(cu.astype(float), k)).max()), corr=float(np.abs(a - ndi.correlate(cu.astype(float), k)).max()),
                  flip=float(np.abs(a - ndi.convolve(cu.astype(float), k[::-1, ::-1])).max()), u8=float(np.abs(sobel(cu, 1).astype(float) - a).max()),
                  u8dtype=str(sobel(cu, 1).dtype), u8max=int(sobel(cu, 1).max()), fmax=float(a.max()), fmin=float(a.min()))

json.dump(SIG, open(os.path.join(OUT, 'numeros.json'), 'w'), indent=1, ensure_ascii=False)
print(json.dumps(SIG, indent=1, ensure_ascii=False))
