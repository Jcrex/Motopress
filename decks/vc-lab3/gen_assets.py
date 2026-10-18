# Genera los PNG de vc-lab3 a partir de las imágenes del lab 3 (resultados reales).
import os, sys, json, pickle
import numpy as np, numpy.fft as fft
from PIL import Image
from scipy.ndimage import convolve
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'assets') + os.sep
IM = '/home/jcrex/uji/Master-Sistemas-Inteligentes/Computer-Vision/lab/lab3/p3-4students/imgs-P3/'
TIEMPOS = '/home/jcrex/uji/Master-Sistemas-Inteligentes/Computer-Vision/Teoria/Videos/02_Lab3_Fourier/assets/tiempos.json'

def load(n): return np.array(Image.open(IM + n).convert('L'), float)
def FT(im): return fft.fftshift(fft.fft2(im))
def IFT(f): return fft.ifft2(fft.ifftshift(f))
def save(a, name, lo=None, hi=None, size=None):
    a = np.asarray(a, float); lo = a.min() if lo is None else lo; hi = a.max() if hi is None else hi
    g = np.clip((a - lo) / (hi - lo + 1e-12), 0, 1) * 255
    im = Image.fromarray(g.astype(np.uint8))
    if size: im = im.resize(size, Image.LANCZOS)
    im.save(OUT + name)
def savecm(a, name, cmap, lo, hi):
    plt.imsave(OUT + name, np.clip(a, lo, hi), cmap=cmap, vmin=lo, vmax=hi)

def pad_center(mask, shape):
    big = np.zeros(shape); h, w = mask.shape
    r0, c0 = shape[0]//2 - h//2, shape[1]//2 - w//2
    big[r0:r0+h, c0:c0+w] = mask
    return big
