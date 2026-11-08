import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.addInitScript(() => { localStorage.setItem('motor:style', 'suizo'); localStorage.setItem('motor:mode', 'light'); });
const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
const ok = (n, c, x = '') => console.log(`${c ? '✓' : '✗'} ${n}${x ? ' · ' + x : ''}`);
let bien = 0; const mal = [];
for (const id of ['rice', 'noche', 'suizo', 'aurora', 'cromo', 'arcilla', 'nube', 'termica', 'celula', 'matriz']) {
  await p.goto(`http://localhost:8000/atlas/completo/?r=${Math.random()}#l04-transicion-${id}`); await p.waitForTimeout(1000);
  await p.evaluate(() => { window._vtVista = 0; const o = document.startViewTransition.bind(document); document.startViewTransition = (f) => { window._vtVista++; window._vtEstilo = document.documentElement.dataset.style; return o(f); }; });
  await p.click('section.is-active [data-vt="next"]');
  await p.waitForTimeout(260);
  const medio = await p.evaluate(() => document.querySelector('section.is-active [data-role="pantalla"]').textContent.trim());
  if (['rice', 'cromo', 'celula', 'matriz'].includes(id)) await p.screenshot({ path: `${process.argv[2]}/vt-${id}.png` });
  await p.waitForTimeout(2200);
  const r = await p.evaluate(() => ({ n: window._vtVista, durante: window._vtEstilo, despues: document.documentElement.dataset.style, guardado: localStorage.getItem('motor:style'),
    pant: document.querySelector('section.is-active [data-role="pantalla"]').textContent.trim() }));
  if (r.n === 1 && r.durante === id && r.despues === 'suizo' && r.guardado === 'suizo' && medio === 'B' && r.pant === (id === 'suizo' ? 'B' : 'A')) bien++; else mal.push(`${id}: ${medio} ${JSON.stringify(r)}`);
}
ok('10 transiciones: estilo durante, restaurado después, B durante la animación', bien === 10, mal.join(' | ') || '10/10');
ok('sin errores', !errs.length, errs.join(' | '));
await b.close();
