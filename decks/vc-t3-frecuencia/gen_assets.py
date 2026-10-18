#!/usr/bin/env python3
# Genera los PNG reales del deck vc-t3-frecuencia (ejecutar con el venv con numpy, scipy, pillow).
import os, numpy as np
from PIL import Image
from scipy.special import j1
import numpy.fft as fft
C = '/home/jcrex/uji/Master-Sistemas-Inteligentes/Computer-Vision/'
L3 = C + 'lab/lab3/p3-4students/imgs-P3/'
RE = C + 'Teoria/Videos/01_Resumen_Examen/assets/'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets') + os.sep
os.makedirs(OUT, exist_ok=True)

def load(p): return np.array(Image.open(p).convert('L'), float)
def save(name, a, lo=None, hi=None):
    lo = a.min() if lo is None else lo; hi = a.max() if hi is None else hi
    b = np.clip((a - lo) / (hi - lo + 1e-12), 0, 1) * 255
    Image.fromarray(b.astype(np.uint8)).save(OUT + name)
FT = lambda im: fft.fftshift(fft.fft2(im))
IFT = lambda F: np.real(fft.ifft2(fft.ifftshift(F)))
def lg(F): return np.log1p(np.abs(F))

ein = load(L3 + 'einstein.pgm')            # 497 x 407
ein = np.array(Image.fromarray(ein.astype(np.uint8)).resize((256, 314)), float)  # reducida
H, W = ein.shape
F = FT(ein)

# 1) ondas 2D (mosaico real)
N = 128
y, x = np.mgrid[0:N, 0:N]
for (u, v) in [(2, 0), (3, 1), (7, -5)]:
    w = np.cos(2 * np.pi * (u * x / N + v * y / N))
    save('onda_%d_%d.png' % (u, v), w, -1, 1)

# 2) reconstrucción con los K mayores coeficientes
save('ein_orig.png', ein, 0, 255)
mag = np.abs(F).ravel()
for pct in (1, 5, 20):
    k = int(round(mag.size * pct / 100))
    thr = np.sort(mag)[-k]
    Fk = np.where(np.abs(F) >= thr, F, 0)
    rec = IFT(Fk)
    save('ein_top%d.png' % pct, rec, 0, 255)
    print('top', pct, 'error RMS', np.sqrt(np.mean((rec - ein) ** 2)))

# 3) espectro sin y con log
save('esp_lin.png', np.abs(F), 0, np.abs(F).max())
save('esp_log.png', lg(F))

# 4) traslación
sh = np.roll(ein, (40, 70), axis=(0, 1))
Fs = FT(sh)
save('ein_shift.png', sh, 0, 255)
save('esp_shift.png', lg(Fs))
save('fase_orig.png', np.angle(F), -np.pi, np.pi)
save('fase_shift.png', np.angle(Fs), -np.pi, np.pi)
print('traslación: max dif |F|', np.abs(np.abs(F) - np.abs(Fs)).max())

# 5) rotación (imagen cuadrada con disco para evitar esquinas)
sq = np.array(Image.fromarray(ein.astype(np.uint8)).crop((0, 20, 256, 276)), float)
yy, xx = np.mgrid[0:256, 0:256]
disc = ((xx - 128) ** 2 + (yy - 128) ** 2) < 125 ** 2
sq = np.where(disc, sq, 0)
rot = np.array(Image.fromarray(sq.astype(np.uint8)).rotate(30, resample=Image.BICUBIC), float)
save('rot_orig.png', sq, 0, 255); save('rot_img.png', rot, 0, 255)
save('rot_esp0.png', lg(FT(sq))); save('rot_esp1.png', lg(FT(rot)))

# 6) magnitud frente a fase
def sq256(a):
    h, w = a.shape; s = min(h, w); r0, c0 = (h - s) // 2, (w - s) // 2
    return np.array(Image.fromarray(a[r0:r0+s, c0:c0+s].astype(np.uint8)).resize((256, 256)), float)
A = sq256(load(L3 + 'einstein.pgm')); B = load(RE + 'lena256.pgm')
def mix(m, p): return IFT(np.abs(FT(m)) * np.exp(1j * np.angle(FT(p))))
save('mf_A.png', A, 0, 255); save('mf_B.png', B, 0, 255)
save('mf_magA_faseB.png', mix(A, B)); save('mf_magB_faseA.png', mix(B, A))
Mi = load(L3 + 'mimbre.pgm'); Ha = load(L3 + 'habas.pgm')
save('mf_mimbre.png', Mi, 0, 255); save('mf_habas.png', Ha, 0, 255)
save('mf_magMim_faseHab.png', mix(Mi, Ha)); save('mf_magHab_faseMim.png', mix(Ha, Mi))
save('mf_esp_mimbre.png', lg(FT(Mi)))

