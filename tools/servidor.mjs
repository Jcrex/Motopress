// Servidor estático mínimo de la raíz del repositorio, solo en 127.0.0.1.
// Lo usan verificar.mjs y el servidor MCP para no depender de `python -m http.server`.
// Uso como orden: node tools/servidor.mjs [puerto=8000]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT } from './salida.mjs';

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.avif': 'image/avif', '.mp4': 'video/mp4', '.webm': 'video/webm', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.pdf': 'application/pdf' };

// Nunca se sirven archivos ocultos (.git, .mcp.json…) ni bases de datos de planning/.
// También sus copias (atlas.db.bak, atlas.db-journal, atlas.sqlite3.old…).
const PRIVADO = (rel) => rel.split('/').some((seg) => seg.startsWith('.')) || /\.(?:db|sqlite\d?)(?:[-.]\w+)*$/i.test(rel);

// Devuelve { url, port, close() }. port = 0 elige uno libre.
export function servir({ root = ROOT, port = 0 } = {}) {
  const base = path.resolve(root);
  let hosts = new Set();
  const srv = http.createServer((req, res) => {
    // Solo peticiones dirigidas a este servidor local (evita que otra web lea el repo con un DNS a 127.0.0.1).
    if (!hosts.has(String(req.headers.host || '').toLowerCase())) { res.writeHead(403).end('Host no permitido'); return; }
    let rel;
    try { rel = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch { res.writeHead(400).end(); return; }
    if (PRIVADO(rel)) { res.writeHead(404).end('No encontrado'); return; }
    let file = path.join(base, path.normalize(rel));
    if (file !== base && !file.startsWith(base + path.sep)) { res.writeHead(403).end(); return; }
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, { Allow: 'GET, HEAD' }).end(); return; }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    // Un enlace simbólico que sale de la raíz no se sigue.
    if (fs.existsSync(file)) {
      const real = fs.realpathSync(file), baseReal = fs.realpathSync(base);
      if (real !== baseReal && !real.startsWith(baseReal + path.sep)) { res.writeHead(404).end('No encontrado'); return; }
    }
    if (rel === '/favicon.ico' && !fs.existsSync(file)) { res.writeHead(204).end(); return; }
    if (!fs.existsSync(file)) { res.writeHead(404).end('No encontrado'); return; }
    const stat = fs.statSync(file), type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
    const send = (opts) => fs.createReadStream(file, opts).on('error', () => res.destroy()).pipe(res);
    const range = req.headers.range && /^bytes=(\d*)-(\d*)$/.exec(req.headers.range.trim());
    if (range && (range[1] || range[2])) { // vídeos: el navegador pide por trozos
      let a, b;
      if (!range[1]) { a = Math.max(0, stat.size - +range[2]); b = stat.size - 1; } // bytes=-N: los últimos N
      else { a = +range[1]; b = range[2] ? Math.min(+range[2], stat.size - 1) : stat.size - 1; }
      if (a > b || a >= stat.size) { res.writeHead(416, { 'Content-Range': `bytes */${stat.size}` }).end(); return; }
      res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${a}-${b}/${stat.size}`, 'Accept-Ranges': 'bytes', 'Content-Length': b - a + 1 });
      send({ start: a, end: b });
      return;
    }
    res.writeHead(200, { 'Content-Type': type, 'Content-Length': stat.size, 'Cache-Control': 'no-store', 'Accept-Ranges': 'bytes' });
    send();
  });
  return new Promise((ok, ko) => {
    srv.once('error', ko);
    srv.listen(port, '127.0.0.1', () => {
      const p = srv.address().port;
      hosts = new Set([`127.0.0.1:${p}`, `localhost:${p}`]);
      ok({ url: `http://127.0.0.1:${p}/`, port: p, close: () => new Promise((r) => srv.close(r)) });
    });
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const s = await servir({ port: +(process.argv[2] || 8000) });
  console.log(`Sirviendo ${ROOT} en ${s.url}`);
}
