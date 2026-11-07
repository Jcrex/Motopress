// Recorre el Atlas Completo de principio a fin pulsando → (cada paso y cada diapositiva) y recoge
// los errores de consola y de página con el id de la diapositiva activa. Sale con código 1 si hay errores.
// Uso: node planning/atlas/recorrer.mjs [--estilos=suizo,noche] [--modos=light,dark] [--desde=<id>] [--hasta=<id>]
//        [--deck=atlas/completo] [--espera=650] [--reducido]
// Con el servidor en :8000 (python3 -m http.server 8000 desde la raíz). CHROMIUM_PATH=/ruta/chrome usa un navegador instalado.
import { chromium } from 'playwright';

const opt = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => {
  const [k, v] = a.slice(2).split('='); return [k, v ?? true];
}));
const estilos = String(opt.estilos || 'suizo,noche').split(',');
const modos = String(opt.modos || 'light,dark').split(',');
const deck = String(opt.deck || 'atlas/completo').replace(/^\/|\/$/g, '');
const espera = +(opt.espera || 650);
const base = `http://localhost:8000/${deck}/`;

const b = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const errores = [];
let visitadas = 0;
for (const estilo of estilos) for (const modo of modos) {
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, ...(opt.reducido ? { reducedMotion: 'reduce' } : {}) });
  await p.addInitScript(([s, m]) => { localStorage.setItem('motor:style', s); localStorage.setItem('motor:mode', m); }, [estilo, modo]);
  const activa = () => p.evaluate(() => {
    const s = document.querySelector('section.slide.is-active');
    return s ? { id: s.id, on: s.querySelectorAll('[data-step].on').length, steps: s.querySelectorAll('[data-step]').length } : null;
  }).catch(() => null);
  let actual = '(carga)';
  // la diapositiva activa se pide a la página en el momento del error (la de «actual» puede ir un paso por detrás)
  const anota = async (tipo, texto) => { const a = await activa(); errores.push({ estilo, modo, id: a ? a.id : actual, tipo, texto }); };
  p.on('console', (m) => m.type() === 'error' && anota('consola', m.text()));
  p.on('pageerror', (e) => anota('página', e.message));
  p.on('response', (r) => r.status() >= 400 && anota('red', `${r.status()} ${r.url()}`));
  await p.goto(base + (opt.desde ? '#' + opt.desde : ''));
  await p.waitForTimeout(1500);
  const vistas = new Set();
  let antes = null, quietas = 0;
  for (let i = 0; i < 5000; i++) {
    const a = await activa();
    if (!a) { anota('motor', 'no hay diapositiva activa'); break; }
    actual = a.id; vistas.add(a.id);
    if (opt.hasta && a.id === opt.hasta && a.on === a.steps) break;
    const firma = `${a.id}:${a.on}`;
    if (firma === antes) { if (++quietas >= 2) break; } else quietas = 0; // dos pulsaciones sin cambio: final
    antes = firma;
    await p.keyboard.press('ArrowRight');
    await p.waitForTimeout(espera);
  }
  visitadas = Math.max(visitadas, vistas.size);
  console.log(`[${estilo}/${modo}] ${vistas.size} diapositivas, última: ${actual}`);
  await p.close();
}
await new Promise((r) => setTimeout(r, 50));
await b.close();
for (const e of errores) console.log(`  ✗ [${e.estilo}/${e.modo}] ${e.id} · ${e.tipo}: ${e.texto}`);
console.log(errores.length ? `${errores.length} errores` : 'sin errores');
process.exit(errores.length ? 1 : 0);
