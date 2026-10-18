// Captura cada diapositiva de un deck en varios estilos y en claro y oscuro, y avisa
// de errores de consola y de elementos que se salen del lienzo.
// Uso: node tools/verificar.mjs <nombre> [estilo1,estilo2] [--out=<carpeta>]   (con el servidor en :8000)
// Capturas en <carpeta de salida>/capturas/<nombre>/ (output/ por defecto; ver tools/salida.mjs).
// VERIF_REDUCED=1 captura con movimiento reducido (estado final de las animaciones).
// Requiere playwright (npm i -D playwright). CHROMIUM_PATH=/ruta/chrome usa un navegador ya instalado.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import { outDir, positional } from './salida.mjs';
const [deck, list] = positional();
const styles = (list || 'suizo,noche').split(',');
const dir = path.join(outDir(), 'capturas', deck);
const base = `http://localhost:8000/decks/${deck}/`;
fs.mkdirSync(dir, { recursive: true });
const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
for (const style of styles) for (const mode of ['light', 'dark']) {
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, ...(process.env.VERIF_REDUCED ? { reducedMotion: 'reduce' } : {}) });
  await p.addInitScript(([s, m]) => { localStorage.setItem('motor:style', s); localStorage.setItem('motor:mode', m); }, [style, mode]);
  p.on('console', (msg) => msg.type() === 'error' && console.log(`[${style}/${mode}] consola:`, msg.text()));
  p.on('pageerror', (e) => console.log(`[${style}/${mode}] página:`, e.message));
  await p.goto(base);
  const ids = await p.$$eval('section.slide', (s) => s.map((x) => x.id));
  for (const id of ids) {
    await p.goto(`${base}?v=${id}#${id}`); // la query fuerza la recarga
    await p.waitForTimeout(1200);
    const over = await p.$eval(`#${id}`, (s) => [...s.querySelectorAll('*')].filter((e) => {
      const r = e.getBoundingClientRect(), R = s.getBoundingClientRect();
      return r.width && (r.right > R.right + 1 || r.bottom > R.bottom + 1);
    }).length);
    if (over) console.log(`[${style}/${mode}] ${id}: ${over} elementos se salen del lienzo`);
    await p.screenshot({ path: path.join(dir, `${style}-${mode}-${id}.png`) });
  }
  await p.close();
}
await b.close();
console.log(`Capturas en ${dir}`);
