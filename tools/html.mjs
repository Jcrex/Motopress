// Lector mínimo de HTML, sin dependencias, para revisar.mjs y el MCP (tools/mcp/deck.mjs).
// Sigue la estructura que verá el navegador en lo que importa a un deck: comentarios, contenido de
// <script>, <style>, <textarea>, <title>, <noscript> y <template> (no son elementos del documento),
// atributos con comillas, sin comillas o con entidades, y nombres en mayúsculas. Una sola definición
// de «diapositiva» para todas las herramientas: <section> con la clase «slide».

const WS = /[\t\n\f\r ]/; // espacios de HTML (sin U+00A0)
const RAW = new Set(['script', 'style', 'textarea', 'title', 'noscript', 'xmp', 'iframe', 'noembed', 'noframes']);
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr', 'param']);
// Formato que el navegador «reabre» si queda sin cerrar: se arrastra a todo lo que viene después.
const FORMAT = new Set(['a', 'b', 'big', 'code', 'em', 'font', 'i', 'nobr', 's', 'small', 'strike', 'strong', 'tt', 'u']);
// Se cierran solos (</p>, </li>… opcionales): su falta no es un error.
const OPTIONAL = new Set(['p', 'li', 'dt', 'dd', 'option', 'optgroup', 'tr', 'td', 'th', 'thead', 'tbody', 'tfoot', 'colgroup', 'caption', 'rb', 'rt', 'rp', 'rtc']);

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
export const decode = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
  if (e[0] === '#') { const n = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : +e.slice(1); return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : m; }
  return ENT[e.toLowerCase()] ?? m;
});
export const clases = (v) => (v || '').split(/[\t\n\f\r ]+/).filter(Boolean);

// Etiquetas en orden: { tipo: 'open'|'close', name, attrs (Map), inicio, fin } y avisos de estructura.
export function etiquetas(html) {
  const out = [], avisos = [];
  const n = html.length;
  let i = 0;
  while (i < n) {
    const lt = html.indexOf('<', i);
    if (lt < 0) break;
    i = lt;
    if (html.startsWith('<!--', i)) {
      const end = html.indexOf('-->', i + 4);
      if (end < 0) { avisos.push({ msg: 'Comentario <!-- sin cerrar: oculta el resto del documento', at: i }); i = n; break; }
      i = end + 3; continue;
    }
    if (html[i + 1] === '!' || html[i + 1] === '?') { const end = html.indexOf('>', i); i = end < 0 ? n : end + 1; continue; }
    const close = html[i + 1] === '/';
    const s = close ? i + 2 : i + 1;
    if (!/[a-zA-Z]/.test(html[s] || '')) { i++; continue; }
    let j = s;
    while (j < n && !WS.test(html[j]) && html[j] !== '>' && html[j] !== '/') j++;
    const name = html.slice(s, j).toLowerCase();
    const attrs = new Map();
    // atributos
    while (j < n && html[j] !== '>') {
      if (WS.test(html[j]) || html[j] === '/') { j++; continue; }
      let k = j;
      while (k < n && !WS.test(html[k]) && html[k] !== '>' && html[k] !== '=' && !(html[k] === '/' && html[k + 1] === '>')) k++;
      const an = html.slice(j, k).toLowerCase();
      while (k < n && WS.test(html[k])) k++;
      let val = '';
      if (html[k] === '=') {
        k++;
        while (k < n && WS.test(html[k])) k++;
        const q = html[k];
        if (q === '"' || q === "'") { const e = html.indexOf(q, k + 1); const end = e < 0 ? n : e; val = html.slice(k + 1, end); k = end + 1; }
        else { const st = k; while (k < n && !WS.test(html[k]) && html[k] !== '>') k++; val = html.slice(st, k); }
      }
      if (an && !close && !attrs.has(an)) attrs.set(an, decode(val));
      j = Math.max(k, j + 1);
    }
    const fin = Math.min(n, j + 1);
    out.push({ tipo: close ? 'close' : 'open', name, attrs, inicio: i, fin });
    i = fin;
    if (!close && RAW.has(name)) {
      const re = new RegExp(`</${name}[\\t\\n\\f\\r />]`, 'ig'); re.lastIndex = i;
      const m = re.exec(html);
      if (!m) { avisos.push({ msg: `<${name}> sin cerrar: oculta el resto del documento`, at: out[out.length - 1].inicio }); i = n; break; }
      i = m.index;
    }
  }
  return { tags: out, avisos };
}

