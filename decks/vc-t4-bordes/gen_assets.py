"""Genera los PNG del deck vc-t4-bordes a partir de las imágenes del curso."""
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
from skimage import feature

IMG = '/home/jcrex/uji/Master-Sistemas-Inteligentes/Computer-Vision/lab/lab4/p4-4students/imgs-P4/'
OUT = __file__.rsplit('/', 1)[0] + '/assets/'
rng = np.random.default_rng(4)

def load(n): return np.array(Image.open(IMG + n).convert('L')).astype(float) / 255
def save(name, a, size=None, signed=False):
    a = np.asarray(a, float)
    if signed:
        m = np.abs(a).max() or 1
        a = 0.5 + 0.5 * a / m
    a = np.clip(a, 0, 1)
    im = Image.fromarray((a * 255).astype(np.uint8))
    if size:
        w, h = im.size; s = size / max(w, h)
        im = im.resize((round(w * s), round(h * s)), Image.NEAREST if s > 1 else Image.LANCZOS)
    im.save(OUT + name + '.png')
def norm(a, p=99.5): return np.clip(a / np.percentile(a, p), 0, 1)

ein, bike, cua = load('einstein.pgm'), load('bike256.pgm'), load('cuadros.png')

# 7. Ruido y derivadas: [1,-1] sobre imagen limpia y ruidosa (derivada respecto a x)
noisy = ein + rng.normal(0, 0.04, ein.shape)
d = lambda a: np.abs(np.diff(a, axis=1, prepend=a[:, :1]))
save('ein_clean', ein, 600); save('ein_noisy', noisy, 600)
save('ein_clean_d', norm(d(ein), 99.5), 600); save('ein_noisy_d', norm(d(noisy), 99.5), 600)
print('var diff ruido/var ruido (teoría 2):', np.var(np.diff(rng.normal(0, 1, 10**6))))

# 10. Escala: |gx| gaussiano con sigma 1, 2, 4 (de einstein con algo de ruido)
for s in (1, 2, 4):
    g = ndi.gaussian_filter(noisy, s, order=(0, 1)) * s  # normalización por escala
    save(f'ein_dog_s{s}', norm(np.abs(g), 99.5), 600)

# 18. Sharpening
lap = ndi.correlate(bike, np.array([[0, 1, 0], [1, -4, 1], [0, 1, 0]], float), mode='nearest')
k5 = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]], float)
sharp = np.clip(ndi.correlate(bike, k5, mode='nearest'), 0, 1)
usm = np.clip(bike + 1.5 * (bike - ndi.gaussian_filter(bike, 2)), 0, 1)
save('bike_orig', bike, 400); save('bike_lap', lap, 400, signed=True); save('bike_sharp', sharp, 400); save('bike_usm', usm, 400)
# realce sucesivo: aplicar delta - laplaciano 1, 2 y 3 veces
a = bike.copy()
for n in (1, 2, 3):
    a = ndi.correlate(a, k5, mode='nearest')
    save(f'bike_sharp{n}', np.clip(a, 0, 1), 400)
# color: canal a canal con una imagen real en color (peppers del lab 1)
pep = np.array(Image.open('/home/jcrex/uji/Master-Sistemas-Inteligentes/Computer-Vision/lab/lab1/p1-4students/imgs-P1/peppers.ppm').convert('RGB')).astype(float) / 255
peps = np.stack([np.clip(ndi.correlate(pep[..., c], k5, mode='nearest'), 0, 1) for c in range(3)], -1)
def save_rgb(name, a, size=400):
    im = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8)); w, h = im.size; sc = size / max(w, h)
    im.resize((round(w * sc), round(h * sc)), Image.LANCZOS).save(OUT + name + '.png')
save_rgb('pep_orig', pep); save_rgb('pep_sharp', peps)

# 19. Puntos aislados (imagen sintética)
syn = ndi.gaussian_filter(rng.random((128, 128)), 8); syn = 0.35 + 0.3 * (syn - syn.min()) / (syn.max() - syn.min())
for (y, x) in [(30, 40), (70, 90), (100, 30), (45, 100)]: syn[y, x] = 1.0
syn += rng.normal(0, 0.01, syn.shape)
k8 = np.array([[1, 1, 1], [1, -8, 1], [1, 1, 1]], float)
R = ndi.correlate(syn, k8, mode='nearest')
save('pts_in', syn, 400); save('pts_R', np.abs(R), 400, signed=False) if False else save('pts_R', R, 400, signed=True)
save('pts_det', np.abs(R) > 0.6 * np.abs(R).max(), 400)
print('puntos detectados:', int((np.abs(R) > 0.6 * np.abs(R).max()).sum()))

# 20-21. Líneas sobre cuadros.png (kernels direccionales)
K = {'h': [[-1, -1, -1], [2, 2, 2], [-1, -1, -1]], 'v': [[-1, 2, -1], [-1, 2, -1], [-1, 2, -1]],
     'p45': [[-1, -1, 2], [-1, 2, -1], [2, -1, -1]], 'm45': [[2, -1, -1], [-1, 2, -1], [-1, -1, 2]]}
