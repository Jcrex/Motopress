# Genera los PNG y los datos de histogramas del deck vc-t1-realce con las imágenes reales del curso.
import json, os
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
import matplotlib
matplotlib.use('Agg')
from matplotlib import cm

IMG = '/home/jcrex/uji/Master-Sistemas-Inteligentes/Computer-Vision/lab/lab1/p1-4students/imgs-P1/'
EX = '/home/jcrex/uji/Master-Sistemas-Inteligentes/Computer-Vision/Teoria/Videos/01_Resumen_Examen/assets/'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets')
os.makedirs(OUT, exist_ok=True)

def L(p): return np.array(Image.open(p).convert('L'))
def save(a, name, size=None, resample=Image.NEAREST):
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    if size: im = im.resize(size, resample)
    im.save(os.path.join(OUT, name))

def histeq(im, nbins=256):            # igual que el lab 1
    imhist, bins = np.histogram(im.flatten(), list(range(nbins)), density=False)
    cdf = imhist.cumsum()
    return np.interp(im.flatten(), bins[:-1], 255 / cdf[-1] * cdf).reshape(im.shape)

igl, hue, cab = L(IMG + 'iglesia.pgm'), L(IMG + 'huesos.pgm'), L(IMG + 'cabeza.pgm')
toys = L(IMG + 'toys.ppm'); lena = L(EX + 'lena256.pgm')

def thumb(a, name, h=300):
    w = round(a.shape[1] * h / a.shape[0]); save(a, name, (w, h), Image.BILINEAR)

# --- Histogramas (ejercicio de emparejar) ---
low = (toys.astype(float) * (50 / 255) + 100)          # toys comprimida a [100,150]: poco contraste
imgs = {'h1': hue, 'h2': igl, 'h3': low, 'h4': cab}
bars = {}
for k, a in imgs.items():
    thumb(a, k + '.png', 260)
    h = np.bincount(a.astype(np.uint8).ravel(), minlength=256).astype(float)
    h64 = h.reshape(64, 4).sum(1)
    cap = np.sort(h64)[-2]                             # recorta el pico dominante
    bars[k] = [round(min(v, cap) / cap, 3) for v in h64]
json.dump(bars, open(os.path.join(OUT, 'hist_bars.json'), 'w'))

# --- Interpolación: recorte 20x20 de la cabeza ampliado x16 ---
crop = cab[34:54, 20:40].astype(float)
for o, n in ((0, 'nn'), (1, 'bl'), (3, 'bc')):
    z = ndi.zoom(crop, 16, order=o, grid_mode=True, mode='nearest')
    save(z, f'interp_{n}.png')

# --- Forward vs inverse mapping (rotación 30° y escala 1,3) ---
src = toys[40:168, 40:168]
th = np.deg2rad(30); s = 1.3
A = s * np.array([[np.cos(th), -np.sin(th)], [np.sin(th), np.cos(th)]])
H = 256; c_in = np.array([63.5, 63.5]); c_out = np.array([H / 2 - .5, H / 2 - .5])
fwd = np.zeros((H, H)); mask = np.zeros((H, H), bool)
ys, xs = np.mgrid[0:128, 0:128]
P = np.stack([xs.ravel() - c_in[0], ys.ravel() - c_in[1]])
Q = A @ P + c_out[:, None]
qx, qy = np.round(Q[0]).astype(int), np.round(Q[1]).astype(int)
ok = (qx >= 0) & (qx < H) & (qy >= 0) & (qy < H)
fwd[qy[ok], qx[ok]] = src.ravel()[ok]; mask[qy[ok], qx[ok]] = True
holes = np.zeros((H, H, 3), np.uint8); holes[..., :] = fwd[..., None].astype(np.uint8)
# agujeros dentro de la imagen girada: píxeles de salida que caen dentro del cuadrado transformado y no fueron escritos
Ainv = np.linalg.inv(A)
yy, xx = np.mgrid[0:H, 0:H]
back = Ainv @ np.stack([xx.ravel() - c_out[0], yy.ravel() - c_out[1]]) + c_in[:, None]
inside = ((back[0] >= 0) & (back[0] <= 127) & (back[1] >= 0) & (back[1] <= 127)).reshape(H, H)
holes[inside & ~mask] = (0, 0, 0)                         # huecos: píxeles sin escribir (negros)
Image.fromarray(holes).resize((512, 512), Image.NEAREST).save(os.path.join(OUT, 'fwd_holes.png'))
inv = ndi.map_coordinates(src.astype(float), [back[1].reshape(H, H), back[0].reshape(H, H)], order=1, cval=0)
save(inv, 'inv_ok.png', (512, 512), Image.NEAREST)
Image.fromarray(src).resize((384, 384), Image.NEAREST).save(os.path.join(OUT, 'src128.png'))

# --- Transformaciones de intensidad sobre huesos (oscura, máx 93) ---
thumb(hue, 'hue_orig.png', 320)
c = 255 / np.log(256)
thumb(c * np.log1p(hue.astype(float)), 'hue_log.png', 320)
thumb((hue.astype(float) / hue.max()) * 255, 'hue_stretch.png', 320)
thumb(255 * (hue / 255.0) ** 0.4, 'hue_g04.png', 320)
thumb(cab, 'cab_orig.png', 320)
thumb(255 - cab.astype(float), 'cab_neg.png', 320)
thumb((cab > 90) * 255, 'cab_thr.png', 320)

