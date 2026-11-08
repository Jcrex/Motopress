// Revisión estática de un deck, sin navegador: comprueba las reglas que se pueden comprobar
// leyendo el HTML, el CSS y los efectos que carga. Complementa a verificar.mjs (que mira capturas).
// Uso: node tools/revisar.mjs <nombre|ruta> [--json]
// <nombre> es un deck de decks/; una ruta con «/» (atlas/completo) apunta a su carpeta o a su index.html.
// Sale con 1 si hay errores; los avisos no cambian el código de salida.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, positional } from './salida.mjs';

const [arg] = positional();
const json = process.argv.includes('--json');
if (!arg) { console.error('Uso: node tools/revisar.mjs <nombre|ruta> [--json]'); process.exit(2); }

const file = arg.endsWith('.html') ? path.resolve(ROOT, arg)
  : arg.includes('/') || arg === '.' ? path.resolve(ROOT, arg, 'index.html')
  : path.join(ROOT, 'decks', arg, 'index.html');
if (!fs.existsSync(file)) { console.error(`No existe ${path.relative(ROOT, file)}`); process.exit(2); }
const dir = path.dirname(file);
const html = fs.readFileSync(file, 'utf8');
const out = [];
const err = (msg, where = '') => out.push({ nivel: 'error', msg, where });
const warn = (msg, where = '') => out.push({ nivel: 'aviso', msg, where });
const lineOf = (i) => html.slice(0, i).split('\n').length;
const attr = (tag, name) => { const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)')`)); return m ? (m[2] ?? m[3]) : null; };

// ---------- estilos ----------
const STYLES = JSON.parse(fs.readFileSync(path.join(ROOT, 'themes/source.json'), 'utf8')).styles.map((s) => s.id);
const htmlTag = html.match(/<html\b[^>]*>/i)?.[0] || '';
const style = attr(htmlTag, 'data-style');
if (style && !STYLES.includes(style)) err(`data-style="${style}" no existe. Válidos: ${STYLES.join(', ')}`, 'línea 1');
const pick = html.match(/MOTOR_PICK\s*=\s*\[([^\]]*)\]/);
if (pick) {
  const names = [...pick[1].matchAll(/['"]([^'"]+)['"]/g)].map((m) => m[1]);
  names.filter((n) => !STYLES.includes(n)).forEach((n) => err(`MOTOR_PICK incluye «${n}», que no es un estilo`, `línea ${lineOf(pick.index)}`));
  if (style && names.length && !names.includes(style)) warn(`data-style="${style}" no está en MOTOR_PICK`);
}

// ---------- scripts y su orden ----------
const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].map((m) => ({ src: attr(m[0], 'src'), body: m[2], at: m.index }));
const idx = (re) => scripts.findIndex((s) => (s.src ? re.test(s.src) : re.test(s.body)));
const ORDER = [['MOTOR_PICK', /MOTOR_PICK/], ['themes/meta.js', /themes\/meta\.js$/], ['engine/engine.js', /engine\/engine\.js$/], ['fx/sistema.js', /fx\/sistema\.js$/], ['fx/fondos.js', /fx\/fondos\.js$/], ['fx/piezas.js', /fx\/piezas\.js$/]];
const pos = ORDER.map(([n, re]) => [n, idx(re)]);
for (const [n, i] of pos) if (i < 0 && n !== 'MOTOR_PICK') (n === 'fx/fondos.js' || n === 'fx/piezas.js' ? warn : err)(`No se carga ${n}`);
const present = pos.filter(([, i]) => i >= 0);
for (let k = 1; k < present.length; k++) if (present[k][1] < present[k - 1][1]) err(`${present[k][0]} se carga antes que ${present[k - 1][0]}`);
const vc = idx(/fx\/vc\.js$/), rai = idx(/fx\/rai\.js$/);
if (vc >= 0 && rai >= 0 && vc > rai) err('fx/vc.js debe cargarse antes que fx/rai.js');
if (vc >= 0 && rai < 0) err('fx/vc.js necesita fx/rai.js después (aporta «secuencia»)');
const lastCore = Math.max(...present.map(([, i]) => i));
scripts.forEach((s, i) => { if (s.src && /\/fx\/[^/]+\.js$/.test(s.src) && !/sistema|fondos|piezas/.test(s.src) && i < lastCore) err(`${s.src} se carga antes que el núcleo (meta, engine, sistema, fondos, piezas)`); });

