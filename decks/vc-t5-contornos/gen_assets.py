"""Genera los PNG de assets/ del deck vc-t5-contornos (lección 005: contornos).
Uso: <venv>/bin/python gen_assets.py   (desde decks/vc-t5-contornos/)"""
import os
import numpy as np
from PIL import Image
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, Circle, FancyArrowPatch
from skimage import feature, morphology, measure
from skimage.transform import hough_line, hough_line_peaks, hough_circle, hough_circle_peaks
from skimage.draw import circle_perimeter
from scipy import ndimage as ndi

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'assets')
os.makedirs(OUT, exist_ok=True)
L = '/home/jcrex/uji/Master-Sistemas-Inteligentes/Computer-Vision/'
CUADROS = L + 'lab/lab4/p4-4students/imgs-P4/cuadros.png'
MONEDAS = L + 'Teoria/Videos/01_Resumen_Examen/assets/llaves_monedas.png'

# Paleta Noche oscuro (los mismos valores que los tokens del tema)
BG, BG2, FG, FG2, FG3 = '#1a1b26', '#16161e', '#c0caf5', '#a9b1d6', '#7c83ab'
LINE, ACC, ACC2, ACC3, OK, ERR = '#3b4261', '#7aa2f7', '#bb9af7', '#ff9e64', '#9ece6a', '#f7768e'
plt.rcParams.update({'font.family': 'DejaVu Sans', 'text.color': FG, 'axes.labelcolor': FG2,
                     'xtick.color': FG3, 'ytick.color': FG3, 'axes.edgecolor': LINE, 'font.size': 20})


def save(fig, name, transparent=True):
    fig.savefig(os.path.join(OUT, name), dpi=100, transparent=transparent, bbox_inches='tight', pad_inches=0.05,
                facecolor=BG if not transparent else 'none')
    plt.close(fig)


def gray(a, name):
    a = np.asarray(a, float)
    Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(os.path.join(OUT, name))


def binimg(b, name, scale=2):
    a = np.where(b, 235, 22).astype(np.uint8)
    Image.fromarray(a).resize((a.shape[1] * scale, a.shape[0] * scale), Image.NEAREST).save(os.path.join(OUT, name))


im = np.array(Image.open(CUADROS).convert('L')).astype(float)
rng = np.random.default_rng(3)

# ---------------------------------------------------------------- 1. bordes rotos (Canny con ruido)
imn = im + rng.normal(0, 12, im.shape)
imn5 = im + np.random.default_rng(5).normal(0, 8, im.shape)
e_rotos = feature.canny(imn5, sigma=2, low_threshold=0.2 * 255 * 0.3, high_threshold=0.25 * 255 * 0.3, use_quantiles=False)
gray(np.clip(imn5, 0, 255), 'cuadros_ruido.png')
binimg(e_rotos, 'canny_roto.png')

# ---------------------------------------------------------------- 2. enlace local
def fill_gaps_rows(g, Lmax):
    out = g.copy()
    for r in range(g.shape[0]):
        idx = np.flatnonzero(g[r])
        for a, b in zip(idx[:-1], idx[1:]):
            if 1 < b - a <= Lmax:          # hueco de longitud b-a-1 < Lmax
                out[r, a:b] = True
    return out


sm = ndi.gaussian_filter(imn, 1.5)
gx, gy = ndi.sobel(sm, 1), ndi.sobel(sm, 0)
M = np.hypot(gx, gy)
alpha = np.degrees(np.arctan2(gy, gx))          # dirección del gradiente (x = columnas, y = filas hacia abajo)
TM, A, TA = 0.30 * M.max(), 90, 45
Lgap = int(round(0.05 * im.shape[1]))
# borde horizontal = gradiente vertical (α = ±90°); se usa α módulo 180°
a180 = np.mod(alpha, 180)
g_h = (M > TM) & (np.abs(a180 - A) <= TA)
g_v = (M > TM) & (np.minimum(a180, 180 - a180) <= TA)
h_link = fill_gaps_rows(g_h, Lgap)
v_link = fill_gaps_rows(g_v.T, Lgap).T          # girar 90°, rellenar por filas, deshacer el giro
or_link = h_link | v_link
thin = morphology.thin(or_link)
gray(255 * M / M.max(), 'link_M.png')
for nm, b in (('link_h', h_link), ('link_v', v_link), ('link_or', or_link), ('link_thin', thin)):
    binimg(b, nm + '.png')
