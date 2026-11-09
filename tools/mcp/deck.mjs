// Operaciones sobre un deck por diapositivas: listar, leer, escribir, borrar y mover <section class="slide">.
// Cada escritura se revisa con tools/revisar.mjs antes de guardarla: si añade errores, no se guarda.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from '../salida.mjs';
import { revisar, archivoDeck } from '../revisar.mjs';
import { trozos } from '../html.mjs';

export const NOMBRE = /^[a-z0-9][a-z0-9-]{0,60}$/;
const PLANTILLA = path.join(ROOT, '.claude/skills/crear-presentacion/plantilla.html');

export function rutaDeck(deck) {
  if (!NOMBRE.test(deck) && !/^atlas\/[a-z0-9-]+$/.test(deck)) throw new Error(`Nombre de deck no válido: «${deck}» (minúsculas, números y guiones)`);
  return archivoDeck(deck);
}

export function listarDecks() {
  const dir = path.join(ROOT, 'decks');
  return fs.readdirSync(dir).filter((d) => fs.existsSync(path.join(dir, d, 'index.html'))).sort();
}

// Posiciones [inicio, fin) de cada <section class="slide"> de primer nivel: lector común (tools/html.mjs),
// que respeta comentarios, <script>, <template>, atributos con comillas y mayúsculas.
export { trozos };

const leerHtml = (deck) => { const f = rutaDeck(deck); if (!fs.existsSync(f)) throw new Error(`No existe el deck «${deck}»`); return fs.readFileSync(f, 'utf8'); };

export function leerDiapositiva(deck, id) {
  const html = leerHtml(deck), t = trozos(html).find((x) => x.id === id);
  if (!t) throw new Error(`No hay ninguna diapositiva #${id} en «${deck}»`);
  return html.slice(t.inicio, t.fin);
}

// Guarda html si no añade errores respecto al estado anterior. Devuelve la revisión de la diapositiva afectada.
// Un error se identifica por su texto y su diapositiva (sin el número de línea, que cambia al insertar),
// y se cuentan las repeticiones: el mismo error en otra diapositiva, o una vez más, es nuevo.
function guardar(deck, nuevo, ids, forzar) {
  const antes = revisar(deck);
  const despues = revisar(deck, { html: nuevo });
  const clave = (h) => `${h.msg}@${(h.where || '').replace(/\s*\(línea \d+\)/, '').replace(/:\d+$/, '')}`;
  const cuenta = new Map();
  antes.hallazgos.filter((h) => h.nivel === 'error').forEach((h) => cuenta.set(clave(h), (cuenta.get(clave(h)) || 0) + 1));
  const nuevosSet = new Set();
  despues.hallazgos.filter((h) => h.nivel === 'error').forEach((h) => { const k = clave(h), n = cuenta.get(k) || 0; if (n > 0) cuenta.set(k, n - 1); else nuevosSet.add(h); });
  const nuevos = [...nuevosSet];
  const propios = despues.hallazgos.filter((h) => ids.some((id) => (h.where || '').startsWith('#' + id + ' ')) || nuevosSet.has(h));
  if (nuevos.length && !forzar) return { guardado: false, motivo: 'La revisión encontró errores nuevos; corrige y vuelve a intentarlo (o usa forzar).', hallazgos: propios };
  fs.writeFileSync(rutaDeck(deck), nuevo);
  return { guardado: true, hallazgos: propios, diapositivas: despues.diapositivas };
}

// Crea o sustituye la diapositiva cuyo id lleva el html. Sin despues_de, una nueva va antes del cierre
// (la última diapositiva con class "closing") o al final.
export function escribirDiapositiva(deck, seccion, { despuesDe = null, forzar = false } = {}) {
  seccion = seccion.trim();
  const ts = trozos(seccion);
  if (ts.length !== 1 || ts[0].inicio !== 0 || ts[0].fin !== seccion.length || ts[0].sinCerrar) throw new Error('El html debe ser exactamente una <section class="slide" id="…">…</section>, bien cerrada');
  const id = ts[0].id;
  if (!id) throw new Error('La diapositiva necesita id');
  const html = leerHtml(deck), all = trozos(html), prev = all.find((x) => x.id === id);
  const rota = all.find((x) => x.sinCerrar);
  if (rota) throw new Error(`La diapositiva ${rota.id ? '#' + rota.id : 'en ' + rota.inicio} no tiene </section>: corrígela antes de escribir otra (node tools/revisar.mjs ${deck})`);
  let nuevo;
  if (prev && !despuesDe) nuevo = html.slice(0, prev.inicio) + seccion + html.slice(prev.fin);
  else {
    let base = html, list = all;
    if (prev) { base = html.slice(0, prev.inicio) + html.slice(prev.fin).replace(/^\n+/, ''); list = trozos(base); }
    const d = despuesDe && list.find((x) => x.id === despuesDe);
    if (despuesDe && !d) throw new Error(`No hay ninguna diapositiva #${despuesDe}`);
    const cierre = !despuesDe && [...list].reverse().find((x) => /^<section\b[^>]*class="[^"]*\bclosing\b/.test(base.slice(x.inicio)));
    // Une sin tocar el resto del documento: solo se ajustan los saltos de línea junto a la diapositiva.
    const junta = (a, b) => a.replace(/\n+$/, '') + '\n\n' + seccion + '\n\n' + b.replace(/^\n+/, '');
    if (cierre) nuevo = junta(base.slice(0, cierre.inicio), base.slice(cierre.inicio));
    else {
      let at;
      if (d) at = d.fin;
      else if (list.length) at = list[list.length - 1].fin;
      else {
        const st = base.match(/<div\b[^>]*class="[^"]*\bstage\b[^"]*"[^>]*>/);
        if (!st) throw new Error('El deck no tiene <div class="stage"> ni diapositivas: no sé dónde colocarla');
        at = st.index + st[0].length;
      }
      nuevo = junta(base.slice(0, at), base.slice(at));
    }
  }
  return { id, accion: prev ? (despuesDe ? 'movida' : 'sustituida') : 'creada', ...guardar(deck, nuevo, [id], forzar) };
}

