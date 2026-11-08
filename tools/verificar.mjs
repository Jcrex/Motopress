// Captura cada diapositiva de un deck en varios estilos y en claro y oscuro, y avisa
// de errores de consola y de elementos que se salen del lienzo.
// Uso: node tools/verificar.mjs <nombre|ruta> [estilo1,estilo2] [--paso=primero|ultimo|N] [--solo=id1,id2] [--out=<carpeta>]
// <nombre> es un deck de decks/; una ruta con «/» (atlas/completo) o «.» (la raíz) se sirve tal cual.
// Levanta su propio servidor de la raíz del repositorio (MOTOR_URL=http://… usa uno que ya esté en marcha).
// Capturas en <carpeta de salida>/capturas/<nombre>/ (output/ por defecto; ver tools/salida.mjs).
// --paso: primero (por defecto, los data-step ocultos), ultimo (todos revelados) o un número.
// VERIF_REDUCED=1 captura con movimiento reducido (estado final de las animaciones).
// Requiere playwright (npm i -D playwright). CHROMIUM_PATH=/ruta/chrome usa un navegador ya instalado.
// También se usa como módulo: verificar(), capturar(), abrirNavegador(), urlDeck().
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { outDir, positional } from './salida.mjs';
import { servir } from './servidor.mjs';

// Nombre de carpeta de capturas y ruta relativa a la raíz para un deck o una ruta.
export function urlDeck(deck) {
  const isPath = deck === '.' || deck.includes('/');
  const rel = deck.replace(/^\.\/?|\/+$/g, '');
  return { nombre: isPath ? rel.replace(/\//g, '-') || 'raiz' : deck, ruta: isPath ? (rel ? rel + '/' : '') : `decks/${deck}/` };
}

// Chromium: CHROMIUM_PATH, el que espera Playwright o, si falta, el más reciente de su caché.
export async function abrirNavegador() {
  if (process.env.CHROMIUM_PATH) return chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
  try { return await chromium.launch(); } catch (e) {
    const cache = process.env.PLAYWRIGHT_BROWSERS_PATH || path.join(os.homedir(), process.platform === 'darwin' ? 'Library/Caches/ms-playwright' : '.cache/ms-playwright');
    const exe = (fs.existsSync(cache) ? fs.readdirSync(cache) : []).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => +b.split('-')[1] - +a.split('-')[1])
      .map((d) => ['chrome-linux64/chrome', 'chrome-linux/chrome', 'chrome-mac/Chromium.app/Contents/MacOS/Chromium', 'chrome-win/chrome.exe'].map((x) => path.join(cache, d, x)).find((x) => fs.existsSync(x))).find(Boolean);
    if (!exe) throw new Error('No hay Chromium: ejecuta «npx playwright install chromium» o define CHROMIUM_PATH');
    return chromium.launch({ executablePath: exe });
  }
}

// Página con estilo y modo fijados antes de cargar. Junta los errores de consola en page._errores.
export async function nuevaPagina(browser, { estilo, modo, reduced, escala = 1 }) {
  const p = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: escala, ...(reduced ? { reducedMotion: 'reduce' } : {}) });
  await p.addInitScript(([s, m]) => { try { if (s) localStorage.setItem('motor:style', s); if (m) localStorage.setItem('motor:mode', m); } catch (e) { /* sin almacenamiento */ } }, [estilo, modo]);
  p._errores = [];
  // Los recursos que faltan se avisan con su ruta (el mensaje de consola no la trae).
  p.on('console', (msg) => msg.type() === 'error' && !/^Failed to load resource/.test(msg.text()) && p._errores.push('consola: ' + msg.text()));
  p.on('response', (r) => { if (r.status() >= 400) p._errores.push(`recurso ${r.status()}: ${decodeURIComponent(new URL(r.url()).pathname)}`); });
  p.on('pageerror', (e) => p._errores.push('página: ' + e.message));
  return p;
}

