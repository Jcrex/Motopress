"""Genera los PNG de assets/ para el deck vc-examen (resultados reales de las funciones del deck)."""
import numpy as np, os
from PIL import Image
from scipy.ndimage import convolve, gaussian_filter, uniform_filter, sobel
from scipy.signal import medfilt2d
from skimage import feature

R = '/home/jcrex/uji/Master-Sistemas-Inteligentes/Computer-Vision/lab/'
P1 = R + 'lab1/p1-4students/imgs-P1/'; P2 = R + 'lab2/p2-4students/imgs-P2/'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets'); os.makedirs(OUT, exist_ok=True)
np.random.seed(1)

def save(a, name, size=None):
    a = np.clip(a, 0, 1); im = Image.fromarray((a*255+.5).astype(np.uint8))
    if size: im = im.resize(size, Image.LANCZOS if a.ndim == 3 else Image.NEAREST)
    im.save(os.path.join(OUT, name))
def norm(a): a = a - a.min(); return a/(a.max() or 1)

# --- TLA
def add_TLA_noise(im, p=0.1):
    im = im.copy(); t, l, a = 1, 2, 3
    pat = {t:[1,0,0], l:[0,1,0], a:[0.5,0,0.5]}; m, n, k = im.shape
    ww = np.random.randint(t, a+1, (m, n)) * (np.random.rand(m, n) < p)
    for nt in [t, l, a]: im[ww == nt, :] = pat[nt]
    return im
def remove_TLA_noise(x):
    im = x.copy()
    for k in range(3): im[:,:,k] = medfilt2d(x[:,:,k])
    return im
pep = np.array(Image.open(P1+'peppers.ppm'))/255.0
noisy = add_TLA_noise(pep, .1); clean = remove_TLA_noise(noisy)
psnr = lambda a, b: 10*np.log10(1/np.mean((a-b)**2))
print('PSNR', psnr(pep, noisy), psnr(pep, clean))
save(pep, 'tla_orig.png', (400,400)); save(noisy, 'tla_ruido.png', (400,400)); save(clean, 'tla_limpia.png', (400,400))

# --- filterIm
boat = np.array(Image.open(P2+'boat256.pgm')).astype(float)/255
mask = np.array([[-1,-1,2],[-1,2,-1],[2,-1,-1]])
resp = convolve(boat, mask)
save(boat, 'fi_in.png', (400,400)); save(norm(np.clip(resp, 0, None)), 'fi_out.png', (400,400))

# --- countIm
cat = np.array(Image.open(P2+'cat256.pgm')).astype(float)
th = (cat < 60).astype(float)
cnt = convolve(th, np.ones((9, 9))) >= 30
save(cat/255, 'ci_in.png', (400,400)); save(th, 'ci_th.png', (400,400)); save(cnt.astype(float), 'ci_out.png', (400,400))

# --- blurFgBk
yy, xx = np.mgrid[:256, :256]
fg = ((xx-128)/70.)**2 + ((yy-135)/85.)**2 < 1
im_f = gaussian_filter(boat, 4)
save(boat, 'bf_in.png', (400,400)); save(fg.astype(float), 'bf_mask.png', (400,400))
save(np.where(fg == True, im_f, boat), 'bf_obj.png', (400,400)); save(np.where(fg == False, im_f, boat), 'bf_fondo.png', (400,400))

# --- prácticas
g = np.array(Image.open(P2+'cat256.pgm')).astype(float)
save(norm(np.clip(g - uniform_filter(g, 5), -40, 40)), 'pr1.png', (400,400))
m, n = g.shape; F = np.fft.fftshift(np.fft.fft2(g))
y, x = np.meshgrid(np.arange(m)-m//2, np.arange(n)-n//2, indexing='ij')
lp = np.fft.ifft2(np.fft.ifftshift(F*((x**2+y**2) <= 30**2))).real
save(lp/255, 'pr2.png', (400,400))
s = gaussian_filter(g, 1.5); mag = np.hypot(sobel(s, axis=1), sobel(s, axis=0)); save((mag > .3*mag.max()).astype(float), 'pr3.png', (400,400))
gi = np.array(Image.open(P1+'iglesia.pgm'))
h = np.bincount(gi.ravel(), minlength=256); T = np.round(255*np.cumsum(h)/gi.size).astype(np.uint8)
save(np.hstack((gi, T[gi]))/255, 'pr4.png', (800,400))
ed = feature.canny(g, sigma=2).astype(float)
save(uniform_filter(ed, 15, mode='constant') >= .1, 'pr5.png', (400,400))

# --- (pase de revisión) trampa del dtype sobre una imagen real: uint8 frente a float
boat8 = np.array(Image.open(P2+'boat256.pgm'))
r8 = convolve(boat8, mask)                       # uint8: los negativos dan la vuelta
rf = convolve(boat8.astype(float), mask)         # float: valores reales con signo
print('dtype', r8.dtype, 'neg en float:', (rf < 0).mean().round(3), 'píxeles >200 en uint8:', (r8 > 200).mean().round(3))
save(r8/255, 'fi_u8.png', (400,400))
q = np.percentile(rf, 99); save(np.clip(rf, 0, q)/q, 'fi_f.png', (400,400))   # solo positivos, estirado al percentil 99

# --- (pase de revisión) zoom del ruido TLA: se ven los píxeles T, L y A
y0, x0 = 300, 140
zn = noisy[y0:y0+48, x0:x0+48]; zc = clean[y0:y0+48, x0:x0+48]
Image.fromarray((zn*255+.5).astype(np.uint8)).resize((384,384), Image.NEAREST).save(os.path.join(OUT, 'tla_zoom.png'))
Image.fromarray((zc*255+.5).astype(np.uint8)).resize((384,384), Image.NEAREST).save(os.path.join(OUT, 'tla_zoom_limpia.png'))