export function borrarDiapositiva(deck, id) {
  const html = leerHtml(deck), t = trozos(html).find((x) => x.id === id);
  if (!t) throw new Error(`No hay ninguna diapositiva #${id}`);
  const nuevo = html.slice(0, t.inicio).replace(/\n+$/, '\n\n') + html.slice(t.fin).replace(/^\n+/, '');
  return { id, accion: 'borrada', ...guardar(deck, nuevo, [], true) };
}

export function moverDiapositiva(deck, id, despuesDe) {
  return escribirDiapositiva(deck, leerDiapositiva(deck, id), { despuesDe, forzar: true });
}

// Deck nuevo desde la plantilla de la skill, sin sus diapositivas de ejemplo.
export function crearDeck({ nombre, titulo, estilo = 'suizo', estilos = null, extras = [], css = '' }) {
  if (!NOMBRE.test(nombre)) throw new Error(`Nombre no válido: «${nombre}»`);
  const dir = path.join(ROOT, 'decks', nombre);
  if (fs.existsSync(path.join(dir, 'index.html'))) throw new Error(`Ya existe decks/${nombre}/index.html`);
  let html = fs.readFileSync(PLANTILLA, 'utf8');
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  html = html.replace(/<html lang="es" data-style="[^"]*">/, `<html lang="es" data-style="${estilo}">`)
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(titulo)}</title>`)
    .replace(/<div class="stage">[\s\S]*<\/div>\n<\/main>/, '<div class="stage">\n\n</div>\n</main>');
  const pick = estilos && estilos.length ? estilos : [estilo];
  html = html.replace(/window\.MOTOR_PICK = \[[^\]]*\]/, `window.MOTOR_PICK = [${pick.map((s) => `'${s}'`).join(', ')}]`);
  const CDN = {
    'katex': { css: '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">', js: '<script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>\n<script src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"></script>' },
    'd3-sankey': { js: '<script src="https://cdn.jsdelivr.net/npm/d3-sankey@0.12.3/dist/d3-sankey.min.js"></script>' },
    'd3-cloud': { js: '<script src="https://cdn.jsdelivr.net/npm/d3-cloud@1.2.7/build/d3.layout.cloud.min.js"></script>' },
  };
  const fxLocal = [];
  for (const e of extras) {
    if (e === 'vc') { extras.includes('katex') || extras.push('katex'); continue; }
    if (CDN[e]) continue;
    if (/^fx\/(?:experimental\/)?[a-z0-9-]+\.js$/.test(e) && fs.existsSync(path.join(ROOT, e))) fxLocal.push(e); else throw new Error(`Extra desconocido: ${e}`);
  }
  if (extras.includes('vc')) fxLocal.unshift('fx/vc.js', 'fx/rai.js');
  else if (fxLocal.includes('fx/vc.js') && !fxLocal.includes('fx/rai.js')) fxLocal.splice(fxLocal.indexOf('fx/vc.js') + 1, 0, 'fx/rai.js');
  const cdnCss = extras.filter((e) => CDN[e]?.css).map((e) => CDN[e].css).join('\n');
  const cdnJs = extras.filter((e) => CDN[e]?.js).map((e) => CDN[e].js).join('\n');
  if (cdnCss || extras.includes('vc')) html = html.replace('<link rel="stylesheet" href="../../themes/tokens.css">', [cdnCss, '<link rel="stylesheet" href="../../themes/tokens.css">'].filter(Boolean).join('\n'));
  if (extras.includes('vc')) html = html.replace('<link rel="stylesheet" href="deck.css">', '<link rel="stylesheet" href="../../fx/vc.css">\n<link rel="stylesheet" href="deck.css">');
  if (cdnJs) html = html.replace('<script src="../../themes/meta.js"></script>', `${cdnJs}\n<script src="../../themes/meta.js"></script>`);
  const fxTags = [...new Set(fxLocal)].map((f) => `<script src="../../${f}"></script>`).join('\n');
  if (fxTags) html = html.replace('<script src="../../fx/grafico.js"></script>', `<script src="../../fx/grafico.js"></script>\n${fxTags}`);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  fs.writeFileSync(path.join(dir, 'deck.css'), css || `/* Estilos propios de «${titulo}». Solo tokens de color (var(--…)). */\n`);
  return { deck: nombre, archivo: path.relative(ROOT, path.join(dir, 'index.html')) };
}
