// Petit serveur local sans dépendance : node serve.mjs  →  http://localhost:4173/
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { exec } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4173);
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp4': 'video/mp4',
};

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const file = path.join(root, p);
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Introuvable'); }
    res.writeHead(200, { 'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  });
});
// Déjà lancée (deuxième double-clic) : on rouvre simplement la page.
server.on('error', (err) => {
  if (err.code !== 'EADDRINUSE') throw err;
  const url = `http://localhost:${port}/`;
  console.log(`La présentation tourne déjà : ${url}`);
  if (!process.env.NO_OPEN && process.platform === 'win32') exec(`start "" "${url}"`);
});
server.listen(port, '127.0.0.1', () => {
  const url = `http://localhost:${port}/`;
  console.log(`Présentation prête : ${url}  (fermer cette fenêtre pour arrêter)`);
  if (!process.env.NO_OPEN && process.platform === 'win32') exec(`start "" "${url}"`);
});