binimg(g_h | g_v, 'link_umbral.png')
print('Lgap =', Lgap, ' pix umbral:', int((g_h | g_v).sum()), ' tras enlace:', int(or_link.sum()), ' adelgazado:', int(thin.sum()))

# ---------------------------------------------------------------- 3. Hough sobre cuadros (limpio)
e = feature.canny(im, sigma=2, low_threshold=0.2 * 255 * 0.3, high_threshold=0.25 * 255 * 0.3, use_quantiles=False)
thetas = np.linspace(-np.pi / 2, np.pi / 2, 180, endpoint=False)
H, th, rh = hough_line(e, thetas)
pv, pt, pr = hough_line_peaks(H, th, rh, threshold=0.45 * H.max(), min_angle=10, min_distance=10)
print('bordes', int(e.sum()), 'votos', int(H.sum()), 'H', H.shape, 'rho', rh[0], rh[-1], 'picos:', [(round(float(np.degrees(t)), 1), float(r), int(v)) for t, r, v in zip(pt, pr, pv)])

fig, ax = plt.subplots(1, 3, figsize=(15, 5.2), gridspec_kw={'width_ratios': [1, 1.25, 1]})
ax[0].imshow(e, cmap='gray'); ax[0].set_title('1. bordes (Canny)', color=FG2); ax[0].axis('off')
ax[1].imshow(np.log1p(H), cmap='magma', aspect='auto', extent=[-90, 90, rh[-1], rh[0]])
ax[1].scatter(np.degrees(pt), pr, s=260, facecolors='none', edgecolors=ACC, linewidths=2)
ax[1].set_xlabel('θ (grados)'); ax[1].set_ylabel('ρ (píxeles)'); ax[1].set_title('2. H en log y picos', color=FG2); ax[1].set_xticks([-90, -45, 0, 45, 90])
ax[2].imshow(im, cmap='gray', vmin=0, vmax=255)
for t, r in zip(pt, pr):
    if abs(np.sin(t)) > 1e-6:
        x0, x1 = 0, im.shape[1] - 1
        ax[2].plot([x0, x1], [(r - x0 * np.cos(t)) / np.sin(t), (r - x1 * np.cos(t)) / np.sin(t)], color=ACC3, lw=2)
    else:
        ax[2].axvline(r / np.cos(t), color=ACC3, lw=2)
ax[2].set_xlim(0, im.shape[1] - 1); ax[2].set_ylim(im.shape[0] - 1, 0)
ax[2].set_title('3. rectas de los picos', color=FG2); ax[2].axis('off')
fig.tight_layout()
save(fig, 'hough_demo.png')

# H grande con anotaciones (interpretación)
fig, ax = plt.subplots(figsize=(9, 6.4))
plt.rcParams['font.size'] = 24
ax.imshow(np.log1p(H), cmap='magma', aspect='auto', extent=[-90, 90, rh[-1], rh[0]])
ax.scatter(np.degrees(pt), pr, s=300, facecolors='none', edgecolors=ACC, linewidths=2)
ax.set_xlabel('θ (grados)'); ax.set_ylabel('ρ (píxeles)')
ax.set_xticks([-90, -45, 0, 45, 90])
fig.tight_layout()
save(fig, 'hough_H.png')
plt.rcParams['font.size'] = 20

