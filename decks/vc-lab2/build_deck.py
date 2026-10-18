#!/usr/bin/env python3
"""index.tpl.html + assets/datos.json -> index.html (sustituye los marcadores @@X@@ por números reales)."""
import json, os, re
import numpy as np
from scipy.signal.windows import gaussian
H = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(H, 'assets/datos.json')))
c = lambda v, d=1: f'{v:.{d}f}'.replace('.', ',')
g = gaussian(15, 4); g = g/g.sum(); g2 = np.outer(g, g)
ps, pm, pg, pp = D['ps_media'], D['ps_mediana'], D['pg_media'], D['ps_gauss']
pgg, pgm = D['pg_gauss'], D['pg_mediana']
e1 = D['e1']; sp, ga = e1['S&P 5 %'], e1['Gauss σ=20']
m2 = D['e2_mask']
M = {
 'PS_SP3': c(D['psnr_noise']['sp3']), 'PS_G3': c(D['psnr_noise']['g3']), 'PS_G5': c(D['psnr_noise']['g5']),
 'PS_G10': c(D['psnr_noise']['g10']), 'PS_G20': c(D['psnr_noise']['g20']),
 'SP_CHANGED': c(D['sp_changed']*100, 2),
 'G20_MIN': c(D['gauss_range20'][0], 0), 'G20_MAX': c(D['gauss_range20'][1], 0),
 'HIST5': json.dumps(D['hist_noise_5']),
 'MED3': c(pm['mediana 3']), 'AVG3': c(ps['media 3']), 'MED15': c(pm['mediana 15']),
 'T_SIN_SP': c(ps['S&P 5 %']), 'T_SIN_G': c(pg['gauss σ=20']),
 'T_AVG_SP': ' / '.join(c(ps[f'media {n}']) for n in (3, 7, 15)),
 'T_AVG_G': ' / '.join(c(pg[f'media {n}']) for n in (3, 7, 15)),
 'T_GAU_SP': ' / '.join(c(pp[str(s)]) for s in (1, 2, 4)),
 'T_GAU_G': ' / '.join(c(pgg[f'gauss σ={s}']) for s in (1, 2, 4)),
 'T_MED_SP': ' / '.join(c(pm[f'mediana {n}']) for n in (3, 7, 15)),
 'T_MED_G': ' / '.join(c(pgm[f'mediana {n}']) for n in (3, 7, 15)),
 'E1_SP_0': c(sp['sin filtrar']) + ' dB', 'E1_SP_1': c(sp['media 3×3']) + ' dB', 'E1_SP_2': c(sp['Gauss σ=1']) + ' dB', 'E1_SP_3': c(sp['mediana 3×3']) + ' dB',
 'E1_G_0': c(ga['sin filtrar']) + ' dB', 'E1_G_1': c(ga['media 3×3']) + ' dB', 'E1_G_2': c(ga['Gauss σ=1']) + ' dB', 'E1_G_3': c(ga['mediana 3×3']) + ' dB',
 'E2_DIFF': '≈ 10⁻¹³',
 'E2_X15': c(m2['15'][0]/m2['15'][1], 1), 'E2_X31': c(m2['31'][0]/m2['31'][1], 1),
 'G15_SUM': c(D['g15_sum'], 2), 'E3_15': c(D['e3_15_vs_ref'], 1),
 'G1D15': json.dumps((g*1000).round(0).astype(int).tolist()).strip('[]').join('[]'),
 'G2D15': json.dumps(g2.round(4).tolist()),
 'E4_STD': ' / '.join(c(s, 1) for s in D['e4']['std']), 'E4_CORR': c(D['e4']['corr'], 3),
 'E5_CORR': c(D['e5']['corr'], 4), 'E5_RAW': c(D['e5']['corr_raw'], 3),
 'B_O': c(D['bordes']['o_corner']), 'B_C': c(D['bordes']['c_corner']), 'B_R': c(D['bordes']['r_corner']),
}
def pw(X, Y):
    """Función JS de interpolación lineal por tramos (NaN fuera de [X0, Xn])."""
    return ("x=>{var X=%s,Y=%s;if(x<X[0]||x>X[X.length-1])return NaN;var i=0;while(i<X.length-2&&x>X[i+1])i++;"
            "return Y[i]+(Y[i+1]-Y[i])*(x-X[i])/(X[i+1]-X[i]);}") % (json.dumps(X), json.dumps([round(float(y), 2) for y in Y]))
bp = D['bordes_perfil']; cols = list(range(len(bp['o'])))
M.update({
 'PSD_G3': f"{D['psnr_noise']['g3']:.2f}", 'PSD_G5': f"{D['psnr_noise']['g5']:.2f}",
 'PSD_G10': f"{D['psnr_noise']['g10']:.2f}", 'PSD_G20': f"{D['psnr_noise']['g20']:.2f}",
 'PW_MEDIA_SP': pw([3, 7, 15], [ps[f'media {n}'] for n in (3, 7, 15)]),
 'PW_MEDIANA_SP': pw([3, 7, 15], [pm[f'mediana {n}'] for n in (3, 7, 15)]),
 'PW_MEDIA_G': pw([1, 2, 3], [pg[f'media {n}'] for n in (3, 7, 15)]),
 'PW_GAUSS_G': pw([1, 2, 3], [pgg[f'gauss σ={s}'] for s in (1, 2, 4)]),
 'PW_MEDIANA_G': pw([1, 2, 3], [pgm[f'mediana {n}'] for n in (3, 7, 15)]),
 'T_SIN_SP_D': f"{ps['S&P 5 %']}", 'T_SIN_G_D': f"{pg['gauss σ=20']}",
 'G1D_MAX': c(g.max()*1000, 0), 'G1D_MIN': c(g.min()*1000, 0), 'G15_SUM_D': f"{D['g15_sum']:.4f}",
 'PW_BO': pw(cols, bp['o']), 'PW_BR': pw(cols, bp['r']), 'PW_BC': pw(cols, bp['c']),
})
s = open(os.path.join(H, 'index.tpl.html'), encoding='utf-8').read()
for k, v in M.items(): s = s.replace(f'@@{k}@@', v)
left = re.findall(r'@@\w+@@', s)
assert not left, left
open(os.path.join(H, 'index.html'), 'w', encoding='utf-8').write(s)
print('index.html generado,', s.count('<section'), 'diapositivas')