const esSlide = (t) => t.name === 'section' && clases(t.attrs.get('class')).includes('slide');

// Árbol simplificado: recorre las etiquetas con una pila y devuelve las diapositivas con su padre.
// - slides: [{ inicio, fin, id, attrs, padre: {name, attrs} | null, anidada, sinCerrar }]
// - problemas: [{ nivel, msg, at }] (etiquetas de formato sin cerrar, secciones desequilibradas…)
export function estructura(html) {
  const { tags, avisos } = etiquetas(html);
  const problemas = avisos.map((a) => ({ nivel: 'error', ...a }));
  const stack = [], slides = [];
  let tplDepth = 0;
  const cerrarSlide = (node, at) => { if (node.slide) node.slide.fin = at; };
  for (const t of tags) {
    if (t.name === 'template') { tplDepth += t.tipo === 'open' ? 1 : -1; if (tplDepth < 0) tplDepth = 0; continue; }
    if (tplDepth) continue; // el contenido de <template> no forma parte del documento
    if (t.tipo === 'open') {
      if (VOID.has(t.name)) continue;
      const node = { name: t.name, attrs: t.attrs, inicio: t.inicio };
      if (esSlide(t)) {
        const padre = stack[stack.length - 1] || null;
        const anidada = stack.some((x) => x.slide);
        node.slide = { inicio: t.inicio, fin: null, id: t.attrs.get('id') ?? null, attrs: t.attrs, padre: padre && { name: padre.name, attrs: padre.attrs }, anidada, formato: stack.filter((x) => FORMAT.has(x.name)).map((x) => x.name) };
        slides.push(node.slide);
      }
      stack.push(node);
      continue;
    }
    // cierre: busca la apertura correspondiente
    let k = stack.length - 1;
    while (k >= 0 && stack[k].name !== t.name) k--;
    if (k < 0) {
      if (t.name === 'section') problemas.push({ nivel: 'error', msg: '</section> sin su apertura', at: t.inicio });
      continue;
    }
    for (let q = stack.length - 1; q > k; q--) {
      const x = stack[q];
      if (FORMAT.has(x.name)) problemas.push({ nivel: 'error', msg: `<${x.name}> sin cerrar: el navegador lo arrastra a lo que sigue y puede ocultar diapositivas`, at: x.inicio });
      else if (x.name === 'section' || (x.name === 'div' && t.name === 'section')) problemas.push({ nivel: 'error', msg: `<${x.name}> sin cerrar antes de </${t.name}>`, at: x.inicio });
      else if (!OPTIONAL.has(x.name) && t.name === 'section') problemas.push({ nivel: 'aviso', msg: `<${x.name}> sin cerrar antes de </section>`, at: x.inicio });
      cerrarSlide(x, t.inicio);
      if (x.slide) x.slide.sinCerrar = true;
    }
    cerrarSlide(stack[k], t.fin);
    stack.length = k;
  }
  for (const x of stack) {
    if (x.slide) { x.slide.fin = html.length; x.slide.sinCerrar = true; problemas.push({ nivel: 'error', msg: `<section class="slide"${x.slide.id ? ` id="${x.slide.id}"` : ''}> sin cerrar`, at: x.inicio }); }
    else if (FORMAT.has(x.name)) problemas.push({ nivel: 'error', msg: `<${x.name}> sin cerrar`, at: x.inicio });
  }
  return { slides, problemas };
}

// Diapositivas de primer nivel (las que puede listar, leer, mover o borrar el MCP).
export function trozos(html) {
  return estructura(html).slides.filter((s) => !s.anidada).map((s) => ({ inicio: s.inicio, fin: s.fin, id: s.id, sinCerrar: !!s.sinCerrar }));
}