# ---------------------------------------------------------------- 4. rotación ⇒ desplazamiento en θ
ALPHA = 15
rot = ndi.rotate(im, ALPHA, mode='nearest')
e2 = feature.canny(rot, sigma=2, low_threshold=0.2 * 255 * 0.3, high_threshold=0.25 * 255 * 0.3, use_quantiles=False)
H2, th2, rh2 = hough_line(e2, thetas)
pv2, pt2, pr2 = hough_line_peaks(H2, th2, rh2, threshold=0.45 * H2.max(), min_angle=10, min_distance=10)
print('rotada: picos', sorted(round(float(np.degrees(t)), 1) for t in pt2), 'originales', sorted(round(float(np.degrees(t)), 1) for t in pt))
plt.rcParams['font.size'] = 26
fig, ax = plt.subplots(2, 2, figsize=(11, 8.6), gridspec_kw={'width_ratios': [1, 1.5]})
for row, (img_, HH, rr, pp_t, pp_r, tt) in enumerate(((e, H, rh, pt, pr, 'original'), (e2, H2, rh2, pt2, pr2, f'girada {ALPHA}°'))):
    ax[row, 0].imshow(img_, cmap='gray'); ax[row, 0].axis('off'); ax[row, 0].set_title(tt, color=FG2)
    ax[row, 1].imshow(np.log1p(HH), cmap='magma', aspect='auto', extent=[-90, 90, rr[-1], rr[0]])
    ax[row, 1].scatter(np.degrees(pp_t), pp_r, s=200, facecolors='none', edgecolors=ACC, linewidths=2)
    ax[row, 1].set_xlabel('θ (grados)'); ax[row, 1].set_ylabel('ρ'); ax[row, 1].set_xticks([-90, -45, 0, 45, 90])
fig.tight_layout()
save(fig, 'hough_rotacion.png')
plt.rcParams['font.size'] = 20

# ---------------------------------------------------------------- 5. circunferencias (monedas)
mon = np.array(Image.open(MONEDAS).convert('L'))
em = feature.canny(mon.astype(float), sigma=3, low_threshold=0.1 * 255, high_threshold=0.25 * 255, use_quantiles=False)
radii = np.arange(24, 40)
Hc = hough_circle(em, radii)
acc, cx, cy, rad = hough_circle_peaks(Hc, radii, total_num_peaks=5, min_xdistance=40, min_ydistance=40)
print('círculos', list(zip(cx, cy, rad, np.round(acc, 2))), 'Hc', Hc.shape)
plt.rcParams['font.size'] = 28
fig, ax = plt.subplots(1, 3, figsize=(15, 5.3))
ax[0].imshow(mon, cmap='gray'); ax[0].axis('off'); ax[0].set_title('imagen', color=FG2)
ax[1].imshow(em, cmap='gray'); ax[1].axis('off'); ax[1].set_title('bordes (Canny)', color=FG2)
ax[2].imshow(mon, cmap='gray'); ax[2].axis('off'); ax[2].set_title('5 mejores picos', color=FG2)
for x, y, r in zip(cx, cy, rad):
    ax[2].add_patch(Circle((x, y), r, fill=False, ec=ACC3, lw=2.5))
fig.tight_layout()
save(fig, 'circulos.png')
plt.rcParams['font.size'] = 20

# ---------------------------------------------------------------- 6. dualidad punto-recta (idea de Hough)
fig, ax = plt.subplots(1, 2, figsize=(13, 5.6))
xs = np.array([1, 2, 4]); ys = 0.5 * xs + 1
xx = np.linspace(-0.2, 5, 10)
ax[0].plot(xx, 0.5 * xx + 1, color=ACC, lw=3)
for sl in (-0.4, 1.2, 2.2):
    ax[0].plot(xx, ys[1] + sl * (xx - xs[1]), color=FG3, lw=1.2, ls='--')
ax[0].scatter(xs, ys, color=ACC3, s=110, zorder=5)
for x, y, n in zip(xs, ys, 'ABC'):
    ax[0].annotate(f'({x}, {y:g})', (x, y), textcoords='offset points', xytext=(8, -20), color=FG2, fontsize=20)
ax[0].set_xlim(-0.2, 5); ax[0].set_ylim(-0.5, 5)
ax[0].set_xlabel('x'); ax[0].set_ylabel('y'); ax[0].set_title('imagen: y = ax + b', color=FG2)
aa = np.linspace(-1, 2, 50)
cols = [ACC3, ACC2, OK]
for x, y, c in zip(xs, ys, cols):
    ax[1].plot(aa, y - x * aa, color=c, lw=2.5)