// Va a una diapositiva, revela pasos y devuelve { png, desbordes, errores, pasos }.
export async function capturar(page, base, id, { paso = 'primero', reduced = false, espera = 1200, archivo, formato } = {}) {
  page._errores.length = 0;
  await page.goto(`${base}?v=${encodeURIComponent(id)}#${id}`); // la query fuerza la recarga
  await page.waitForTimeout(espera);
  const total = await page.$eval(`[id="${id}"]`, (s) => s.querySelectorAll('[data-step]').length).catch(() => null);
  if (total == null) throw new Error(`No existe la diapositiva #${id}`);
  const n = paso === 'ultimo' ? total : paso === 'primero' ? 0 : Math.min(total, Math.max(0, parseInt(paso, 10) || 0));
  for (let k = 0; k < n; k++) { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(reduced ? 120 : 650); }
  if (n) await page.waitForTimeout(reduced ? 200 : 900);
  const desbordes = await page.$eval(`[id="${id}"]`, (s) => {
    const R = s.getBoundingClientRect();
    const out = (r) => r.right > R.right + 1 || r.bottom > R.bottom + 1;
    // lo recortado por un contenedor (overflow distinto de visible) que cabe en el lienzo no se ve fuera
    const clipped = (e) => { for (let a = e.parentElement; a && a !== s; a = a.parentElement) { const cs = getComputedStyle(a); if ((cs.overflowX !== 'visible' || cs.overflowY !== 'visible') && !out(a.getBoundingClientRect())) return true; } return false; };
    return [...s.querySelectorAll('*')].filter((e) => { const r = e.getBoundingClientRect(); return r.width && out(r) && !clipped(e); })
      .slice(0, 8).map((e) => e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).join('.') : ''));
  });
  const png = await page.screenshot({ ...(archivo ? { path: archivo } : {}), ...(formato === 'jpeg' ? { type: 'jpeg', quality: 78 } : {}) });
  return { png, desbordes, errores: [...page._errores], pasos: { mostrados: n, total } };
}

// Recorre el deck. Devuelve { dir, hallazgos: [{ estilo, modo, id, tipo, msg }], capturas: [ruta] }.
export async function verificar({ deck, estilos = ['suizo', 'noche'], modos = ['light', 'dark'], out = outDir(), paso = 'primero', solo = null, reduced = !!process.env.VERIF_REDUCED, browser = null, url = process.env.MOTOR_URL, log = () => {} } = {}) {
  const { nombre, ruta } = urlDeck(deck);
  const dir = path.join(out, 'capturas', nombre);
  fs.mkdirSync(dir, { recursive: true });
  const srv = url ? null : await servir();
  const base = (url || srv.url).replace(/\/?$/, '/') + ruta;
  const b = browser || await abrirNavegador();
  const hallazgos = [], capturas = [];
  try {
    for (const estilo of estilos) for (const modo of modos) {
      const p = await nuevaPagina(b, { estilo, modo, reduced });
      await p.goto(base);
      const ids = (await p.$$eval('section.slide', (s) => s.map((x) => x.id))).filter((id) => !solo || solo.includes(id));
      for (const id of ids) {
        const archivo = path.join(dir, `${estilo}-${modo}-${id}${paso === 'primero' ? '' : '-p' + paso}.png`);
        const r = await capturar(p, base, id, { paso, reduced, archivo });
        capturas.push(archivo);
        r.errores.forEach((msg) => { hallazgos.push({ estilo, modo, id, tipo: 'error', msg }); log(`[${estilo}/${modo}] ${id}: ${msg}`); });
        if (r.desbordes.length) { const msg = `${r.desbordes.length}+ elementos se salen del lienzo (${r.desbordes.slice(0, 3).join(', ')})`; hallazgos.push({ estilo, modo, id, tipo: 'desborde', msg }); log(`[${estilo}/${modo}] ${id}: ${msg}`); }
      }
      await p.close();
    }
  } finally {
    if (!browser) await b.close();
    if (srv) await srv.close();
  }
  return { dir, hallazgos, capturas };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [deck, list] = positional();
  if (!deck) { console.error('Uso: node tools/verificar.mjs <nombre|ruta> [estilo1,estilo2] [--paso=…] [--solo=id1,id2] [--out=…]'); process.exit(2); }
  const opt = (k) => (process.argv.find((a) => a.startsWith(`--${k}=`)) || '').split('=')[1];
  const r = await verificar({ deck, estilos: (list || 'suizo,noche').split(','), paso: opt('paso') || 'primero', solo: opt('solo') ? opt('solo').split(',') : null, log: console.log });
  console.log(`Capturas en ${r.dir}`);
  // Sale con 1 si hay errores de consola o elementos fuera del lienzo (útil en scripts).
  console.log(r.hallazgos.length ? `${r.hallazgos.length} hallazgos` : 'Sin hallazgos');
  process.exitCode = r.hallazgos.length ? 1 : 0;
}
