import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
const ok = (n, c, x = '') => console.log(`${c ? '✓' : '✗'} ${n}${x ? ' · ' + x : ''}`);
for (const modo of ['light', 'dark']) {
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.addInitScript((m) => { localStorage.setItem('motor:style', 'suizo'); localStorage.setItem('motor:mode', m); }, modo);
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  let bien = 0, mal = [];
  for (const id of ['rice', 'noche', 'suizo', 'aurora', 'cromo', 'arcilla', 'nube', 'termica', 'celula', 'matriz']) {
    await p.goto(`http://localhost:8000/atlas/completo/?r=${Math.random()}#l03-estilo-${id}`); await p.waitForTimeout(900);
    const r = await p.evaluate((id) => {
      const l = document.querySelector('section.is-active .ac-prev-lienzo'), m = MOTOR_STYLES.find((s) => s.id === id);
      const md = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
      const cs = getComputedStyle(l);
      return { st: l.dataset.style, bg: cs.getPropertyValue('--bg').trim().toLowerCase(), esperado: m.modes[md].roles.bg.toLowerCase(),
        fuente: cs.getPropertyValue('--font-display').split(',')[0].replace(/'/g, '').trim(), esperada: m.fontNames.display };
    }, id);
    if (r.st === id && r.bg === r.esperado && r.fuente === r.esperada) bien++; else mal.push(`${id}: ${JSON.stringify(r)}`);
  }
  ok(`vistas previas ${modo}: --bg y fuente del estilo`, bien === 10, mal.join(' | ') || `${bien}/10`);
  await p.goto(`http://localhost:8000/atlas/completo/?r=1#l03-meta-estilos`); await p.waitForTimeout(800);
  const solapa = await p.evaluate(() => { const d = document.querySelector('section.is-active .ac-meta').getBoundingClientRect(), a = document.querySelector('section.is-active .ac-info').getBoundingClientRect(); return [...document.querySelectorAll('section.is-active .ac-meta > *')].some((e) => e.getBoundingClientRect().right > a.left); });
  ok(`metadatos ${modo}: no invade la ficha`, !solapa);
  ok(`sin errores ${modo}`, !errs.length, errs.join(' | '));
  await p.close();
}
await b.close();