ax[1].scatter([0.5], [1], color=ACC, s=160, zorder=5)
ax[1].annotate("(a', b') = (0,5; 1)", (0.5, 1), textcoords='offset points', xytext=(12, 14), color=FG, fontsize=20)
ax[1].set_xlim(-1, 2); ax[1].set_ylim(-4, 4)
ax[1].set_xlabel('a'); ax[1].set_ylabel('b'); ax[1].set_title('parámetros: b = −xa + y', color=FG2)
for a_ in ax:
    a_.grid(color=LINE, lw=.6)
fig.tight_layout()
save(fig, 'dualidad.png')

# ---------------------------------------------------------------- 7. forma normal (geometría)
fig, ax = plt.subplots(figsize=(7.2, 5.6))
th0 = np.radians(35); rho0 = 3.0
n = np.array([np.cos(th0), np.sin(th0)]); d = np.array([-n[1], n[0]])
p0 = rho0 * n
tt = np.linspace(-3.4, 3.4, 2)
ax.plot(*(p0[:, None] + d[:, None] * tt), color=ACC, lw=3)
P = p0 + 1.7 * d
ax.scatter(*P, color=ACC3, s=120, zorder=5); ax.annotate('P = (x, y)', P, xytext=(10, 8), textcoords='offset points', color=FG, fontsize=22)
ax.annotate('', xy=p0, xytext=(0, 0), arrowprops=dict(arrowstyle='-|>', color=OK, lw=2.4))
ax.annotate('', xy=n * 1.2, xytext=(0, 0), arrowprops=dict(arrowstyle='-|>', color=ACC2, lw=3))
ax.text(*(n * 1.2 + np.array([-2.9, 0.35])), 'n = (cos θ, sin θ)', color=ACC2, fontsize=22)
ax.text(*(p0 * 0.62 + np.array([0.25, -0.45])), 'ρ', color=OK, fontsize=26)
ax.plot([P[0], P[0]], [0, P[1]], color=FG3, lw=0, )
arc = np.linspace(0, th0, 30)
ax.plot(0.9 * np.cos(arc), 0.9 * np.sin(arc), color=FG2, lw=1.6)
ax.text(1.0, 0.18, 'θ', color=FG2, fontsize=24)
ax.axhline(0, color=FG3, lw=1); ax.axvline(0, color=FG3, lw=1)
ax.set_xlim(-1.5, 6.4); ax.set_ylim(-1.2, 5.6); ax.set_aspect('equal'); ax.axis('off')
ax.text(6.2, -0.1, 'x', color=FG3, fontsize=22); ax.text(0.1, 5.3, 'y', color=FG3, fontsize=22)
fig.tight_layout()
save(fig, 'normal.png')

# ---------------------------------------------------------------- 8. Moore: seguimiento de frontera
S = np.zeros((7, 7), int)
for r, c in [(1, 2), (1, 3), (1, 4), (2, 1), (2, 5), (3, 1), (3, 5), (4, 2), (4, 4), (5, 3)]:
    S[r, c] = 1
OFFS = [(0, -1), (-1, -1), (-1, 0), (-1, 1), (0, 1), (1, 1), (1, 0), (1, -1)]  # O, NO, N, NE, E, SE, S, SO (horario)


def moore(S):
    rs, cs = np.nonzero(S)
    b0 = (rs[0], cs[0]); c = (b0[0], b0[1] - 1)
    b = b0; steps = []; path = [b0]
    first = True; b1 = None
    while True:
        k0 = OFFS.index((c[0] - b[0], c[1] - b[1]))
        for j in range(1, 9):
            k = (k0 + j) % 8
            nb = (b[0] + OFFS[k][0], b[1] + OFFS[k][1])
            if S[nb]:
                prev = (b[0] + OFFS[(k - 1) % 8][0], b[1] + OFFS[(k - 1) % 8][1])
                break
        steps.append((b, c, nb, prev))
        if first:
            b1 = nb; first = False
        elif b == b0 and nb == b1:
            steps.pop(); break
        b, c = nb, prev
        if b == b0 and len(path) > 1:
            pass
        path.append(b)
        if len(path) > 60:
            break
    return b0, steps, path


