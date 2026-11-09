// Empaqueta un deck en un único archivo HTML (CSS, JS e imágenes locales en línea).
// Uso: node tools/bundle.mjs [entrada=atlas/original/index.html] [salida] [--fragment] [--out=<carpeta>]
//   salida: archivo de destino. Si se omite, <carpeta de salida>/<nombre del deck>.html
//           (output/ por defecto; cámbiala con --out=<carpeta> o MOTOR_OUT, ver tools/salida.mjs).
//   --fragment: sin <!doctype>, <html>, <head> ni <body> (formato de artefacto de Claude).
// Solo se incrustan archivos del repositorio: una ruta que sale de él es un error (scripts y CSS)
// o se deja enlazada con un aviso (imágenes), para no meter por descuido archivos privados.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, outDir, positional } from './salida.mjs';

const args = positional();
const fragment = process.argv.includes('--fragment');
const input = path.resolve(ROOT, args[0] || 'atlas/original/index.html');
// atlas/original → atlas · atlas/<x> → atlas-<x> · decks/<x> → <x>
const dir = path.dirname(input), parent = path.basename(path.dirname(dir)), leaf = path.basename(dir);
const deck = dir === ROOT ? 'atlas' : parent === 'atlas' ? (leaf === 'original' ? 'atlas' : `atlas-${leaf}`) : leaf;
const output = args[1] ? path.resolve(ROOT, args[1]) : path.join(outDir(), `${deck}${fragment ? '-frag' : ''}.html`);
let html = fs.readFileSync(input, 'utf8');
const base = path.dirname(input);
const isLocal = (u) => !/^(?:[a-z][\w+.-]*:|\/\/|#|%23)/i.test(u.trim()); // ni http:, ni data:, ni //cdn, ni #ancla
const clean = (u) => u.replace(/[?#].*$/, '');
// Dentro del repositorio según la ruta real: un enlace simbólico que apunta fuera no cuenta como «dentro».
const ROOT_REAL = fs.realpathSync(ROOT);
const inRepo = (f) => {
  let real = f;
  try { real = fs.realpathSync(f); } catch { /* no existe: se juzga por la ruta escrita */ }
  return (real === ROOT_REAL || real.startsWith(ROOT_REAL + path.sep)) && (f === ROOT || f.startsWith(ROOT + path.sep));
};
// Ruta local → archivo del repositorio (sin ?v= ni #…). from: carpeta desde la que se resuelve.
// Un «%» suelto (img/100%.png) no es un escape: se deja tal cual en vez de abortar.
const decodeSafe = (u) => { try { return decodeURI(u); } catch { return u; } };
const resolveLocal = (u, from = base) => path.resolve(from, decodeSafe(clean(u)));
const readText = (rel, what) => {
  const f = resolveLocal(rel);
  if (!inRepo(f)) throw new Error(`${what} fuera del repositorio: ${rel}`);
  if (!fs.existsSync(f)) throw new Error(`${what} inexistente: ${rel}`);
  return { f, text: fs.readFileSync(f, 'utf8') };
};
const attrOf = (tag, name) => { const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i')); return m ? (m[1] ?? m[2] ?? m[3]) : null; };
const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.otf': 'font/otf' };
const dataUri = (f) => `data:${MIME[path.extname(f).toLowerCase()]};base64,${fs.readFileSync(f).toString('base64')}`;
const warned = new Set();
const warn = (msg) => { if (!warned.has(msg)) { warned.add(msg); console.warn('Aviso: ' + msg); } };

// Los comentarios HTML no cuentan: un <script> o <link> comentado no se incrusta ni aborta el empaquetado.
html = html.replace(/<!--[\s\S]*?-->/g, (c) => (/<(?:script|link|img)\b/i.test(c) ? '' : c));
// El <title> se busca en el HTML original: después, un script incrustado podría contener «<title>».
const titleMatch = html.match(/<title>[^<]*<\/title>/);
const title = titleMatch ? titleMatch[0] : '<title>Atlas del motor</title>';
if (!titleMatch) warn('el deck no tiene <title>; el CSS se inserta antes de </head>');

// CSS: las url() relativas se resuelven desde la hoja y se incrustan (fuentes e imágenes del repositorio).
const inlineCssUrls = (css, from) => css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g, (m, q, u) => {
  if (!isLocal(u)) return m;
  const f = resolveLocal(u, from);
  if (!inRepo(f) || !fs.existsSync(f) || !MIME[path.extname(f).toLowerCase()]) { warn(`url(${u}) en CSS no se ha podido incrustar`); return m; }
  return `url("${dataUri(f)}")`;
});
const css = [];
html = html.replace(/<link\b[^>]*>\n?/gi, (tag) => {
  const rel = (attrOf(tag, 'rel') || '').toLowerCase(), href = attrOf(tag, 'href');
  if (rel !== 'stylesheet' || !href || !isLocal(href)) return tag;
  const { f, text } = readText(href, 'Hoja de estilo');
  css.push(`/* ${href} */\n` + inlineCssUrls(text, path.dirname(f)));
  return '';
});
html = html.replace(/<script\b([^>]*)>\s*<\/script>/gi, (m, attrs) => {
  const src = attrOf(`<script${attrs}>`, 'src');
  if (!src || !isLocal(src)) return m;
  const { text: code } = readText(src, 'Script');
  if (/<\/script/i.test(code)) throw new Error(`${src} contiene </script>`);
  const rest = attrs.replace(/\s(?:src|defer|async)(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?/gi, ''); // type="module" y demás se conservan
  return `<script${rest}>/* ${src} */\n${code}</script>`;
});
// Imágenes locales en línea (data:), para que el HTML único no dependa de assets/. Los vídeos se quedan enlazados.
html = html.replace(/(<img\b[^>]*?\ssrc\s*=\s*)(["'])([^"']+)\2/gi, (m, a, q, src) => {
  if (!isLocal(src)) return m;
  const file = resolveLocal(src), type = MIME[path.extname(file).toLowerCase()];
  if (!inRepo(file)) { warn(`imagen fuera del repositorio, se deja enlazada: ${src}`); return m; }
  if (!type || !fs.existsSync(file)) { warn(`imagen no encontrada: ${src}`); return m; }
  return a + q + dataUri(file) + q;
});
if (/<(?:video|source)\b[^>]*\ssrc="(?!https?:|data:)/.test(html)) warn('los vídeos locales siguen enlazados; cópialos junto al HTML.');
const style = `<style>\n${css.join('\n')}\n</style>`;
if (fragment) {
  const head = (html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i) || [, ''])[1].replace(title, '').replace(/<meta charset[^>]*>\n?|<meta name="viewport"[^>]*>\n?/g, '');
  const body = (html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i) || [, html])[1];
  const style0 = (html.match(/<html[^>]*data-style="([^"]+)"/) || [])[1] || 'rice';
  html = `${title}\n${style}\n${head.trim()}\n<script>document.documentElement.lang='es';document.documentElement.dataset.style=document.documentElement.dataset.style||${JSON.stringify(style0)};</script>\n${body.trim()}\n`;
} else if (titleMatch) {
  const at = html.indexOf(title); // primera aparición: la del <head>, antes que cualquier script
  html = html.slice(0, at + title.length) + '\n' + style + html.slice(at + title.length);
} else {
  const at = html.search(/<\/head>/i);
  html = at >= 0 ? html.slice(0, at) + style + '\n' + html.slice(at) : style + '\n' + html;
}
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, html);
console.log(`${path.relative(ROOT, output)} · ${(html.length / 1024).toFixed(0)} KB${fragment ? ' · fragmento' : ''}`);
