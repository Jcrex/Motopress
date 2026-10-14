// Empaqueta un deck en un único archivo HTML (CSS y JS locales en línea).
// Uso: node tools/bundle.mjs [entrada=index.html] [salida] [--fragment] [--out=<carpeta>]
//   salida: archivo de destino. Si se omite, <carpeta de salida>/<nombre del deck>.html
//           (output/ por defecto; cámbiala con --out=<carpeta> o MOTOR_OUT, ver tools/salida.mjs).
//   --fragment: sin <!doctype>, <html>, <head> ni <body> (formato de artefacto de Claude).
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, outDir, positional } from './salida.mjs';

const args = positional();
const fragment = process.argv.includes('--fragment');
const input = path.resolve(ROOT, args[0] || 'index.html');
const deck = path.dirname(input) === ROOT ? 'atlas' : path.basename(path.dirname(input));
const output = args[1] ? path.resolve(ROOT, args[1]) : path.join(outDir(), `${deck}${fragment ? '-frag' : ''}.html`);
let html = fs.readFileSync(input, 'utf8');
const base = path.dirname(input);
const read = (rel) => fs.readFileSync(path.resolve(base, rel), 'utf8');
const isLocal = (u) => !/^(https?:)?\/\//.test(u);

const css = [];
html = html.replace(/<link rel="stylesheet" href="([^"]+)">\n?/g, (m, href) => (isLocal(href) ? (css.push(`/* ${href} */\n` + read(href)), '') : m));
html = html.replace(/<script src="([^"]+)"><\/script>/g, (m, src) => {
  if (!isLocal(src)) return m;
  const code = read(src);
  if (code.includes('</script')) throw new Error(`${src} contiene </script>`);
  return `<script>/* ${src} */\n${code}</script>`;
});
const style = `<style>\n${css.join('\n')}\n</style>`;
const title = (html.match(/<title>[^<]*<\/title>/) || ['<title>Atlas del motor</title>'])[0];
if (fragment) {
  const head = html.match(/<head>([\s\S]*?)<\/head>/)[1].replace(title, '').replace(/<meta charset[^>]*>\n?|<meta name="viewport"[^>]*>\n?/g, '');
  const body = html.match(/<body>([\s\S]*?)<\/body>/)[1];
  const style0 = (html.match(/<html[^>]*data-style="([^"]+)"/) || [])[1] || 'rice';
  html = `${title}\n${style}\n${head.trim()}\n<script>document.documentElement.lang='es';document.documentElement.dataset.style=document.documentElement.dataset.style||${JSON.stringify(style0)};</script>\n${body.trim()}\n`;
} else {
  html = html.replace(title, `${title}\n${style}`);
}
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, html);
console.log(`${path.relative(ROOT, output)} · ${(html.length / 1024).toFixed(0)} KB${fragment ? ' · fragmento' : ''}`);