b0, steps, path = moore(S)
# frontera cerrada: se detiene cuando se vuelve a b0
border = []
for s_ in steps:
    if s_[0] not in border:
        border.append(s_[0])
print('frontera (fila, col):', border)
D = {(0, 1): 0, (-1, 1): 1, (-1, 0): 2, (-1, -1): 3, (0, -1): 4, (1, -1): 5, (1, 0): 6, (1, 1): 7}
cyc = border + [border[0]]
chain = [D[(cyc[i + 1][0] - cyc[i][0], cyc[i + 1][1] - cyc[i][1])] for i in range(len(border))]
print('cadena:', ''.join(map(str, chain)))
rots = [chain[i:] + chain[:i] for i in range(len(chain))]
norm = min(rots)
print('normalizada:', ''.join(map(str, norm)))
diff = lambda c: [(c[(i + 1) % len(c)] - c[i]) % 8 for i in range(len(c))]
print('dif (normalizada):', ''.join(map(str, diff(norm))))
chain_rot = [(c + 2) % 8 for c in chain]
rn = min(chain_rot[i:] + chain_rot[:i] for i in range(len(chain_rot)))
print('rotada 90° ccw:', ''.join(map(str, chain_rot)), 'norm', ''.join(map(str, rn)), 'dif', ''.join(map(str, diff(rn))))
print('dif cadena original sin normalizar:', ''.join(map(str, diff(chain))), ' dif rotada:', ''.join(map(str, diff(chain_rot))))


def draw_grid(ax, S, marks=None, arrows=(), shade=()):
    n, m = S.shape
    for r in range(n):
        for c in range(m):
            fc = 'none'
            if (r, c) in shade:
                fc = ACC
            ax.add_patch(Rectangle((c, n - 1 - r), 1, 1, fc=fc, ec=LINE, lw=1, alpha=1 if fc == 'none' else 0.35))
            if S[r, c]:
                ax.text(c + .5, n - 1 - r + .5, '1', ha='center', va='center', color=FG, fontsize=22)
    ax.set_xlim(0, m); ax.set_ylim(0, n); ax.set_aspect('equal'); ax.axis('off')
    for (cell, lab, col) in (marks or []):
        ax.text(cell[1] + .12, S.shape[0] - 1 - cell[0] + .68, lab, color=col, fontsize=15, fontweight='bold')
    for (p, q) in arrows:
        ax.add_patch(FancyArrowPatch((p[1] + .5, S.shape[0] - 1 - p[0] + .5), (q[1] + .5, S.shape[0] - 1 - q[0] + .5),
                                     arrowstyle='-|>', mutation_scale=18, color=ACC3, lw=2.4))


# (moore.png y cadena_ejemplo.png se sustituyeron por SVG animados en línea: ver sección 12)

# ---------------------------------------------------------------- 9. rosas de Freeman + ejemplo
plt.rcParams['font.size'] = 26
fig, ax = plt.subplots(1, 2, figsize=(11, 5.4))
for a_, dirs, ttl in ((ax[0], 4, '4-conectividad'), (ax[1], 8, '8-conectividad')):
    for k in range(dirs):
        ang = np.radians(k * (360 / dirs))
        a_.annotate('', xy=(np.cos(ang), np.sin(ang)), xytext=(0, 0), arrowprops=dict(arrowstyle='-|>', color=ACC, lw=2.5))
        a_.text(1.28 * np.cos(ang), 1.28 * np.sin(ang), str(k), ha='center', va='center', color=ACC3, fontsize=30, fontweight='bold')
    a_.set_xlim(-1.6, 1.6); a_.set_ylim(-1.6, 1.6); a_.set_aspect('equal'); a_.axis('off'); a_.set_title(ttl, color=FG2)
