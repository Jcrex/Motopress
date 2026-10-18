"""Verificación ejecutable de TODO el código que aparece en el deck vc-examen."""
import numpy as np
from PIL import Image
from scipy.ndimage import convolve, correlate, gaussian_filter, uniform_filter, sobel
from scipy.signal import medfilt2d
from skimage import feature
from skimage.transform import hough_line, hough_line_peaks

R = '/home/jcrex/uji/Master-Sistemas-Inteligentes/Computer-Vision/lab/'
P1 = R + 'lab1/p1-4students/imgs-P1/'
P2 = R + 'lab2/p2-4students/imgs-P2/'
np.random.seed(0)
out = {}

# ---------- Ej. 1 filterIm
def filterIm(im):
    mask = np.array([[-1,-1,2],[-1,2,-1],[2,-1,-1]])
    return convolve(im, mask)
mask = np.array([[-1,-1,2],[-1,2,-1],[2,-1,-1]])
assert mask.sum() == 0
assert (mask[::-1, ::-1] == mask).all()           # simetría central
im = np.zeros((5,5), np.uint8); 
for i in range(5): im[i, 4-i] = 9                   # diagonal "/" (+45°)
r_u8 = filterIm(im); r_f = filterIm(im.astype(float))
print('uint8 diag /:\n', r_u8, r_u8.dtype); print('float:\n', r_f)
im2 = np.zeros((5,5), np.uint8)
for i in range(5): im2[i, i] = 9                    # diagonal "\"
print('float diag \\:\n', filterIm(im2.astype(float)))
assert (convolve(im.astype(float), mask) == correlate(im.astype(float), mask)).all()
# valor real sobre imagen uint8 (centro de la línea, borde)
print('uint8 centro', r_u8[2,2], 'float centro', r_f[2,2], '| vecino', r_u8[2,1], r_f[2,1])

# ---------- Ej. 2 countIm
def countIm(im, thr, sX, sY, minCount):
    im_th = (im < thr).astype(float)
    return convolve(im_th, np.ones((sX, sY))) >= minCount
