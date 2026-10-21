// Draws an image (placed in slide coordinates) with a labelled 100px grid, so object positions can be read off.
// Usage: node measure.mjs <out.png> <img> <x> <y> <w> <h> [view x y w h]
import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'fs';
const [,, out, src, X, Y, W, H, vx = 0, vy = 0, vw = 1920, vh = 1080] = process.argv;
const [x, y, w, h] = [X, Y, W, H].map(Number);
const view = [vx, vy, vw, vh].map(Number);
const S = 1000 / view[2];
const c = createCanvas(1000, Math.round(view[3] * S));
const g = c.getContext('2d');
g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
const im = await loadImage(src);
g.drawImage(im, (x - view[0]) * S, (y - view[1]) * S, w * S, h * S);
const SEG = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };
function digit(d, px, py, s) {
  const L = { a: [0, 0, 1, 0], b: [1, 0, 1, 1], c: [1, 1, 1, 2], d: [0, 2, 1, 2], e: [0, 1, 0, 2], f: [0, 0, 0, 1], g: [0, 1, 1, 1] };
  for (const k of SEG[d]) { const [a, b, cc, dd] = L[k]; g.beginPath(); g.moveTo(px + a * s, py + b * s); g.lineTo(px + cc * s, py + dd * s); g.stroke(); }
}
function num(n, px, py) {
  const s = String(n); g.lineWidth = 2;
  for (let i = 0; i < s.length; i++) digit(Number(s[i]), px + i * 9, py, 6);
}
for (let gx = Math.ceil(view[0] / 50) * 50; gx <= view[0] + view[2]; gx += 50) {
  const px = (gx - view[0]) * S;
  g.strokeStyle = gx % 100 === 0 ? 'rgba(255,0,0,0.55)' : 'rgba(255,0,0,0.18)'; g.lineWidth = 1;
  g.beginPath(); g.moveTo(px, 0); g.lineTo(px, c.height); g.stroke();
  if (gx % 100 === 0) { g.strokeStyle = '#d00'; num(gx, px + 2, 2); }
}
for (let gy = Math.ceil(view[1] / 50) * 50; gy <= view[1] + view[3]; gy += 50) {
  const py = (gy - view[1]) * S;
  g.strokeStyle = gy % 100 === 0 ? 'rgba(0,0,255,0.55)' : 'rgba(0,0,255,0.18)'; g.lineWidth = 1;
  g.beginPath(); g.moveTo(0, py); g.lineTo(c.width, py); g.stroke();
  if (gy % 100 === 0) { g.strokeStyle = '#00d'; num(gy, 2, py + 2); }
}
fs.writeFileSync(out, c.toBuffer('image/png'));
