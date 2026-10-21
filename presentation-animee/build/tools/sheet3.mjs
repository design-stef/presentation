import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'fs';
const dir = process.argv[2];
const only = process.argv.slice(3);
let files = fs.readdirSync(dir).filter(f => /^s\d+\.png$/.test(f)).sort();
if (only.length) files = files.filter(f => only.includes(f.slice(1, 3)));
const per = 6, cols = 2, tw = 960, th = 540;
for (let s = 0; s * per < files.length; s++) {
  const batch = files.slice(s * per, s * per + per);
  const rows = Math.ceil(batch.length / cols);
  const c = createCanvas(cols * tw + 10, rows * (th + 10));
  const g = c.getContext('2d'); g.fillStyle = '#f0f'; g.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < batch.length; i++) {
    const im = await loadImage(`${dir}/${batch[i]}`);
    g.drawImage(im, (i % cols) * (tw + 10), Math.floor(i / cols) * (th + 10), tw, th);
  }
  fs.writeFileSync(`${dir}/csheet${s + 1}.png`, c.toBuffer('image/png'));
}
console.log(files.join(' '));
