// Lista diapositivas cuyo contenido (salvo HUD/decoración/fondos) baja de y=940 en el lienzo 1920×1080.
import { chromium } from 'playwright';
const decks = process.argv.slice(2);
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
for (const deck of decks) {
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, reducedMotion: 'reduce' });
  await p.addInitScript(() => { localStorage.setItem('motor:style', 'noche'); localStorage.setItem('motor:mode', 'dark'); });
  const base = `http://localhost:8000/decks/${deck}/`;
  await p.goto(base);
  const ids = await p.$$eval('section.slide', (s) => s.map((x) => x.id));
  const bad = [];
  for (const id of ids) {
    await p.goto(`${base}?v=${id}#${id}`); await p.waitForTimeout(700);
    const y = await p.$eval(`#${id}`, (s) => {
      const R = s.getBoundingClientRect(), k = R.height / 1080;
      let m = 0;
      for (const e of s.querySelectorAll('.s-body *, .s-body, .src, .note')) {
        if (e.closest('.fx-bg, aside.notes, .katex-mathml')) continue;
        const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue;
        if (getComputedStyle(e).visibility === 'hidden') continue;
        m = Math.max(m, (r.bottom - R.top) / k);
      }
      return Math.round(m);
    });
    if (y > 945) bad.push(`${id}:${y}`);
  }
  console.log(deck, bad.length ? bad.join(' ') : 'OK');
  await p.close();
}
await b.close();