fig.tight_layout()
save(fig, 'rosa.png')
plt.rcParams['font.size'] = 20


# ---------------------------------------------------------------- 10. aproximación poligonal (Douglas-Peucker, ilustrativa)
yy, xx2 = np.mgrid[0:300, 0:300]
th_ = np.arctan2(yy - 150, xx2 - 150); rr = np.hypot(yy - 150, xx2 - 150)
blob = rr < 90 + 38 * np.cos(5 * th_) + 12 * np.sin(2 * th_ + 1)
cont = max(measure.find_contours(blob.astype(float), 0.5), key=len)
fig, ax = plt.subplots(1, 4, figsize=(16, 4.8))
ax[0].plot(cont[:, 1], cont[:, 0], color=ACC, lw=1.8); ax[0].set_title(f'frontera: {len(cont)} puntos', color=FG2)
for a_, tol in zip(ax[1:], (2, 6, 16)):
    ap = measure.approximate_polygon(cont, tol)
    a_.plot(ap[:, 1], ap[:, 0], color=ACC3, lw=2.2, marker='o', ms=4)
    a_.set_title(f'tol. {tol}: {len(ap) - 1} vértices', color=FG2)
for a_ in ax:
    a_.set_aspect('equal'); a_.invert_yaxis(); a_.axis('off')
fig.tight_layout()
save(fig, 'poligono.png')

# ---------------------------------------------------------------- 11. tubería de Hough en 4 paneles (sin texto: los rótulos van en HTML)
def panel(name, draw):
    fig = plt.figure(figsize=(5.2, 5.2)); ax = fig.add_axes([0, 0, 1, 1]); draw(ax); ax.axis('off')
    fig.savefig(os.path.join(OUT, name), dpi=100, facecolor=BG2); plt.close(fig)


panel('pipe_1_bordes.png', lambda ax: ax.imshow(e, cmap='gray', interpolation='nearest'))
panel('pipe_2_H.png', lambda ax: ax.imshow(np.log1p(H), cmap='magma', aspect='auto', extent=[-90, 90, rh[-1], rh[0]]))


def _picos(ax):
    ax.imshow(np.log1p(H), cmap='magma', aspect='auto', extent=[-90, 90, rh[-1], rh[0]])
    ax.scatter(np.degrees(pt), pr, s=520, facecolors='none', edgecolors=ACC, linewidths=3.5)
    ax.set_xlim(-90, 90); ax.set_ylim(rh[-1], rh[0])


panel('pipe_3_picos.png', _picos)
ys_e, xs_e = np.nonzero(e)
GAP = 0.2 * im.shape[0]            # como en la lección: se unen huecos < 20 % de la altura
segs = []
for t, r in zip(pt, pr):
    near = np.abs(xs_e * np.cos(t) + ys_e * np.sin(t) - r) <= 1.0
    sv = np.sort(-xs_e[near] * np.sin(t) + ys_e[near] * np.cos(t))
    cuts = np.flatnonzero(np.diff(sv) > GAP)
    for a_, b_ in zip(np.r_[0, cuts + 1], np.r_[cuts, len(sv) - 1]):
        if sv[b_] - sv[a_] >= 15:
            p0 = r * np.array([np.cos(t), np.sin(t)]); dv = np.array([-np.sin(t), np.cos(t)])
            segs.append((p0 + sv[a_] * dv, p0 + sv[b_] * dv))
print('segmentos:', len(segs))


def _segs(ax):
    ax.imshow(e, cmap='gray', vmax=4, interpolation='nearest')
    for q0, q1 in segs:
        ax.plot([q0[0], q1[0]], [q0[1], q1[1]], color=ACC3, lw=5, solid_capstyle='round')
    ax.set_xlim(0, im.shape[1] - 1); ax.set_ylim(im.shape[0] - 1, 0)


panel('pipe_4_segm.png', _segs)

print('OK')


