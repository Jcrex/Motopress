// Genera themes/tokens.css y themes/meta.js a partir de themes/source.json.
// Las series de gráficos se derivan de los tonos de cada paleta: se igualan en
// luminosidad OKLCH, se busca el orden con mejor separación para daltonismo
// (simulación Machado 2009, ΔE OKLab ×100) y se emiten como --cat-1..6.
// Uso: node tools/build-themes.mjs [--report]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = JSON.parse(fs.readFileSync(path.join(ROOT, 'themes/source.json'), 'utf8'));
const REPORT = process.argv.includes('--report');

// ---------- color math (sRGB ↔ OKLab/OKLCH, WCAG, CVD) ----------
const hex2rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const s2l = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const l2s = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const rgb2hex = (rgb) => '#' + rgb.map((v) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0')).join('');
const lin = (h) => hex2rgb(h).map(s2l);
function labFromLin([r, g, b]) {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
}
function linFromLab([L, a, b]) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
}
const lab = (h) => labFromLin(lin(h));
export const oklch = (h) => { const [L, a, b] = lab(h); return [L, Math.hypot(a, b), ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360]; };
function fromOklch(L, C, H) {
  for (let c = C; c >= 0; c -= 0.0025) {
    const a = c * Math.cos((H * Math.PI) / 180), b = c * Math.sin((H * Math.PI) / 180);
    const rgb = linFromLab([L, a, b]);
    if (rgb.every((v) => v >= -1e-4 && v <= 1 + 1e-4)) return rgb2hex(rgb.map((v) => l2s(Math.max(0, Math.min(1, v)))));
  }
  return rgb2hex(linFromLab([L, 0, 0]).map((v) => l2s(Math.max(0, Math.min(1, v)))));
}
const lum = (h) => { const [r, g, b] = lin(h); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const MACHADO = {
  protan: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
  deutan: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]],
};
const sim = (h, k) => { const [r, g, b] = lin(h), M = MACHADO[k], c = (v) => Math.max(0, Math.min(1, v)); return [c(M[0][0] * r + M[0][1] * g + M[0][2] * b), c(M[1][0] * r + M[1][1] * g + M[1][2] * b), c(M[2][0] * r + M[2][1] * g + M[2][2] * b)]; };
const dE = (h1, h2, k) => { const a = labFromLin(k ? sim(h1, k) : lin(h1)), b = labFromLin(k ? sim(h2, k) : lin(h2)); return 100 * Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]); };
const cvd = (a, b) => Math.min(dE(a, b, 'protan'), dE(a, b, 'deutan'));