# --- Espectro: lineal frente a log ---
F = np.fft.fftshift(np.abs(np.fft.fft2(lena.astype(float))))
save(F / F.max() * 255, 'spec_lin.png', (320, 320))
Lg = np.log1p(F); save(Lg / Lg.max() * 255, 'spec_log.png', (320, 320))

# --- Ejercicio γ = 3, 4, 5 sobre la iglesia (clara y lavada); orden mezclado: 4, 5, 3 ---
thumb(igl, 'igl_orig.png', 320)
for g in (3, 4, 5):
    thumb(255 * (igl / 255.0) ** g, f'igl_g{g}.png', 320)

# --- Ecualización global y local sobre huesos ---
glob = histeq(hue)
from skimage.filters import rank
loc3 = rank.equalize(hue, footprint=np.ones((3, 3)))
loc31 = rank.equalize(hue, footprint=np.ones((31, 31)))
thumb(glob, 'hue_glob.png', 320); thumb(loc3, 'hue_loc3.png', 320); thumb(loc31, 'hue_loc31.png', 320)
# entropías (comprobación de la errata)
def ent(a):
    p = np.bincount(a.astype(np.uint8).ravel(), minlength=256) / a.size; p = p[p > 0]; return -(p * np.log2(p)).sum()
print('entropía huesos', ent(hue), '-> global', ent(np.round(glob)))
print('entropía iglesia', ent(igl), '-> global', ent(np.round(histeq(igl))))
igl_eq = histeq(igl); thumb(igl_eq, 'igl_glob.png', 320)

# --- Pseudocolor ---
bands = np.array([[0.27, 0.0, 0.35], [0.0, 0.35, 0.65], [0.0, 0.6, 0.55], [0.1, 0.75, 0.4],
                  [0.55, 0.85, 0.2], [0.95, 0.85, 0.1], [0.98, 0.55, 0.1], [0.9, 0.2, 0.15]])  # 8 colores
sl = np.minimum(cab // 32, 7)
Image.fromarray((bands[sl] * 255).astype(np.uint8)).resize((320, 338), Image.BILINEAR).save(os.path.join(OUT, 'cab_slice.png'))
thumb(cab, 'cab_gray.png', 338)
hot = (cm.hot(cab / 255.0)[..., :3] * 255).astype(np.uint8)
jet = (cm.jet(cab / 255.0)[..., :3] * 255).astype(np.uint8)
vir = (cm.viridis(cab / 255.0)[..., :3] * 255).astype(np.uint8)
for n, a in (('hot', hot), ('jet', jet), ('viridis', vir)):
    Image.fromarray(a).resize((320, 338), Image.BILINEAR).save(os.path.join(OUT, f'cab_{n}.png'))
# Equipaje sintético: maleta (140) con objeto (150) sobre fondo (100). Mismas rebanadas de 32 niveles.
bag = np.full((200, 300), 100.0); bag[40:160, 50:250] = 140; bag[80:120, 110:190] = 150
bag += np.random.default_rng(0).normal(0, 0.5, bag.shape)
bag = np.clip(bag, 0, 255)
save(bag, 'bag_gray.png', (450, 300))
sb = np.minimum(bag // 32, 7).astype(int)
Image.fromarray((bands[sb] * 255).astype(np.uint8)).resize((450, 300), Image.NEAREST).save(os.path.join(OUT, 'bag_slice.png'))
# Falso color: bandas de peppers permutadas (ejemplo de np.dstack)
pep = np.array(Image.open(IMG + 'peppers.ppm').convert('RGB'))
fc = np.dstack((pep[..., 1], pep[..., 0], pep[..., 2]))
Image.fromarray(pep).resize((300, 300)).save(os.path.join(OUT, 'pep_rgb.png'))
Image.fromarray(fc).resize((300, 300)).save(os.path.join(OUT, 'pep_false.png'))
print('ok')

# --- Datos para el gráfico T(r) = 255·CDF de huesos (64 puntos, r = 4k) ---
hh = np.bincount(hue.ravel(), minlength=256); cdf_h = np.cumsum(hh) / hue.size
bars['hue_T'] = [round(255 * float(cdf_h[4 * k]), 1) for k in range(64)]
bars['hue_b255'] = [round(v * 255, 1) for v in bars['h1']]
json.dump(bars, open(os.path.join(OUT, 'hist_bars.json'), 'w'))

# --- Luminosidad L* (CIELAB) de los mapas de color (diapositiva lum-cmaps, se pega en data-fns) ---
from skimage.color import rgb2lab
xs = np.linspace(0, 1, 33)
for name in ['gray', 'hot', 'jet', 'viridis']:
    lst = rgb2lab(matplotlib.colormaps[name](xs)[:, :3][None])[0, :, 0]
    print(name, '[' + ','.join(f'{v:.1f}' for v in lst) + ']')