# 7) filtros paso bajo / alto: ideal y gaussiano sobre einstein reducida
v, u = np.indices((H, W)); D = np.hypot(u - W // 2, v - H // 2)
def ideal(D0): return (D <= D0).astype(float)
def gaus(D0): return np.exp(-D ** 2 / (2 * D0 ** 2))
def app(Hf): return IFT(F * Hf)
for d0 in (10, 30, 60, 160):
    save('ilp_%d.png' % d0, np.clip(app(ideal(d0)), 0, 255), 0, 255)
for d0 in (10, 30, 60):
    save('glp_%d.png' % d0, np.clip(app(gaus(d0)), 0, 255), 0, 255)
save('mask_ilp30.png', ideal(30), 0, 1); save('mask_glp30.png', gaus(30), 0, 1)
# núcleo espacial del ideal (D0=30): perfil horizontal por el centro
h = np.real(fft.fftshift(fft.ifft2(fft.ifftshift(ideal(30)))))
prof = h[H // 2, W // 2 - 40: W // 2 + 41]
prof = prof / prof.max()
open(OUT + 'perfil_ideal.json', 'w').write(str([round(float(p), 4) for p in prof]))
hg = np.real(fft.fftshift(fft.ifft2(fft.ifftshift(gaus(30)))))
pg = hg[H // 2, W // 2 - 40: W // 2 + 41]; pg = pg / pg.max()
open(OUT + 'perfil_gauss.json', 'w').write(str([round(float(p), 4) for p in pg]))
# 8) paso alto ideal y gaussiano (D0=30) y DoG
save('ihp_30.png', app(1 - ideal(30)), -60, 60)
save('ghp_30.png', app(1 - gaus(30)), -60, 60)
dog = gaus(60) - gaus(20)   # DoG paso banda: ancho menos estrecho (>= 0)
save('dog_30.png', app(dog), -60, 60)
# 9) interferencia periódica y notch
yy, xx = np.mgrid[0:H, 0:W]
u0, v0 = 40, 25
noisy = ein + 40 * np.cos(2 * np.pi * (u0 * xx / W + v0 * yy / H))
Fn = FT(noisy)
save('notch_img.png', np.clip(noisy, 0, 255), 0, 255)
save('notch_esp.png', lg(Fn))
cu, cv = W // 2, H // 2
Hn = np.ones((H, W))
for s in (1, -1):
    Dk = np.hypot(u - (cu + s * u0), v - (cv + s * v0))
    Hn *= 1 - np.exp(-Dk ** 2 / (2 * 5 ** 2))
save('notch_mask.png', Hn, 0, 1)
save('notch_out.png', np.clip(IFT(Fn * Hn), 0, 255), 0, 255)
save('notch_esp2.png', lg(Fn * Hn))

# 10) wraparound: gaussiana grande con y sin relleno
Gs = 12
def gauss_k(shape, s):
    vv, uu = np.indices(shape)
    g = np.exp(-((uu - shape[1] // 2) ** 2 + (vv - shape[0] // 2) ** 2) / (2 * s ** 2)); return g / g.sum()
def filt(im, k): return np.real(fft.ifft2(fft.fft2(im) * fft.fft2(fft.ifftshift(k))))
circ = filt(ein, gauss_k(ein.shape, Gs))
P = np.pad(ein, ((0, H), (0, W)))
pad = filt(P, gauss_k(P.shape, Gs))[:H, :W]
save('wrap_circ.png', circ, 0, 255); save('wrap_pad.png', pad, 0, 255)
dif = np.abs(circ - pad)
print('wrap dif max', dif.max(), 'media', dif.mean())
save('wrap_dif.png', np.sqrt(dif), 0, np.sqrt(dif.max()))  # raíz para que se vea el error pequeño
# 11) espectro sin fftshift (DC en las esquinas)
save('esp_noshift.png', np.log1p(np.abs(fft.fft2(ein))))
# 12) superficie de correlación de fase (einstein trasladada (40, 70) circularmente)
from scipy.ndimage import grey_dilation
R = fft.fft2(sh) * np.conj(fft.fft2(ein)); R /= np.abs(R) + 1e-12
r = np.real(fft.ifft2(R))
print('corr fase: pico en', np.unravel_index(np.argmax(r), r.shape), 'valor', r.max())
save('corr_pico.png', grey_dilation(np.clip(r, 0, None), size=(7, 7)), 0, r.max())  # pico ampliado 7x7 para verlo
# 13) máscaras para el ejercicio de emparejar (mismo tamaño que las salidas)
save('mask_ghp30.png', 1 - gaus(30), 0, 1)
save('mask_dog.png', dog, 0, dog.max())
# 14) máscara 2D de banda eliminada gaussiana (C0 = 50, W = 20)
Dq = np.maximum(D, 1e-6)
Hbr = 1 - np.exp(-((Dq ** 2 - 50 ** 2) / (Dq * 20)) ** 2)
save('mask_br.png', Hbr, 0, 1)
print('listo', H, W)
