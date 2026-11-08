import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, args: ['--disable-webgl', '--disable-webgl2', '--disable-3d-apis'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
await p.goto('http://localhost:8000/atlas/completo/#l02-motor-gl'); await p.waitForTimeout(1500);
console.log(await p.$eval('section.is-active [data-role="estado"]', (e) => e.textContent), '· errores:', errs);
await p.screenshot({ path: process.argv[2] }); await b.close();
