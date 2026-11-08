import { chromium } from 'playwright';
const [id, estilo, modo, out] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.addInitScript(([s, m]) => { localStorage.setItem('motor:style', s); localStorage.setItem('motor:mode', m); }, [estilo, modo]);
await p.goto(`http://localhost:8000/atlas/completo/?v=1#${id}`); await p.waitForTimeout(1800);
await p.screenshot({ path: out }); await b.close();