# ---------------------------------------------------------------- 12. SVG en línea para index.html (animados con data-seq)
# No son PNG: se escriben en SVG_OUT y se pegan a mano en index.html. Los colores van por clases de deck.css.
SVG_OUT = os.environ.get('SVG_OUT', '/tmp/t5_svg')
os.makedirs(SVG_OUT, exist_ok=True)


def wsvg(name, txt):
    open(os.path.join(SVG_OUT, name + '.svg.html'), 'w').write(txt)


def grid_svg(S, cell, x0, y0, shade):
    n, m = S.shape; o = []
    for r in range(n):
        for c in range(m):
            cls = 'on' if (r, c) in shade else 'cell'
            o.append(f'<rect class="{cls}" x="{x0 + c * cell}" y="{y0 + r * cell}" width="{cell}" height="{cell}"/>')
            if S[r, c]:
                o.append(f'<text class="one" x="{x0 + c * cell + cell / 2}" y="{y0 + r * cell + cell / 2 + 9}">1</text>')
    return o


def arrow(p, q, cell, x0, y0, cls='arr', shrink=14):
    (r0, c0), (r1, c1) = p, q
    ax_, ay_ = x0 + c0 * cell + cell / 2, y0 + r0 * cell + cell / 2
    bx_, by_ = x0 + c1 * cell + cell / 2, y0 + r1 * cell + cell / 2
    L_ = np.hypot(bx_ - ax_, by_ - ay_); ux, uy = (bx_ - ax_) / L_, (by_ - ay_) / L_
    sx, sy, ex, ey = ax_ + ux * shrink, ay_ + uy * shrink, bx_ - ux * shrink, by_ - uy * shrink
    hx, hy = ex - ux * 16, ey - uy * 16
    head = f'M{ex:.1f},{ey:.1f} L{hx - uy * 9:.1f},{hy + ux * 9:.1f} L{hx + uy * 9:.1f},{hy - ux * 9:.1f} Z'
    return f'<path class="{cls}" d="M{sx:.1f},{sy:.1f} L{hx:.1f},{hy:.1f}"/><path class="{cls}-h" d="{head}"/>'


bset = [tuple(map(int, b)) for b in border]
S7 = S[:6, :]                                  # la última fila está vacía: se recorta
CELL, X0, Y0 = 84, 4, 4
# --- Moore paso a paso
o = [f'<svg class="dg" viewBox="0 0 {7 * CELL + 8} {6 * CELL + 8}" role="img" aria-label="seguimiento de Moore">']
o += grid_svg(S7, CELL, X0, Y0, set(bset))
b0_ = bset[0]
o.append(f'<g data-seq="1"><text class="lb ok" x="{X0 + b0_[1] * CELL + 6}" y="{Y0 + b0_[0] * CELL + 28}" style="text-anchor:start">b₀</text>'
         f'<text class="lb err" x="{X0 + (b0_[1] - 1) * CELL + CELL / 2}" y="{Y0 + b0_[0] * CELL + CELL / 2 + 9}">c₀</text></g>')
# barrido horario alrededor de b₀ desde c₀ (oeste): NO, N, NE y E, donde está el primer 1
bcx, bcy, R_ = X0 + b0_[1] * CELL + CELL / 2, Y0 + b0_[0] * CELL + CELL / 2, 0.78 * CELL
o.append(f'<path class="scan" data-seq="2" data-a="draw" d="M{bcx - R_:.1f},{bcy:.1f} A{R_:.1f},{R_:.1f} 0 0 1 {bcx + R_:.1f},{bcy:.1f}"/>'
         f'<path class="scan-h" data-seq="2" d="M{bcx + R_:.1f},{bcy + 12:.1f} L{bcx + R_ - 9:.1f},{bcy - 6:.1f} L{bcx + R_ + 9:.1f},{bcy - 6:.1f} Z"/>')
for i in range(len(bset)):
    o.append(f'<g data-seq="{3 + i}">' + arrow(bset[i], bset[(i + 1) % len(bset)], CELL, X0, Y0) + '</g>')
o.append('</svg>')
wsvg('moore', '\n'.join(o))