def avg(n): return np.ones((n, n)) / n**2
def dist(shape):
    v, u = np.indices(shape); return np.hypot(u - shape[1]//2, v - shape[0]//2)
def bp(shape, r=None, R=None):
    D = dist(shape)
    if R is None: H = D < r
    elif r is None: H = D > R
    else: H = (D > r) & (D < R)
    return H.astype(float)
def apply(im, H): return np.real(IFT(FT(im) * H))
def butter(shape, c, n=2): return 1 / (1 + (dist(shape) / c)**(2 * n))
def gauss(shape, c): return np.exp(-dist(shape)**2 / (2 * c**2))

S = {}
E = load('einstein.pgm'); shp = E.shape; S['shape'] = shp
# --- bloque A
F = FT(E)
save(E, 'ein.png')
save(np.log1p(np.abs(F)), 'ein_mag.png')
savecm(np.angle(F), 'ein_fase.png', 'twilight', -np.pi, np.pi)
rec = IFT(F); S['imag_max'] = float(np.abs(rec.imag).max()); S['rec_err'] = float(np.abs(rec.real - E).max())
save(np.real(rec), 'ein_rec.png', 0, 255)
# fftshift mal usado: sin ifftshift al volver
bad = fft.ifft2(F); save(np.abs(bad), 'ein_sin_ifftshift.png', 0, 255)
S['dc_ok'] = bool(np.isclose(np.abs(F).max(), E.sum()))
savecm(np.real(bad), 'ein_sin_ifftshift_real.png', 'gray', -255, 255)
plt.imsave(OUT + 'ein_sin_ifftshift_zoom.png', np.kron(np.real(bad)[200:240, 150:190], np.ones((10, 10))), cmap='gray', vmin=-255, vmax=255)
S['bad_real_rng'] = [float(np.real(bad).min()), float(np.real(bad).max())]
S['bad_abs_err'] = float(np.abs(np.abs(bad) - E).max())
# --- bloque B
n = 15
esp = convolve(E, avg(n)); esp_w = convolve(E, avg(n), mode='wrap')
big = pad_center(avg(n), shp)
fre = np.absolute(IFT(FT(E) * FT(fft.ifftshift(big))))
# versión del profesor (n=7) para el RMS impreso
def rms_prof(n):
    e = convolve(E, avg(n)); f = np.absolute(IFT(FT(E) * FT(fft.ifftshift(pad_center(avg(n), shp)))))
    m = 5
    return float(np.linalg.norm(e[m:-m, m:-m] - f[m:-m, m:-m], 2) / np.prod(E.shape)), float(np.sqrt(np.mean((e - f)**2))), float(np.sqrt(np.mean((e[m:-m,m:-m]-f[m:-m,m:-m])**2))), float(np.sqrt(np.mean((esp_w - f)**2)) if n == 15 else 0)
S['rms7'] = rms_prof(7); S['rms15'] = rms_prof(15)
S['rms7_wrap'] = float(np.sqrt(np.mean((convolve(E, avg(7), mode='wrap') - np.absolute(IFT(FT(E) * FT(fft.ifftshift(pad_center(avg(7), shp)))))) ** 2)))
S['max_diff_borde'] = float(np.abs(esp - fre).max())
save(esp, 'conv_esp.png', 0, 255); save(fre, 'conv_frec.png', 0, 255)
nos = np.absolute(IFT(FT(E) * FT(big)))   # sin ifftshift de la máscara
save(nos, 'conv_sin_shift.png', 0, 255)
save(big, 'mask_grande.png'); save(fft.ifftshift(big) * 1.0, 'mask_shift.png')
# máscara 'visible' para el diagrama: caja 61x61 blanca
vis = pad_center(np.ones((61, 61)), shp); save(vis, 'diag_pequena.png', 0, 1); save(fft.ifftshift(vis), 'diag_shift.png', 0, 1)
# tiempos
T = json.load(open(TIEMPOS))
fig, ax = plt.subplots(figsize=(7.2, 5.4), dpi=100)
def style(ax):
    ax.set_facecolor('#0d1117'); fig.patch.set_facecolor('#0d1117')
    for s in ax.spines.values(): s.set_color('#6b7686')
    ax.tick_params(colors='#c9d1d9', labelsize=15); ax.xaxis.label.set_color('#c9d1d9'); ax.yaxis.label.set_color('#c9d1d9')
    ax.xaxis.label.set_size(17); ax.yaxis.label.set_size(17); ax.title.set_color('#e6edf3'); ax.title.set_size(17)
    ax.grid(color='#30363d', ls=':')
ns = sorted(int(k) for k in T['mask']); 
e = np.array([T['mask'][str(k)][0] for k in ns]); f_ = np.array([T['mask'][str(k)][1] for k in ns])
ax.errorbar(ns, e[:, 0]*1e3, e[:, 1]*1e3, color='#58a6ff', marker='o', lw=3, capsize=4, label='espacial (convolve)')
ax.errorbar(ns, f_[:, 0]*1e3, f_[:, 1]*1e3, color='#f0883e', marker='s', lw=3, capsize=4, label='frecuencia (FFT)')
ax.set_xlabel('lado m de la máscara'); ax.set_ylabel('tiempo (ms)'); ax.set_title('Imagen fija 512×512'); style(ax)
leg = ax.legend(fontsize=15, facecolor='#161b22', edgecolor='#30363d'); [t.set_color('#e6edf3') for t in leg.get_texts()]
fig.tight_layout(); fig.savefig(OUT + 't_mask.png'); plt.close(fig)
fig, ax = plt.subplots(figsize=(7.2, 5.4), dpi=100)
Ns = sorted(int(k) for k in T['size'])
e = np.array([T['size'][str(k)][0] for k in Ns]); f_ = np.array([T['size'][str(k)][1] for k in Ns])
ax.errorbar(Ns, e[:, 0]*1e3, e[:, 1]*1e3, color='#58a6ff', marker='o', lw=3, capsize=4, label='espacial (convolve)')
ax.errorbar(Ns, f_[:, 0]*1e3, f_[:, 1]*1e3, color='#f0883e', marker='s', lw=3, capsize=4, label='frecuencia (FFT)')
ax.set_xscale('log', base=2); ax.set_yscale('log'); ax.set_xticks(Ns); ax.set_xticklabels(Ns)
ax.set_xlabel('lado N de la imagen'); ax.set_ylabel('tiempo (ms, log)'); ax.set_title('Máscara fija 7×7'); style(ax)
leg = ax.legend(fontsize=15, facecolor='#161b22', edgecolor='#30363d'); [t.set_color('#e6edf3') for t in leg.get_texts()]
fig.tight_layout(); fig.savefig(OUT + 't_size.png'); plt.close(fig)
S['tmask'] = {k: [v[0][0]*1e3, v[1][0]*1e3] for k, v in T['mask'].items()}
S['tsize'] = {k: [v[0][0]*1e3, v[1][0]*1e3] for k, v in T['size'].items()}
# --- bloque C
for r in (5, 20, 50): save(apply(E, bp(shp, r=r)), f'lp{r}.png', 0, 255)
for R in (10, 30): save(np.abs(apply(E, bp(shp, R=R))), f'hp{R}.png')
save(np.abs(apply(E, bp(shp, 30, 80))), 'bp30_80.png')
save(bp((255, 255), 30, 80), 'bp_mask.png', 0, 1)
save(bp(shp, r=20), 'm_ideal.png', 0, 1); save(butter(shp, 20), 'm_butter.png', 0, 1); save(gauss(shp, 20), 'm_gauss.png', 0, 1)
for nm, H in (('ideal', bp(shp, r=20)), ('butter', butter(shp, 20)), ('gauss', gauss(shp, 20))):
    o = apply(E, H); save(o, f'o_{nm}.png', 0, 255); S['rango_' + nm] = [float(o.min()), float(o.max())]
# perfil espacial del filtro ideal (sinc-like) y butterworth
for nm, H in (('ideal', bp(shp, r=20)), ('butter', butter(shp, 20)), ('gauss', gauss(shp, 20))):
    h = np.real(IFT(H)); h = fft.fftshift(h)
    c = np.array(h.shape) // 2; save(h[c[0]-40:c[0]+41, c[1]-40:c[1]+41], f'h_{nm}.png')
    S['h_neg_' + nm] = float(h.min() / h.max())
# 1D perfil del ideal en el espacio
N = 512; Hh = (np.abs(np.arange(N) - N//2) < 20).astype(float); hh = np.real(fft.fftshift(fft.ifft(fft.ifftshift(Hh))))
fig, ax = plt.subplots(figsize=(7.2, 4.2), dpi=100)
x = np.arange(-60, 61); ax.plot(x, hh[N//2-60:N//2+61]/hh.max(), color='#f0883e', lw=3)
ax.axhline(0, color='#6b7686', lw=1); ax.set_xlabel('posición x (píxeles)'); ax.set_ylabel('h(x) normalizada'); ax.set_title('Corte 1D del filtro ideal en el espacio'); style(ax)
fig.tight_layout(); fig.savefig(OUT + 'sinc1d.png'); plt.close(fig)
# --- bloque D: E1
mag, fase = np.abs(F), np.angle(F)
S['mag_min'] = float(mag.min()); S['mag_max'] = float(mag.max()); S['suma'] = float(E.sum())
S['q'] = [float(q) for q in np.percentile(mag, [25, 50, 75])]
fig, axs = plt.subplots(1, 2, figsize=(10.4, 4.8), dpi=100)
axs[0].boxplot(mag.ravel(), flierprops=dict(marker='.', markersize=2, markeredgecolor='#58a6ff'), boxprops=dict(color='#f0883e', lw=2), medianprops=dict(color='#f0883e', lw=3), whiskerprops=dict(color='#f0883e'), capprops=dict(color='#f0883e'))
axs[0].set_yscale('log'); axs[0].set_title('boxplot de |F| (log)'); axs[0].set_xticks([])
axs[1].hist(fase.ravel(), bins=64, color='#58a6ff'); axs[1].set_title('histograma de la fase'); axs[1].set_xlabel('fase (rad)')
for a in axs: style(a)
fig.tight_layout(); fig.savefig(OUT + 'e1.png'); plt.close(fig)
cnt, _ = np.histogram(fase.ravel(), bins=64); S['hist_ratio'] = float(cnt.max() / cnt.min())
# E2: FT de máscaras
def gaussFilter(s):
    k = int(np.ceil(3*s)); x = np.arange(-k, k+1); g = np.exp(-x**2/(2*s**2)); m = np.outer(g, g); return m/m.sum()
for s in (1, 4): save(np.log1p(np.abs(FT(fft.ifftshift(pad_center(gaussFilter(s), shp))))*1000), f'ftg{s}.png')
save(np.abs(FT(fft.ifftshift(pad_center(avg(7), shp)))), 'ftbox7.png')
for s in (1, 2, 4):
    M = gaussFilter(s); out = apply(E, FT(fft.ifftshift(pad_center(M, shp))))
    S[f'e2_rms_{s}'] = float(np.sqrt(np.mean((convolve(E, M, mode='wrap') - out)**2)))
S['gauss_ft_dc'] = float(np.abs(FT(fft.ifftshift(pad_center(gaussFilter(2), shp)))).max())
# E4
def my_mask(n): return np.sign(np.subtract.outer(np.arange(n), np.arange(n)))
S['m4'] = my_mask(4).tolist()
S['alt'] = bool(np.array_equal(my_mask(5), np.tri(5, k=-1) - np.tri(5, k=-1).T))
o = apply(E, FT(fft.ifftshift(pad_center(my_mask(5), shp)))); S['e4_rng'] = [float(o.min()), float(o.max())]
S['e4_vs_conv'] = float(np.sqrt(np.mean((convolve(E, my_mask(5), mode='wrap') - o)**2)))
# E5
y, x = np.indices((256, 256)); I1 = ((x // 8) % 2).astype(float); I2 = (((x + y) // 8) % 2).astype(float)
save(I1, 'st1.png'); save(I2, 'st2.png'); save(0.5*I1 + 0.5*I2, 'st_mix.png')
F1, F2 = FT(I1), FT(I2)
S['lin'] = [bool(np.allclose(np.real(IFT(l*F1 + (1-l)*F2)), l*I1 + (1-l)*I2)) for l in np.linspace(0, 1, 5)]
# E6
G1, G2 = fft.fft2(I1), fft.fft2(I2); L = fft.fft2(I1*I2)
circ = lambda A, B: fft.ifft2(fft.fft2(A)*fft.fft2(B))
S['e6'] = [bool(np.allclose(L, G1*G2)), bool(np.allclose(L, circ(G1, G2)/I1.size))]
# E8
A, B = load('a.pgm'), load('b.pgm'); idx = pickle.load(open(IM + 'positions.p', 'rb')); r, c = np.array(idx).T
S['npos'] = len(idx); S['e8'] = {}
for nm, X in (('a', A), ('b', B)):
    FX = FT(X); dP = np.abs(FX[r, c] - F[r, c]).mean(); dA = np.abs(FX - F).mean()
    S['e8'][nm] = dict(dPos=float(dP), dAll=float(dA), ratio=float(dP/dA), rms=float(np.sqrt(np.mean((X-E)**2))))
save(np.log1p(np.abs(FT(B) - F)), 'dF_b.png'); save(np.log1p(np.abs(FT(A) - F)), 'dF_a.png', 0, np.log1p(np.abs(FT(B) - F)).max())
# fase vs magnitud
h = np.array(Image.open(IM + 'habas.pgm').convert('L'), float)
e256 = np.array(Image.open(IM + 'einstein.pgm').convert('L').resize((256, 256), Image.LANCZOS), float)
Fe, Fh = fft.fft2(e256), fft.fft2(h)
mix1 = np.real(fft.ifft2(np.abs(Fe) * np.exp(1j*np.angle(Fh))))   # mag einstein, fase habas
mix2 = np.real(fft.ifft2(np.abs(Fh) * np.exp(1j*np.angle(Fe))))   # mag habas, fase einstein
save(e256, 'ein256.png'); save(h, 'habas.png')
save(mix1, 'mix_mE_fH.png'); save(mix2, 'mix_mH_fE.png')
# plantilla lowpass/highpass y comprobación
def lowpass(im, r):
    H = bp(im.shape, r=r); return np.real(IFT(FT(im) * H))
def highpass(im, r): return np.real(IFT(FT(im) * (1 - bp(im.shape, r=r))))
S['hp_ok'] = bool(np.allclose(highpass(E, 20) + lowpass(E, 20), E))
S['theo_allclose'] = bool(np.allclose(convolve(E, avg(7), mode='wrap'), np.real(IFT(FT(E) * FT(fft.ifftshift(pad_center(avg(7), shp)))))))
json.dump(S, open(OUT + '_stats.json', 'w'), indent=1)
print(json.dumps(S, indent=1))

# --- pase de revisión: datos de las gráficas vc-plot (se copian a index.html) ---
# testConvTheo: log10 del RMS real (reflect frente a FFT) según el margen excluido
for n in (7, 15):
    e = convolve(E, avg(n)); f = np.real(IFT(FT(E) * FT(fft.ifftshift(pad_center(avg(n), shp)))))
    print('margen', n, [round(float(np.log10(np.sqrt(np.mean(((e - f) if m == 0 else (e - f)[m:-m, m:-m])**2)))), 2) for m in range(13)])
# perfil de la fila donde el paso bajo ideal (D0 = 20) alcanza su mínimo (fila 371), columnas 110..328 de 2 en 2
o_id = apply(E, bp(shp, r=20)); rr, cc = np.unravel_index(o_id.argmin(), shp); print('min ideal en', rr, cc, o_id.min())
for nm, o in (('orig', E), ('ideal', o_id), ('gauss', apply(E, gauss(shp, 20)))):
    print('perfil', nm, [round(float(v)) for v in o[rr, 110:330:2]])
# tiempos (de tiempos.json, en ms): ver S['tmask'] y S['tsize']
