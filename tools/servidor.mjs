// Servidor estático mínimo de la raíz del repositorio, solo en 127.0.0.1.
// Lo usan verificar.mjs y el servidor MCP para no depender de `python -m http.server`.
// Uso como orden: node tools/servidor.mjs [puerto=8000]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './salida.mjs';

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.avif': 'image/avif', '.mp4': 'video/mp4', '.webm': 'video/webm', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.pdf': 'application/pdf' };

// Devuelve { url, port, close() }. port = 0 elige uno libre.
export function servir({ root = ROOT, port = 0 } = {}) {
  const base = path.resolve(root);
  const srv = http.createServer((req, res) => {
    let rel;
    try { rel = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch { res.writeHead(400).end(); return; }
    let file = path.join(base, path.normalize(rel));
    if (!file.startsWith(base)) { res.writeHead(403).end(); return; }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (rel === '/favicon.ico' && !fs.existsSync(file)) { res.writeHead(204).end(); return; }
    if (!fs.existsSync(file)) { res.writeHead(404).end('No encontrado'); return; }
    const stat = fs.statSync(file), type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
    const range = req.headers.range && /bytes=(\d*)-(\d*)/.exec(req.headers.range);
    if (range) { // vídeos: el navegador pide por trozos
      const a = range[1] ? +range[1] : 0, b = range[2] ? +range[2] : stat.size - 1;
      res.writeHead(206, { 'Content-Type': type, 'Content-Range': `bytes ${a}-${b}/${stat.size}`, 'Accept-Ranges': 'bytes', 'Content-Length': b - a + 1 });
      fs.createReadStream(file, { start: a, end: b }).pipe(res);
      return;
    }
    res.writeHead(200, { 'Content-Type': type, 'Content-Length': stat.size, 'Cache-Control': 'no-store', 'Accept-Ranges': 'bytes' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((ok, ko) => {
    srv.once('error', ko);
    srv.listen(port, '127.0.0.1', () => {
      const p = srv.address().port;
      ok({ url: `http://127.0.0.1:${p}/`, port: p, close: () => new Promise((r) => srv.close(r)) });
    });
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const s = await servir({ port: +(process.argv[2] || 8000) });
  console.log(`Sirviendo ${ROOT} en ${s.url}`);
}
