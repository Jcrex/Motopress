"""Solución del lab 4 (bordes y contornos): Sobel, Canny, Hough, HOG y segmentos.
Probada con numpy, scipy y scikit-image. Ejecutar:  python solucion_p4.py  (hace las comprobaciones)."""
import numpy as np
from PIL import Image
from scipy.ndimage import sobel, convolve, correlate
from scipy import ndimage as ndi
from skimage import feature
from skimage.transform import hough_line, hough_line_peaks, probabilistic_hough_line
import matplotlib.pyplot as plt

IMGS = '/home/jcrex/uji/Master-Sistemas-Inteligentes/Computer-Vision/lab/lab4/p4-4students/imgs-P4/'   # ajustar a tu carpeta


# ---------- Sobel ----------
def testSobel(im, params=None):
    im = im.astype(float)            # ojo: con uint8, sobel devuelve uint8 y se corrompe
    gx = sobel(im, 1)                # axis=1 -> deriva a lo largo de las columnas: bordes verticales
    gy = sobel(im, 0)                # axis=0 -> deriva a lo largo de las filas: bordes horizontales
    mag = np.hypot(gx, gy)           # = np.sqrt(gx**2 + gy**2)
    return [gx, gy, mag]


def edges_sobel(im, t, exact=True):
    """Mapa binario de bordes: umbral relativo t (0..1) sobre la magnitud del gradiente."""
    gx, gy, mag = testSobel(im)
    if not exact:
        mag = np.abs(gx) + np.abs(gy)    # aproximación (hasta sqrt(2) mayor en diagonales)
    return mag > t * mag.max()


KX = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], float)

def sobel_by_conv(im):
    """sobel(im,1) = CORRELACIÓN con KX = CONVOLUCIÓN con KX girado 180° (signo opuesto a convolve(im,KX))."""
    im = im.astype(float)
    return convolve(im, KX[::-1, ::-1])   # == correlate(im, KX) == sobel(im, 1)


# ---------- Canny y Hough ----------
def testCanny(im, params=None):
    sigma = params['sigma']
    return [feature.canny(im, sigma=sigma, low_threshold=0.2 * 255, high_threshold=0.25 * 255, use_quantiles=False)]


def testHough(im, params=None):
    edges = testCanny(im, params)[0]
    H, thetas, rhos = hough_line(edges, np.linspace(-np.pi / 2, np.pi / 2, 200))
    return [np.log(H + 1), (H, thetas, rhos)]


def findPeaks(H, thetas, rhos, nPeaksMax=None):
    if nPeaksMax is None:
        nPeaksMax = np.inf
    return hough_line_peaks(H, thetas, rhos, num_peaks=nPeaksMax,
                            threshold=0.15 * np.max(H), min_angle=20, min_distance=15)


def displayLines(im, thetas, rhos, values=None):
    """Dibuja sobre im las rectas x cos(t) + y sin(t) = rho (x = columna, y = fila)."""
    Hh, Ww = im.shape[:2]
    plt.imshow(im, cmap='gray')
    for t, r in zip(thetas, rhos):
        if abs(np.sin(t)) > 1e-6:                  # recta no vertical: y = (rho - x cos t) / sin t
            x1, x2 = 0, Ww
            y1 = (r - x1 * np.cos(t)) / np.sin(t)
            y2 = (r - x2 * np.cos(t)) / np.sin(t)
        else:                                      # sin t = 0: recta vertical x = rho / cos t
            x1 = x2 = r / np.cos(t)
            y1, y2 = 0, Hh
        plt.plot((x1, x2), (y1, y2), '-r')
    plt.xlim(0, Ww); plt.ylim(Hh, 0)               # conserva el marco de la imagen
    plt.axis('off')


def n_lines(edges, frac=0.5):
    """¿Cuántas rectas hay? Número de picos del acumulador por encima de frac*max."""
    H, th, rh = hough_line(edges, np.linspace(-np.pi / 2, np.pi / 2, 180, endpoint=False))
    v, a, d = hough_line_peaks(H, th, rh, threshold=frac * H.max(), min_angle=10, min_distance=10)
    return len(v)


# ---------- HOG simplificado ----------
def HOG(im, nbins, weighted=True):
    im = im.astype(float)
    gx, gy = sobel(im, 1), sobel(im, 0)
    mag = np.hypot(gx, gy)
    ang = np.arctan2(gy, gx)                       # en (-pi, pi]
    h, edges = np.histogram(ang, bins=nbins, range=(-np.pi, np.pi), weights=mag if weighted else None)
    return h, edges

orientation_hist = HOG


# ---------- Segmentos (ejercicio 6) ----------
def segments(edges, th=10, length=40, gap=3):
    return probabilistic_hough_line(edges, threshold=th, line_length=length, line_gap=gap)


if __name__ == '__main__':
    cu = np.array(Image.open(IMGS + 'cuadros.png').convert('L'))
    f = cu.astype(float)
    assert np.abs(sobel(f, 1) - sobel_by_conv(f)).max() == 0
    assert np.abs(sobel(f, 1) + convolve(f, KX)).max() == 0          # convolve(im, KX) tiene el signo contrario
    assert np.abs(sobel(f, 1) - correlate(f, KX)).max() == 0
    print('sobel uint8 vs float, máx |dif|:', np.abs(sobel(cu, 1).astype(float) - sobel(f, 1)).max())
    gx, gy, mag = testSobel(cu)
    print('mag.max', mag.max(), '|gx|+|gy| max', (np.abs(gx) + np.abs(gy)).max())
    h, e = HOG(cu, 8); print('HOG ponderado', h.round(0))
    rng = np.random.default_rng(0)
    x = cu + rng.normal(0, 5, cu.shape)
    ed = testCanny(x, {'sigma': 5})[0]
    out = testHough(x, {'sigma': 5}); H, th, rh = out[1]
    print(H.shape, len(rh), rh[:5], rh[-5:])
    v, a, d = findPeaks(H, th, rh)
    print('picos', len(v), np.rad2deg(a).round(1), d)
    # rectángulo: 4 rectas
    r = np.zeros((64, 64), bool); r[10, 10:54] = r[50, 10:54] = True; r[10:51, 10] = r[10:51, 53] = True
    print('n_lines rectángulo =', n_lines(r))
    assert n_lines(r) == 4
    print('OK')