# --- cadena a mano: flechas con su código
cx_ = np.mean([X0 + b[1] * CELL + CELL / 2 for b in bset]); cy_ = np.mean([Y0 + b[0] * CELL + CELL / 2 for b in bset])
o = [f'<svg class="dg" viewBox="0 0 {7 * CELL + 8} {6 * CELL + 8}" role="img" aria-label="código de cadena">']
o += grid_svg(S7, CELL, X0, Y0, set(bset))
o.append(f'<text class="lb err" x="{X0 + b0_[1] * CELL - 6}" y="{Y0 + b0_[0] * CELL - 10}" style="text-anchor:end">inicio</text>'.replace(f'y="{Y0 + b0_[0] * CELL - 10}"', f'y="{Y0 + b0_[0] * CELL + 30}"'))
for i in range(len(bset)):
    p_, q_ = bset[i], bset[(i + 1) % len(bset)]
    mx_ = X0 + (p_[1] + q_[1]) / 2 * CELL + CELL / 2; my_ = Y0 + (p_[0] + q_[0]) / 2 * CELL + CELL / 2
    vx, vy = mx_ - cx_, my_ - cy_; vn = np.hypot(vx, vy)
    tx, ty = mx_ + vx / vn * 30, my_ + vy / vn * 30 + 10
    o.append(f'<g data-seq="{2 + i}">' + arrow(p_, q_, CELL, X0, Y0) + f'<text class="code-n" x="{tx:.1f}" y="{ty:.1f}">{chain[i]}</text></g>')
o.append('</svg>')
wsvg('cadena', '\n'.join(o))

# --- forma de la cadena de la lección (diapositiva 17), y hacia arriba
CL = '00006066666666444444242222202202'
V8 = {0: (1, 0), 1: (1, 1), 2: (0, 1), 3: (-1, 1), 4: (-1, 0), 5: (-1, -1), 6: (0, -1), 7: (1, -1)}
pts = [(0, 0)]
for ch in CL:
    pts.append((pts[-1][0] + V8[int(ch)][0], pts[-1][1] + V8[int(ch)][1]))
assert pts[-1] == (0, 0)
dl = [(int(CL[(i + 1) % 32]) - int(CL[i])) % 8 for i in range(32)]
assert ''.join(map(str, dl)) == '00062600000006000006260000620626'
U = 44; xmin = min(p[0] for p in pts); ymax = max(p[1] for p in pts)
P = lambda q: (40 + (q[0] - xmin) * U, 30 + (ymax - q[1]) * U)
W_ = 40 + (max(p[0] for p in pts) - xmin) * U + 40; H_ = 30 + (ymax - min(p[1] for p in pts)) * U + 30
o = [f'<svg class="dg" viewBox="0 0 {W_} {H_}" role="img" aria-label="forma de la cadena">']
for gx_ in range(xmin, max(p[0] for p in pts) + 1):
    o.append(f'<line class="gl" x1="{P((gx_, 0))[0]}" x2="{P((gx_, 0))[0]}" y1="30" y2="{H_ - 30}"/>')
for gy_ in range(min(p[1] for p in pts), ymax + 1):
    o.append(f'<line class="gl" x1="40" x2="{W_ - 40}" y1="{P((0, gy_))[1]}" y2="{P((0, gy_))[1]}"/>')
o.append('<path class="trace" data-seq="4" data-a="draw" d="' + ' '.join(('M' if i == 0 else 'L') + f'{P(q)[0]},{P(q)[1]}' for i, q in enumerate(pts)) + '"/>')
for i, dv in enumerate(dl):
    if dv:
        x_, y_ = P(pts[(i + 1) % 32])
        o.append(f'<circle class="{"t-r" if dv == 6 else "t-l"}" data-seq="5" cx="{x_}" cy="{y_}" r="11"/>')
x_, y_ = P(pts[0])
o.append(f'<circle class="t-s" cx="{x_}" cy="{y_}" r="8"/>')
o.append('</svg>')
wsvg('cadena_leccion', '\n'.join(o))
print('cadena lección: giros 6 =', dl.count(6), ' giros 2 =', dl.count(2), ' tamaño', W_, H_)