// ---------- registro de efectos y pintores de los scripts locales ----------
const local = scripts.filter((s) => s.src && !/^https?:/.test(s.src)).map((s) => path.resolve(dir, s.src));
const code = local.filter((f) => { if (fs.existsSync(f)) return true; err(`Script inexistente: ${path.relative(ROOT, f)}`); return false; })
  .map((f) => fs.readFileSync(f, 'utf8')).concat(scripts.filter((s) => !s.src).map((s) => s.body)).join('\n');
const FX = new Set([...code.matchAll(/Motor\.fx\(\s*['"]([^'"]+)['"]/g)].map((m) => m[1]));
const PAINTERS = new Set(['none', ...STYLES, ...[...code.matchAll(/\b(?:P|painters)(?:\.([a-z][\w-]*)|\[['"]([^'"]+)['"]\])\s*=[^=]/g)].map((m) => m[1] || m[2])]);
const TITLE_FX = new Set(['auto', 'none', ...[...code.matchAll(/titleFx\(\s*['"]([^'"]+)['"]/g)].map((m) => m[1])]);
const REVEALS = ['auto', 'none', 'fade', 'wipe', 'wipe-x', 'focus', 'develop', 'mist', 'pixel', 'tilt'];
const CDN = scripts.map((s) => s.src || '').join(' ');
if (/data-fx="(?:sankey|clouds)"/.test(html) && !/d3-(?:sankey|cloud)/.test(CDN)) warn('sankey o clouds sin cargar d3-sankey / d3-cloud desde el CDN');
if (/data-fx="vc"|class="[^"]*\bvc-(?:conv|heat)\b|data-fns=/.test(html) && !/katex/.test(CDN)) warn('fx/vc.js renderiza fórmulas con KaTeX y no se carga desde el CDN');
if (/\bdata-fx="/.test(html) && !/d3@/.test(CDN) && /data-fx="(?:clouds|ridge|calendar|sankey|kpis|training|confusion|latent|nnet|rosgraph|lidar|astar|tftree|blueprint|scope)"/.test(html)) err('Hay efectos que usan D3 y no se carga d3 desde el CDN');

// ---------- diapositivas ----------
const ids = new Map();
for (const m of html.matchAll(/\sid\s*=\s*"([^"]+)"/g)) ids.set(m[1], (ids.get(m[1]) || 0) + 1);
[...ids].filter(([, n]) => n > 1).forEach(([id, n]) => err(`id="${id}" aparece ${n} veces`));
const slides = [...html.matchAll(/<section\b[^>]*class="[^"]*\bslide\b[^"]*"[^>]*>/g)];
if (!slides.length) err('No hay ninguna <section class="slide">');
slides.forEach((m, k) => {
  const tag = m[0], end = slides[k + 1]?.index ?? html.length, body = html.slice(m.index, end);
  const id = attr(tag, 'id'), where = `${id ? '#' + id : 'diapositiva ' + (k + 1)} (línea ${lineOf(m.index)})`;
  if (!id) err('Falta id', where);
  if (!attr(tag, 'data-section')) err('Falta data-section', where);
  if (!attr(tag, 'data-title')) err('Falta data-title', where);
  const fx = attr(tag, 'data-fx');
  if (fx && !FX.has(fx)) err(`data-fx="${fx}" no lo registra ningún script cargado`, where);
  if (fx === 'backdrop' && !/class="fx-bg"/.test(body)) err('data-fx="backdrop" sin <div class="fx-bg">', where);
  const painter = attr(tag, 'data-painter');
  if (painter) painter.split(/\s+/).map((p) => p.split(':').pop()).filter((p) => !PAINTERS.has(p)).forEach((p) => err(`Pintor desconocido «${p}»`, where));
  const tfx = attr(tag, 'data-title-fx');
  if (tfx && !TITLE_FX.has(tfx)) err(`data-title-fx="${tfx}" no existe`, where);
  for (const r of body.matchAll(/data-reveal="([^"]+)"/g)) if (!REVEALS.includes(r[1])) err(`data-reveal="${r[1]}" no existe`, where);
  for (const t of body.matchAll(/<(h[12])\b[^>]*class="[^"]*\bs-title\b([^"]*)"[^>]*>([\s\S]*?)<\/\1>/g)) {
    const text = t[3].replace(/<[^>]+>/g, '').replace(/&[a-z]+;|\\\(.*?\\\)/g, 'x').replace(/\s+/g, ' ').trim();
    const max = /\bxl\b/.test(t[2]) ? 24 : 28;
    if (text.length > max) warn(`Título de ${text.length} caracteres (máx. ~${max}): «${text}»`, where);
  }
  const bullets = (body.match(/<li\b(?![^>]*data-end)/g) || []).length;
  if (bullets > 6 && !/class="[^"]*\b(?:agenda|etapas|checklist)\b/.test(body)) warn(`${bullets} elementos de lista: una idea por diapositiva`, where);
});

// ---------- colores literales y tamaños de letra ----------
const HEX = /(^|[^&\w-])#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3}(?:[0-9a-fA-F]{2})?)?\b|\b(?:rgba?|hsla?)\(\s*[\d.]/;
const scanCss = (text, where, base = 0) => text.split('\n').forEach((l, i) => {
  if (/^\s*(\/\/|\/\*|\*)/.test(l)) return;
  if (HEX.test(l)) err(`Color literal: ${l.trim().slice(0, 90)}`, `${where}:${base + i + 1}`);
  for (const f of l.matchAll(/font(?:-size)?\s*:[^;]*?\b(\d+(?:\.\d+)?)px/g)) if (+f[1] < 22) warn(`Texto de ${f[1]} px (mínimo 22)`, `${where}:${base + i + 1}`);
});
for (const m of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) scanCss(m[1], 'index.html', lineOf(m.index) - 1);
for (const m of html.matchAll(/\s(?:style|fill|stroke|stop-color|color)\s*=\s*"([^"]*)"/g)) if (HEX.test(m[1])) err(`Color literal en atributo: ${m[0].trim().slice(0, 90)}`, `index.html:${lineOf(m.index)}`);
const own = fs.readdirSync(dir).filter((f) => /\.(css|js)$/.test(f));
own.forEach((f) => scanCss(fs.readFileSync(path.join(dir, f), 'utf8'), f));
local.filter((f) => f.startsWith(path.join(ROOT, 'fx') + path.sep) && !/\/(sistema|fondos|piezas)\.js$/.test(f)).forEach((f) => {
  const t = fs.readFileSync(f, 'utf8').replace(/<style[\s\S]*?<\/style>/g, '');
  t.split('\n').forEach((l, i) => { if (!/^\s*(\/\/|\/\*|\*)/.test(l) && HEX.test(l) && !/#version/.test(l)) warn(`Color literal en efecto: ${l.trim().slice(0, 90)}`, `${path.relative(ROOT, f)}:${i + 1}`); });
});

// ---------- salida ----------
const errores = out.filter((o) => o.nivel === 'error').length;
if (json) console.log(JSON.stringify({ deck: path.relative(ROOT, file), diapositivas: slides.length, errores, avisos: out.length - errores, hallazgos: out }, null, 2));
else {
  for (const o of out) console.log(`${o.nivel === 'error' ? 'ERROR' : 'aviso'}  ${o.where ? o.where + ' · ' : ''}${o.msg}`);
  console.log(`${path.relative(ROOT, file)}: ${slides.length} diapositivas, ${errores} errores, ${out.length - errores} avisos`);
}
process.exit(errores ? 1 : 0);