// ---------- categorical fitting ----------
const BAND = { light: [0.43, 0.77], dark: [0.48, 0.67] };
const TARGETS = { light: [0.47, 0.52, 0.57, 0.62], dark: [0.56, 0.6, 0.63, 0.665] };
// Luminosidad preferida: en oscuro, lo más clara que permite la banda (conserva el pastel);
// en claro, la propia del color original dentro de la banda.
const prefL = (mode, L0) => (mode === 'dark' ? 0.66 : Math.max(0.5, Math.min(0.6, L0)));
function fitCats(cands, mode, surface, n = 6, floor = 8) {
  const variants = [];
  cands.forEach((hex, ci) => {
    const [L0, C, H] = oklch(hex);
    for (const L of TARGETS[mode]) {
      const v = fromOklch(L, Math.max(C, 0.11), H);
      const [vl, vc] = oklch(v);
      if (vc < 0.1 || vl < BAND[mode][0] || vl > BAND[mode][1]) continue;
      if (contrast(v, surface) < 3) continue;
      variants.push({ ci, hex: v, L: vl, mid: Math.abs(vl - prefL(mode, L0)) });
    }
  });
  const V = variants.length, cv = [], nv = [];
  for (let i = 0; i < V; i++) { cv[i] = []; nv[i] = []; for (let j = 0; j < V; j++) { cv[i][j] = cvd(variants[i].hex, variants[j].hex); nv[i][j] = dE(variants[i].hex, variants[j].hex); } }
  let best = null;
  const firsts = variants.map((v, i) => i).filter((i) => variants[i].ci === 0);
  const path = [], used = new Set();
  function score(p) {
    let mc = 99, mn = 99, dev = 0;
    for (let k = 0; k < p.length - 1; k++) { mc = Math.min(mc, cv[p[k]][p[k + 1]]); mn = Math.min(mn, nv[p[k]][p[k + 1]]); }
    for (const i of p) dev += variants[i].mid;
    if (mn < 15) return -1;
    return Math.min(mc, 14) * 10 + Math.min(mn, 30) * 0.5 - dev * 40;
  }
  function dfs() {
    if (path.length === n) { const s = score(path); if (!best || s > best.s) best = { s, p: [...path] }; return; }
    for (let i = 0; i < V; i++) {
      if (used.has(variants[i].ci)) continue;
      if (path.length) { const prev = path[path.length - 1]; if (cv[prev][i] < floor || nv[prev][i] < 15) continue; if (best && Math.min(cv[prev][i], 14) * 10 < best.s - 400) continue; }
      used.add(variants[i].ci); path.push(i); dfs(); path.pop(); used.delete(variants[i].ci);
    }
  }
  for (const f of firsts) { used.add(variants[f].ci); path.push(f); dfs(); path.pop(); used.delete(variants[f].ci); }
  if (!best) { if (floor > 6) { console.warn(`  ${mode}: sin combinación con ΔE≥8, se usa el suelo 6 (requiere etiquetas directas)`); return fitCats(cands, mode, surface, n, 6); } throw new Error('no se encontró combinación categórica válida'); }
  return best.p.map((i) => variants[i].hex);
}

// ---------- sequential & diverging ramps ----------
function seqRamp(hex, mode, n = 7) {
  const [, C, H] = oklch(hex);
  const out = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const L = mode === 'light' ? 0.94 - t * 0.56 : 0.3 + t * 0.58;
    const c = mode === 'light' ? 0.03 + (Math.max(C, 0.12) - 0.03) * Math.min(1, t * 1.3) : 0.04 + (Math.max(C, 0.12) - 0.04) * Math.min(1, t * 1.3);
    out.push(fromOklch(L, c, H));
  }
  return out;
}
function divRamp([warm, cool], neutralHex, mode) {
  const [, Cw, Hw] = oklch(warm), [, Cc, Hc] = oklch(cool), [, , Hn] = oklch(neutralHex);
  const Ls = mode === 'light' ? [0.5, 0.66, 0.82] : [0.82, 0.66, 0.48];
  const mid = mode === 'light' ? fromOklch(0.92, 0.01, Hn) : fromOklch(0.34, 0.012, Hn);
  const side = (C, H) => Ls.map((L, i) => fromOklch(L, Math.max(C, 0.12) * [1, 0.75, 0.45][i], H));
  return [...side(Cw, Hw), mid, ...side(Cc, Hc).reverse()];
}

// ---------- legibility fixes ----------
// Desplaza la luminosidad OKLCH de un color hasta alcanzar un contraste mínimo con el fondo.
function ensure(hex, bg, min, dir) {
  let [L, C, H] = oklch(hex), out = hex, guard = 0;
  while (contrast(out, bg) < min && guard++ < 80) { L += dir * 0.01; out = fromOklch(Math.max(0, Math.min(1, L)), C, H); }
  return out;
}
function bestOn(accent, cands) { return cands.reduce((a, b) => (contrast(b, accent) > contrast(a, accent) ? b : a)); }

// ---------- emit ----------
const order = ['bg', 'bg-2', 'bg-3', 'fg', 'fg-2', 'fg-3', 'line', 'line-2', 'accent', 'accent-2', 'accent-3', 'on-accent', 'ok', 'warn', 'err', 'x', 'y', 'z'];
const meta = [];
const blocks = [];
const report = [];
let defaultLight = null;

