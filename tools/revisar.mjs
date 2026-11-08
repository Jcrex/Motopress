// Revisión estática de un deck, sin navegador: comprueba las reglas que se pueden comprobar
// leyendo el HTML, el CSS y los efectos que carga. Complementa a verificar.mjs (que mira capturas).
// Uso: node tools/revisar.mjs <nombre|ruta> [--json]   ·   como módulo: revisar(deck, { html }) y archivoDeck(deck)
// <nombre> es un deck de decks/; una ruta con «/» (atlas/completo) apunta a su carpeta o a su index.html.
// Sale con 1 si hay errores; los avisos no cambian el código de salida.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, positional } from './salida.mjs';

import { fileURLToPath } from 'node:url';

// Ruta del index.html de un deck: nombre de decks/, carpeta (atlas/completo) o archivo .html.
export function archivoDeck(arg) {
  return arg.endsWith('.html') ? path.resolve(ROOT, arg)
    : arg.includes('/') || arg === '.' ? path.resolve(ROOT, arg, 'index.html')
    : path.join(ROOT, 'decks', arg, 'index.html');
}

// Devuelve { deck, diapositivas, errores, avisos, hallazgos: [{ nivel, msg, where }], indice: [{ id, seccion, titulo, fx, pasos, linea }] }.
// opciones.html revisa ese contenido en lugar del archivo (para comprobar un cambio antes de guardarlo).
export function revisar(arg, opciones = {}) {
const file = archivoDeck(arg);
if (opciones.html == null && !fs.existsSync(file)) throw new Error(`No existe ${path.relative(ROOT, file)}`);
  const dir = path.dirname(file);
  const html = opciones.html ?? fs.readFileSync(file, 'utf8');
  const out = [];
  const err = (msg, where = '') => out.push({ nivel: 'error', msg, where });
  const warn = (msg, where = '') => out.push({ nivel: 'aviso', msg, where });
  const lineOf = (i) => html.slice(0, i).split('\n').length;
  // Etiqueta de apertura respetando comillas: un «>» dentro de un atributo no la corta.
  const TAG = `(?:[^>"']|"[^"]*"|'[^']*')*`;
  const attr = (tag, name) => { const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)')`)); return m ? (m[2] ?? m[3]) : null; };

  // ---------- estilos ----------
  const STYLES = JSON.parse(fs.readFileSync(path.join(ROOT, 'themes/source.json'), 'utf8')).styles.map((s) => s.id);
  const htmlTag = html.match(new RegExp(`<html\\b${TAG}>`, 'i'))?.[0] || '';
  const style = attr(htmlTag, 'data-style');
  if (style && !STYLES.includes(style)) err(`data-style="${style}" no existe. Válidos: ${STYLES.join(', ')}`, 'línea 1');
  const pick = html.match(/MOTOR_PICK\s*=\s*\[([^\]]*)\]/);
  if (pick) {
    const names = [...pick[1].matchAll(/['"]([^'"]+)['"]/g)].map((m) => m[1]);
    names.filter((n) => !STYLES.includes(n)).forEach((n) => err(`MOTOR_PICK incluye «${n}», que no es un estilo`, `línea ${lineOf(pick.index)}`));
    if (style && names.length && !names.includes(style)) warn(`data-style="${style}" no está en MOTOR_PICK`);
  }

  // ---------- scripts y su orden ----------
  const scripts = [...html.matchAll(new RegExp(`<script\\b(${TAG})>([\\s\\S]*?)<\\/script>`, 'gi'))].map((m) => ({ src: attr(`<script${m[1]}>`, 'src'), body: m[2], at: m.index }));
  const idx = (re) => scripts.findIndex((s) => (s.src ? re.test(s.src) : re.test(s.body)));
  const ORDER = [['MOTOR_PICK', /MOTOR_PICK/], ['themes/meta.js', /themes\/meta\.js$/], ['engine/engine.js', /engine\/engine\.js$/], ['fx/sistema.js', /fx\/sistema\.js$/], ['fx/fondos.js', /fx\/fondos\.js$/], ['fx/piezas.js', /fx\/piezas\.js$/]];
  const pos = ORDER.map(([n, re]) => [n, idx(re)]);
  for (const [n, i] of pos) if (i < 0 && n !== 'MOTOR_PICK') (n === 'fx/fondos.js' || n === 'fx/piezas.js' ? warn : err)(`No se carga ${n}`);
  const present = pos.filter(([, i]) => i >= 0);
  for (let k = 1; k < present.length; k++) if (present[k][1] < present[k - 1][1]) err(`${present[k][0]} se carga antes que ${present[k - 1][0]}`);
  if (!/atlas\/completo\//.test(path.relative(ROOT, file)) && scripts.some((s) => s.src && /fx\/experimental\//.test(s.src))) warn('Carga componentes de fx/experimental: son ports en pruebas, solo para el Atlas Completo');
  const vc = idx(/fx\/vc\.js$/), rai = idx(/fx\/rai\.js$/);
  if (vc >= 0 && rai >= 0 && vc > rai) err('fx/vc.js debe cargarse antes que fx/rai.js');
  if (vc >= 0 && rai < 0) err('fx/vc.js necesita fx/rai.js después (aporta «secuencia»)');
  const lastCore = Math.max(...present.map(([, i]) => i));
  scripts.forEach((s, i) => { if (s.src && /\/fx\/[^/]+\.js$/.test(s.src) && !/sistema|fondos|piezas/.test(s.src) && i < lastCore) err(`${s.src} se carga antes que el núcleo (meta, engine, sistema, fondos, piezas)`); });

  // ---------- registro de efectos y pintores de los scripts locales ----------
  const remote = (src) => /^(?:https?:)?\/\/|^data:/.test(src);
  const local = scripts.filter((s) => s.src && !remote(s.src)).map((s) => path.resolve(dir, s.src.replace(/[?#].*$/, '')));
  const code = local.filter((f) => { if (fs.existsSync(f)) return true; err(`Script inexistente: ${path.relative(ROOT, f)}`); return false; })
    .map((f) => fs.readFileSync(f, 'utf8')).concat(scripts.filter((s) => !s.src).map((s) => s.body)).join('\n');
  const FX = new Set([...code.matchAll(/Motor\.fx\(\s*['"]([^'"]+)['"]/g)].map((m) => m[1]));
  const PAINTERS = new Set(['none', ...STYLES, ...[...code.matchAll(/\b(?:P|painters)(?:\.([a-z][\w-]*)|\[['"]([^'"]+)['"]\])\s*=[^=]/g)].map((m) => m[1] || m[2])]);
  const TITLE_FX = new Set(['auto', 'none', ...[...code.matchAll(/titleFx\(\s*['"]([^'"]+)['"]/g)].map((m) => m[1])]);
  const REVEALS = ['auto', 'none', 'fade', 'wipe', 'wipe-x', 'focus', 'develop', 'mist', 'pixel', 'tilt'];
  const GRAFICO = idx(/fx\/grafico\.js$/) >= 0;
  const CDN = scripts.map((s) => s.src || '').join(' ');
  if (/data-fx="(?:sankey|clouds)"/.test(html) && !/d3-(?:sankey|cloud)/.test(CDN)) warn('sankey o clouds sin cargar d3-sankey / d3-cloud desde el CDN');
  if (/data-fx="vc"|class="[^"]*\bvc-(?:conv|heat)\b|data-fns=/.test(html) && !/katex/.test(CDN)) warn('fx/vc.js renderiza fórmulas con KaTeX y no se carga desde el CDN');
  const hasD3 = scripts.some((s) => s.src && /(?:^|\/)d3(?:@[\w.]+)?(?:\/|\.(?:v\d+\.)?(?:min\.)?js$)/.test(s.src.replace(/[?#].*$/, '')));
  if (/\bdata-fx="/.test(html) && !hasD3 && /data-fx="(?:clouds|ridge|calendar|sankey|kpis|training|confusion|latent|nnet|rosgraph|lidar|astar|tftree|blueprint|scope)"/.test(html)) err('Hay efectos que usan D3 y no se carga d3 desde el CDN');

  // ---------- diapositivas ----------
  const ids = new Map();
  for (const m of html.matchAll(/\sid\s*=\s*"([^"]+)"/g)) ids.set(m[1], (ids.get(m[1]) || 0) + 1);
  [...ids].filter(([, n]) => n > 1).forEach(([id, n]) => err(`id="${id}" aparece ${n} veces`));
  const indice = [];
  // Fuera comentarios: una diapositiva comentada no cuenta.
  const live = html.replace(/<!--[\s\S]*?-->/g, (c) => c.replace(/[^\n]/g, ' '));
  const slides = [...live.matchAll(new RegExp(`<section\\b${TAG}>`, 'g'))].filter((m) => /(?:^|\s)slide(?:\s|$)/.test(attr(m[0], 'class') || ''));
  if (!slides.length) err('No hay ninguna <section class="slide">');
  slides.forEach((m, k) => {
    const tag = m[0], end = slides[k + 1]?.index ?? html.length, body = live.slice(m.index, end);
    const id = attr(tag, 'id'), where = `${id ? '#' + id : 'diapositiva ' + (k + 1)} (línea ${lineOf(m.index)})`;
    indice.push({ id, seccion: attr(tag, 'data-section'), titulo: attr(tag, 'data-title'), fx: attr(tag, 'data-fx'), pasos: (body.match(/\sdata-step\b/g) || []).length, linea: lineOf(m.index) });
    if (!id) err('Falta id', where);
    for (const g of body.matchAll(/<(figure|div)\b[^>]*class="[^"]*\bgrafico\b[^"]*"[^>]*>([\s\S]*?)<\/\1>/g)) {
      if (!GRAFICO) err('Hay un .grafico y no se carga fx/grafico.js', where);
      const tipo = attr(g[0], 'data-tipo') || 'barras';
      if (!['barras', 'columnas', 'lineas', 'dispersion'].includes(tipo)) err(`data-tipo="${tipo}" no existe (barras, columnas, lineas, dispersion)`, where);
      const j = g[2].match(/<script type="application\/json">([\s\S]*?)<\/script>/);
      if (!j) { err('.grafico sin <script type="application/json"> con los datos', where); continue; }
      let d; try { d = JSON.parse(j[1]); } catch (e) { err(`JSON del gráfico inválido: ${e.message}`, where); continue; }
      if (!d.datos && !d.series) err('El JSON del gráfico necesita "datos" o "series"', where);
      if (d.series && tipo !== 'dispersion') { const n = (d.etiquetas || d.x || []).length; d.series.forEach((s) => { if (!Array.isArray(s.valores) || s.valores.length !== n) err(`Serie «${s.nombre}»: ${s.valores ? s.valores.length : 0} valores para ${n} etiquetas`, where); }); }
      if (d.series && d.series.length > 6) warn(`${d.series.length} series: hay 6 colores categóricos`, where);
    }
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
  // hex, funciones de color (rgb, hsl, oklch, lab…) y nombres CSS en propiedades de color.
  // Una excepción justificada se marca con «color-literal» en la línea o en el comentario de encima.
  const NAMES = 'white|black|red|green|blue|yellow|orange|purple|pink|gray|grey|silver|gold|navy|teal|maroon|olive|lime|aqua|fuchsia|cyan|magenta|brown|crimson|tomato|coral|salmon|indigo|violet';
  const PROPS = String.raw`(?:\bcolor|background(?:-color)?|\bfill|\bstroke|border(?:-[a-z]+)?-color|stop-color|outline-color)\s*:\s*`;
  const BASE = String.raw`(^|[^&\w-])#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3}(?:[0-9a-fA-F]{2})?)?\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch|hwb)\(\s*[\d.]|\bcolor\(\s*(?:srgb|display-p3)`;
  const HEX = new RegExp(`${BASE}|${PROPS}(?:${NAMES})\\b`, 'i'); // CSS: nombre sin comillas
  const HEX_JS = new RegExp(`${BASE}|${PROPS}['"\`](?:${NAMES})['"\`]`, 'i'); // JS: el nombre va entre comillas (sin ellas es una variable)
  const exempt = (lines, i) => /color-literal/.test(lines[i]) || (i > 0 && /^\s*(\/\/|\/\*|\*).*color-literal/.test(lines[i - 1]));
  const scanCss = (text, where, base = 0) => text.split('\n').forEach((l, i, all) => {
    if (/^\s*(\/\/|\/\*|\*)/.test(l) || exempt(all, i)) return;
    if (HEX.test(l)) err(`Color literal: ${l.trim().slice(0, 90)}`, `${where}:${base + i + 1}`);
    for (const f of l.matchAll(/font(?:-size)?\s*:[^;]*?\b(\d+(?:\.\d+)?)px/g)) if (+f[1] < 22) warn(`Texto de ${f[1]} px (mínimo 22)`, `${where}:${base + i + 1}`);
  });
  for (const m of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) scanCss(m[1], 'index.html', lineOf(m.index) - 1);
  for (const m of html.matchAll(/\s(?:style|fill|stroke|stop-color|color)\s*=\s*"([^"]*)"/g)) if (HEX.test(m[1])) err(`Color literal en atributo: ${m[0].trim().slice(0, 90)}`, `index.html:${lineOf(m.index)}`);
  const own = (fs.existsSync(dir) ? fs.readdirSync(dir) : []).filter((f) => /\.(css|js)$/.test(f));
  own.forEach((f) => scanCss(fs.readFileSync(path.join(dir, f), 'utf8'), f));
  local.filter((f) => f.startsWith(path.join(ROOT, 'fx') + path.sep) && fs.existsSync(f)).forEach((f) => {
    const t = fs.readFileSync(f, 'utf8').replace(/<style[\s\S]*?<\/style>/g, (m) => m.replace(/[^\n]/g, ' '));
    t.split('\n').forEach((l, i, all) => { if (!/^\s*(\/\/|\/\*|\*)/.test(l) && !exempt(all, i) && HEX_JS.test(l) && !/#version/.test(l)) warn(`Color literal en efecto: ${l.trim().slice(0, 90)}`, `${path.relative(ROOT, f)}:${i + 1}`); });
  });
  const errores = out.filter((o) => o.nivel === 'error').length;
  return { deck: path.relative(ROOT, file), diapositivas: slides.length, errores, avisos: out.length - errores, hallazgos: out, indice };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [arg] = positional();
  if (!arg) { console.error('Uso: node tools/revisar.mjs <nombre|ruta> [--json]'); process.exit(2); }
  let r;
  try { r = revisar(arg); } catch (e) { console.error(e.message); process.exit(2); }
  if (process.argv.includes('--json')) { const { indice, ...rest } = r; console.log(JSON.stringify(rest, null, 2)); }
  else {
    for (const o of r.hallazgos) console.log(`${o.nivel === 'error' ? 'ERROR' : 'aviso'}  ${o.where ? o.where + ' · ' : ''}${o.msg}`);
    console.log(`${r.deck}: ${r.diapositivas} diapositivas, ${r.errores} errores, ${r.avisos} avisos`);
  }
  process.exit(r.errores ? 1 : 0);
}