def countIm_loops(im, thr, sX, sY, minCount):
    m, n = im.shape; out = np.zeros((m,n), bool); th = im < thr
    for i in range(m):
        for j in range(n):
            c = 0
            for a in range(-(sX//2), sX//2+1):
                for b in range(-(sY//2), sY//2+1):
                    ii, jj = i+a, j+b
                    if 0 <= ii < m and 0 <= jj < n: c += th[ii, jj]
            out[i,j] = c >= minCount
    return out
g = np.array(Image.open(P2+'cat256.pgm')).astype(float)
a = countIm(g, 60, 3, 3, 4)
# bucle con borde de ceros (mode='constant') debe coincidir con convolve mode='constant'
b = convolve((g<60).astype(float), np.ones((3,3)), mode='constant') >= 4
assert (countIm_loops(g, 60, 3, 3, 4) == b).all()
print('countIm reflect vs constant difieren en', (a != b).sum(), 'píxeles')
B = np.array([[0,1,1,0,0],[1,1,0,0,1],[0,1,0,1,1],[0,0,0,1,0],[1,0,1,1,1]])
cnt = convolve(B.astype(float), np.ones((3,3)), mode='constant')
print('B\n', B, '\nconteos (constant)\n', cnt.astype(int), '\n>=4\n', (cnt>=4).astype(int))
assert np.allclose(uniform_filter(B.astype(float), 3, mode='constant')*9, cnt)
# sX filas
assert convolve(np.ones((10,10)), np.ones((2,5)), mode='constant').shape == (10,10)
print('np.ones((2,5)).shape', np.ones((2,5)).shape)

# ---------- Ej. 3 blurFgBk
def blurFgBk(im, fgMask, bFg, sigma):
    im_f = gaussian_filter(im, sigma)
    if bFg: a, b = 1 - fgMask, fgMask
    else:   a, b = fgMask, 1 - fgMask
    return a*im + b*im_f
def blurFgBk2(im, fgMask, bFg, sigma):
    return np.where(fgMask == bFg, gaussian_filter(im, sigma), im)
g = np.array(Image.open(P2+'boat256.pgm')).astype(float)
fg = np.zeros(g.shape, bool); fg[60:200, 80:180] = True
for bFg in (True, False):
    o1 = blurFgBk(g, fg, bFg, 3); o2 = blurFgBk2(g, fg, bFg, 3)
    assert np.allclose(o1, o2)
    print('bFg', bFg, 'equivalentes; objeto borroso:', not np.allclose(o1[fg], g[fg]) if bFg else np.allclose(o1[fg], g[fg]))
# ~fgMask vs 1-fgMask
assert (1 - fg == ~fg).all()
try:
    _ = (fg - fg)
except TypeError as e: print('bool - bool ->', type(e).__name__)
c = np.array(Image.open(P1+'peppers.ppm')) / 255.0
fgc = np.zeros(c.shape[:2], bool); fgc[100:300, 100:300] = True
try:
    blurFgBk(c, fgc, True, 3)
except ValueError as e: print('color con oficial ->', 'ValueError', str(e)[:60])
def blurFgBk_color(im, fgMask, bFg, sigma):
    im_f = gaussian_filter(im, (sigma, sigma, 0))
    sel = (fgMask == bFg)[..., None]
    return np.where(sel, im_f, im)
oc = blurFgBk_color(c, fgc, True, 3)
# canal a canal debe coincidir con la versión gris por canal
for k in range(3):
    assert np.allclose(oc[:,:,k], blurFgBk2(c[:,:,k], fgc, True, 3))
# trampa: gaussian_filter(im, sigma) en color mezcla canales
mixed = gaussian_filter(c, 3)
print('color mezclando canales: diferencia máx vs correcto', np.abs(mixed - gaussian_filter(c, (3,3,0))).max())
def blurFgBk_convex(im, fgMask, bFg, sigma):
    im_f = gaussian_filter(im, (sigma, sigma, 0))
    w = (fgMask if bFg else ~fgMask)[..., None]            # 1 donde hay que emborronar
    return (1 - w)*im + w*im_f
assert np.allclose(convex := blurFgBk_convex(c, fgc, True, 3), oc)

# ---------- Ej. 4 gamma / rgb2gray
def gamma_correction(im, a, gamma): return a * im**gamma
def rgb2gray(im_rgb, bChoice1=False):
    coeffs = np.array([0.2126, 0.7512, 0.0722]); gamma = 1/2.2
    if bChoice1:
        im_rgb = gamma_correction(im_rgb, 1, gamma)
        return coeffs[0]*im_rgb[:,:,0] + coeffs[1]*im_rgb[:,:,1] + coeffs[2]*im_rgb[:,:,2]
    return (gamma_correction(im_rgb[:,:,0], coeffs[0], gamma) + gamma_correction(im_rgb[:,:,1], coeffs[1], gamma)
            + gamma_correction(im_rgb[:,:,2], coeffs[2], gamma))
assert np.allclose(rgb2gray(c, True), rgb2gray(c, False))
print('suma coeficientes enunciado', 0.2126+0.7512+0.0722, 'BT.709', 0.2126+0.7152+0.0722)
print('blanco con 0.7512:', rgb2gray(np.ones((1,1,3))).item())
gamma = 1/2.2
cf = np.array([0.2126, 0.7512, 0.0722])
assert np.allclose(rgb2gray(c)  , (c**gamma) @ cf)
assert np.allclose(rgb2gray(c)  , np.tensordot(c**gamma, cf, axes=([2],[0])))
assert np.allclose(rgb2gray(c), sum(gamma_correction(c[:,:,k], cf[k], gamma) for k in range(3)))
print('gamma 0.5**(1/2.2)=', 0.5**gamma, ' 0.5**2=', 0.5**2)
# 255 sin normalizar
print('uint8 100**gamma:', np.uint8(100)**gamma, ' (0.392)**gamma:', (100/255)**gamma)

# ---------- Ej. 5 TLA
def add_TLA_noise(im, p=0.1):
    im = im.copy()
    t, l, a = 1, 2, 3
    noise_pattern = {t:[1,0,0], l:[0,1,0], a:[0.5,0,0.5]}
    m, n, k = im.shape
    where = np.random.rand(m, n) < p
    which = np.random.randint(t, a+1, (m, n))
    which_where = which * where
    for noise_type in [t, l, a]:
        im[which_where == noise_type, :] = noise_pattern[noise_type]
    return im
def remove_TLA_noise(im_noisy):
    im = np.copy(im_noisy)
    for k in range(im.shape[2]):
        im[:,:,k] = medfilt2d(im_noisy[:,:,k])
    return im
im0 = np.array(Image.open(P1+'peppers.ppm')) / 255.0
orig = im0.copy()
noisy = add_TLA_noise(im0, 0.1)
assert (im0 == orig).all()                                       # no modifica la entrada
aff = (noisy != im0).any(axis=2)
print('fracción afectada', aff.mean(), '(≈0.1; algo menos: pixeles que ya eran del patrón)')
# proporción por tipo (sobre imagen aleatoria para evitar coincidencias)
rr = np.random.rand(1000, 1000, 3)*0.8+0.1
nz = add_TLA_noise(rr, 0.1)
isT = (nz == [1,0,0]).all(2).mean(); isL = (nz == [0,1,0]).all(2).mean(); isA = (nz == [.5,0,.5]).all(2).mean()
print('T,L,A', isT, isL, isA, ' (p/3 =', 0.1/3, ')')
# versión oficial sin copy modifica la entrada
def add_TLA_official(im, p=0.1):
    t,l,a=1,2,3; pat={t:[1,0,0],l:[0,1,0],a:[0.5,0,0.5]}; m,n,k=im.shape
    w=np.random.rand(m,n)<p; wh=np.random.randint(t,a+1,(m,n)); ww=wh*w
    for nt in [t,l,a]: im[ww==nt,:]=pat[nt]
    return im
tmp = orig.copy(); add_TLA_official(tmp, .1); print('oficial modifica entrada:', not (tmp == orig).all())
clean = remove_TLA_noise(noisy)
def psnr(a, b): return 10*np.log10(1/np.mean((a-b)**2))
print('PSNR ruidosa', psnr(orig, noisy), 'limpia', psnr(orig, clean))
mean_f = gaussian_filter(noisy, (1,1,0)); print('PSNR gaussiana', psnr(orig, mean_f))
mean3 = uniform_filter(noisy, (3,3,1)); print('PSNR media 3x3', psnr(orig, mean3))
out['psnr'] = (psnr(orig, noisy), psnr(orig, clean), psnr(orig, mean3))
# medfilt2d acepta float64
# límite de la mediana en A: vecindad repartida
v = np.array([[0.1,0.1,0.5],[0.9,0.5,0.9],[0.5,0.1,0.9]]); print('mediana vecindad mixta', np.median(v))

# ---------- V/F convolución: coste
M = N = 512
for m in range(3, 12):
    esp = M*N*m*m; fr = 2*M*N*np.log2(M*N)
    print(m, esp > fr, round(esp/fr, 2))
print('cruce m=', np.sqrt(2*np.log2(M*N)), '| separable 2m vs 36 ->', 2*18, 'm=18')
from scipy.signal import fftconvolve
import time
g = np.random.rand(512,512); k = np.random.rand(31,31)
assert np.allclose(convolve(g,k,mode='constant'), fftconvolve(g,k,mode='same'))
# convolución circular vs lineal
a1 = np.fft.ifft2(np.fft.fft2(g)*np.fft.fft2(k, g.shape)).real
print('circular != lineal en borde:', not np.allclose(a1, fftconvolve(g,k)[:512,:512]))
# mediana no lineal
x = np.random.rand(7,7); y = np.random.rand(7,7)
print('mediana lineal?', np.allclose(medfilt2d(x+y), medfilt2d(x)+medfilt2d(y)))
# |gx|+|gy| anisótropo: gradiente en 45° vs 0°
gx, gy = 1.0, 0.0; print('L1 0°', abs(gx)+abs(gy)); c45 = np.cos(np.pi/4); print('L1 45°', 2*c45, ' L2 =1')
# magnitud espectro invariante a traslación
q = np.random.rand(16,16); assert np.allclose(abs(np.fft.fft2(q)), abs(np.fft.fft2(np.roll(q,(3,5),(0,1)))))
# gamma>1 oscurece
print('0.5**2', 0.5**2)

# ---------- Práctica 1 localMeanDiff
def localMeanDiff(im, n):
    return im - uniform_filter(im.astype(float), n)
def localMeanDiff2(im, n):
    return im - convolve(im.astype(float), np.ones((n, n))/n**2)
g = np.array(Image.open(P2+'cat256.pgm'))
assert np.allclose(localMeanDiff(g, 5), localMeanDiff2(g, 5)) 
print('localMeanDiff suma ~', localMeanDiff(g,5).mean())
# ---------- Práctica 2 lowpassFreq
def lowpassFreq(im, r):
    m, n = im.shape
    F = np.fft.fftshift(np.fft.fft2(im))
    y, x = np.meshgrid(np.arange(m) - m//2, np.arange(n) - n//2, indexing='ij')
    H = (x**2 + y**2) <= r**2
    return np.fft.ifft2(np.fft.ifftshift(F*H)).real
g = np.array(Image.open(P2+'cat256.pgm')).astype(float)
lp = lowpassFreq(g, 30); print('lowpass', lp.shape, lp.min(), lp.max(), 'media conservada', np.isclose(lp.mean(), g.mean()))
assert np.allclose(lowpassFreq(g, 10**4), g)
# ---------- Práctica 3 edgeMap
def edgeMap(im, sigma, t):
    s = gaussian_filter(im.astype(float), sigma)
    gx = sobel(s, axis=1); gy = sobel(s, axis=0)
    mag = np.hypot(gx, gy)
    return mag > t*mag.max()
e = edgeMap(g, 1.5, 0.3); print('edgeMap fracción', e.mean())
# ---------- Práctica 4 histEq
def histEq(im):
    h = np.bincount(im.ravel(), minlength=256)
    T = np.round(255*np.cumsum(h)/im.size).astype(np.uint8)
    return T[im]
gi = np.array(Image.open(P1+'iglesia.pgm'))
he = histEq(gi); print('histEq', he.dtype, he.min(), he.max(), gi.dtype)
def entropy(a): 
    p = np.bincount(a.ravel(), minlength=256)/a.size; p = p[p>0]; return -(p*np.log2(p)).sum()
print('entropía antes/después', entropy(gi), entropy(he))
# ---------- Práctica 5 bordes por ventana
def edgePercent(im, sigma, n, minFrac):
    ed = feature.canny(im.astype(float), sigma=sigma)
    return uniform_filter(ed.astype(float), n, mode='constant') >= minFrac
ep = edgePercent(g, 2, 15, 0.1); print('edgePercent', ep.mean())
def countEdges(im, sigma, sX, sY, minCount):
    ed = feature.canny(im.astype(float), sigma=sigma).astype(float)
    return convolve(ed, np.ones((sX, sY))) >= minCount
ce = countEdges(g, 2, 15, 15, 20); print('countEdges', ce.mean())
assert np.allclose(uniform_filter(feature.canny(g,sigma=2).astype(float),15)*225, convolve(feature.canny(g,sigma=2).astype(float), np.ones((15,15))))
# hough
ed = feature.canny(g, sigma=2)
hs, ang, d = hough_line(ed); res = hough_line_peaks(hs, ang, d, num_peaks=3); print('hough ok', len(res[0]))

# ======== comprobaciones añadidas para los números citados en las diapositivas ========
print('---- extra')
line = np.zeros((5,5)); 
for i in range(5): line[i,4-i] = 1
print('conv zero-pad diag /:\n', convolve(line, mask, mode='constant'))
def countIm_loops2(im, thr, sX, sY, minCount):
    out = np.zeros(im.shape, bool)
    for i in range(im.shape[0]):
        for j in range(im.shape[1]):
            w = im[max(0,i-sX//2):i+sX//2+1, max(0,j-sY//2):j+sY//2+1]
            out[i,j] = (w < thr).sum() >= minCount
    return out
g = np.array(Image.open(P2+'cat256.pgm')).astype(float)
assert (countIm_loops2(g, 60, 3, 3, 4) == (convolve((g<60).astype(float), np.ones((3,3)), mode='constant') >= 4)).all()
assert (countIm(g, 60, 3, 3, 4) != countIm_loops2(g, 60, 3, 3, 4)).sum() == 19
def edgeDensity(im, sigma, n, frac):
    ed = feature.canny(im.astype(float), sigma=sigma)
    return convolve(ed.astype(float), np.ones((n, n))/n**2, mode='constant') >= frac
assert (edgeDensity(g, 2, 15, .1) == (uniform_filter(feature.canny(g, sigma=2).astype(float), 15, mode='constant') >= .1)).all()
# gamma
for r in (0.0, 0.25, 0.5, 1.0): print(r, r**(1/2.2), r**2.2)
# 5a: 2D bool index con vector RGB
t = np.zeros((2,2,3)); t[np.array([[1,0],[0,1]]) == 1, :] = [1,0,0]; print(t[:,:,0])
# entropía
print('entropia igl', entropy(gi), entropy(histEq(gi)))
# ejemplo V/F: convolución circular vs lineal: tamaños
print('tamaño lineal', (512+31-1))
print('ALL OK')
def rgb2gray_opt2(im_rgb):
    coeffs = np.array([0.2126, 0.7512, 0.0722]); gamma = 1 / 2.2
    R, G, B = (im_rgb[:, :, k] for k in range(3))
    return (gamma_correction(R, coeffs[0], gamma) + gamma_correction(G, coeffs[1], gamma) + gamma_correction(B, coeffs[2], gamma))
assert np.allclose(rgb2gray_opt2(c), rgb2gray(c, True))
print('opt2 OK')