save('cua', cua, 400)
for n, k in K.items():
    r = ndi.correlate(cua, np.array(k, float), mode='nearest')
    save('cua_line_' + n, np.clip(r, 0, None) > 0.9 * np.clip(r, 0, None).max(), 400)
r = ndi.correlate(cua, np.array(K['p45'], float), mode='nearest')
save('cua_p45_val', r, 400, signed=True)

# 25. Sobel (bike con ruido σ=8/255): |gx|, |gy|, |gx|+|gy|, umbral 33 %
nb = bike + rng.normal(0, 8 / 255, bike.shape)
def sob(a):
    gx, gy = ndi.sobel(a, 1), ndi.sobel(a, 0)
    return np.abs(gx), np.abs(gy), np.abs(gx) + np.abs(gy)
for tag, a in (('raw', nb), ('smooth', ndi.gaussian_filter(nb, 1.5))):
    ax, ay, m = sob(a)
    save(f'sob_{tag}_in', a, 400); save(f'sob_{tag}_gx', ax / ax.max(), 400); save(f'sob_{tag}_gy', ay / ay.max(), 400)
    save(f'sob_{tag}_m', m / m.max(), 400); save(f'sob_{tag}_t', m > 0.33 * m.max(), 400)

# 27. Marr-Hildreth (einstein): sigma ≈ 0,5 % de min(H,W)
H, W = ein.shape; sig = 0.005 * min(H, W)
logr = ndi.gaussian_laplace(ein, sig)
def zc(g, T):
    out = np.zeros(g.shape, bool); p = np.pad(g, 1, mode='edge')
    for dy, dx in [(0, 1), (1, 0), (1, 1), (1, -1)]:
        a = p[1 + dy:1 + dy + H, 1 + dx:1 + dx + W] if dx >= 0 else p[1 + dy:1 + dy + H, 1 + dx:1 + dx + W]
        b = p[1 - dy:1 - dy + H, 1 - dx:1 - dx + W]
        out |= (np.sign(a) * np.sign(b) < 0) & (np.abs(a - b) > T)
    return out
save('mh_log', logr, 600, signed=True)
def zcb(T):  # se descartan 3 px de marco (artefacto del borde de la imagen)
    z = zc(logr, T); z[:3, :] = z[-3:, :] = z[:, :3] = z[:, -3:] = False; return z
save('mh_zc0', zcb(0), 600)
save('mh_zc04', zcb(0.04 * np.abs(logr).max()), 600)   # valor de la lección (diapositiva 56)
save('mh_zc15', zcb(0.15 * np.abs(logr).max()), 600)   # umbral más alto para esta imagen con grano
print('MH: fracción de píxeles borde con T = 0 / 4 % / 15 %:', [round(zcb(t * np.abs(logr).max()).mean(), 3) for t in (0, .04, .15)])

# 30. Histéresis (einstein): Tlow=.05, Thigh=.15
sm = 1.5
save('can_hi', feature.canny(ein, sm, 0.15, 0.15), 600)
save('can_lo', feature.canny(ein, sm, 0.05, 0.05), 600)
save('can_hys', feature.canny(ein, sm, 0.05, 0.15), 600)
# 32. σ y umbrales (bike)
for s in (1, 3):
    for tag, (lo, hi) in (('baj', (0.02, 0.06)), ('alt', (0.08, 0.2))):
        save(f'can_s{s}_{tag}', feature.canny(bike, s, lo, hi), 400)
# Canny final en bike para ficha API
save('can_bike', feature.canny(bike, 2, 0.05, 0.15), 400); save('can_bike_in', bike, 400)

# 28. Pasos de Canny (einstein, sigma = 2) con la NMS de la diapositiva (código del deck)
def nms(mag, ang):        # ang en grados
    d = np.round(ang / 45).astype(int) % 4
    step = [(0, 1), (1, 1), (1, 0), (1, -1)]
    out = np.zeros_like(mag)
    for y in range(1, mag.shape[0] - 1):
        for x in range(1, mag.shape[1] - 1):
            dy, dx = step[d[y, x]]
            if (mag[y, x] >= mag[y + dy, x + dx] and
                    mag[y, x] >= mag[y - dy, x - dx]):
                out[y, x] = mag[y, x]
    return out
sc = 2
gs = ndi.gaussian_filter(ein, sc)
gxs, gys = ndi.gaussian_filter(ein, sc, order=(0, 1)), ndi.gaussian_filter(ein, sc, order=(1, 0))
mags = np.hypot(gxs, gys); angs = np.degrees(np.arctan2(gys, gxs))
thin = nms(mags, angs)
save('cp_1', gs, 600); save('cp_2', norm(mags, 99.5), 600); save('cp_3', norm(thin, 99.5), 600)
save('cp_4', feature.canny(ein, sc, 0.05, 0.15), 600)  # mismos umbrales que la demo de histéresis
print('NMS: píxeles no nulos antes/después', int((mags > 0.01).sum()), int((thin > 0.01).sum()))
print('max |grad| einstein sigma 2:', mags.max())