for (const st of src.styles) {
  const computed = {};
  for (const mode of ['light', 'dark']) {
    const m = st.modes[mode];
    let cats; try { cats = fitCats(m.cats, mode, m.roles.bg); } catch (e) { throw new Error(`${st.id}/${mode}: ${e.message}`); }
    const seq = seqRamp(m.seq, mode);
    const div = divRamp(m.div, m.roles.bg, mode);
    computed[mode] = { cats, seq, div };
    const r = { ...m.roles };
    const dir = mode === 'dark' ? 1 : -1;
    r['fg-2'] = ensure(r['fg-2'], r.bg, 6, dir);
    r['fg-3'] = ensure(r['fg-3'], r.bg, 4.6, dir);
    r['on-accent'] = bestOn(r.accent, [r['on-accent'], r.bg, r['bg-2'], r.fg, mode === 'dark' ? '#0d0d12' : '#ffffff', '#ffffff', '#101014']);
    for (const k of ['accent', 'accent-2', 'accent-3']) r[k + '-ink'] = ensure(r[k], r.bg, 4.6, dir);
    m.roles = r;
    const lines = [...order, 'accent-ink', 'accent-2-ink', 'accent-3-ink'].map((k) => `--${k}:${r[k]}`);
    cats.forEach((c, i) => lines.push(`--cat-${i + 1}:${c}`));
    seq.forEach((c, i) => lines.push(`--seq-${i + 1}:${c}`));
    div.forEach((c, i) => lines.push(`--div-${i + 1}:${c}`));
    lines.push(`--is-dark:${mode === 'dark' ? 1 : 0}`);
    computed[mode].vars = lines;
    report.push({ style: st.id, mode, fg: contrast(r.fg, r.bg).toFixed(2), fg2: contrast(r['fg-2'], r.bg).toFixed(2), fg3: contrast(r['fg-3'], r.bg).toFixed(2), ink: contrast(r['accent-ink'], r.bg).toFixed(2), onAcc: contrast(r['on-accent'], r.accent).toFixed(2), cats: cats.join(',') });
  }
  const sh = Object.entries(st.shape).map(([k, v]) => `--${k}:${v}`);
  const fo = Object.entries(st.fonts).map(([k, v]) => `--font-${k}:${v}`);
  if (!st.fonts.serif) fo.push(`--font-serif:${st.fonts.display}`);
  const mo = [`--dur:${st.motion.dur}`, `--ease:${st.motion.ease}`];
  const common = [...fo, ...sh, ...mo];
  if (st.id === src.default) defaultLight = [...common, ...computed.light.vars];
  blocks.push(`/* ${st.full} */\n[data-style="${st.id}"]{${[...common, ...computed.light.vars].join(';')}}\n[data-style="${st.id}"][data-theme="dark"]{${computed.dark.vars.join(';')};color-scheme:dark}\n@media (prefers-color-scheme: dark){:root[data-style="${st.id}"]:not([data-theme="light"]){${computed.dark.vars.join(';')};color-scheme:dark}}`);
  meta.push({
    id: st.id, name: st.name, full: st.full, mood: st.mood, harmony: st.harmony, itten: st.itten, refs: st.refs,
    fontNames: st.fontNames, motion: st.motion,
    modes: Object.fromEntries(['light', 'dark'].map((mode) => [mode, { names: st.modes[mode].names, raw: st.modes[mode].raw, roles: st.modes[mode].roles, cats: computed[mode].cats, sourceCats: st.modes[mode].cats.slice(0, 6) }])),
  });
}

const css = `/* GENERADO por tools/build-themes.mjs a partir de themes/source.json. No editar a mano. */\n:root{${defaultLight.join(';')}}\n:root[data-theme="dark"]{color-scheme:dark}\n${blocks.join('\n')}\n`;
fs.writeFileSync(path.join(ROOT, 'themes/tokens.css'), css);
fs.writeFileSync(path.join(ROOT, 'themes/meta.js'), `/* GENERADO por tools/build-themes.mjs. No editar a mano. */\nwindow.MOTOR_STYLES=${JSON.stringify(meta)};\nwindow.MOTOR_DEFAULT_STYLE=${JSON.stringify(src.default)};\n`);
if (REPORT) console.table(report);
console.log(`tokens.css (${css.length} B) y meta.js escritos para ${src.styles.length} estilos.`);
