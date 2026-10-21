import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
const [,, src, out, scaleArg] = process.argv;
fs.mkdirSync(out, { recursive: true });
const doc = await pdfjs.getDocument({ data: new Uint8Array(fs.readFileSync(src)), disableFontFace: true }).promise;
console.log('pages', doc.numPages);
let txt = '';
for (let i = 1; i <= doc.numPages; i++) {
  const p = await doc.getPage(i);
  const vp0 = p.getViewport({ scale: 1 });
  const scale = Number(scaleArg || 1);
  const vp = p.getViewport({ scale });
  const c = createCanvas(Math.round(vp.width), Math.round(vp.height));
  await p.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
  fs.writeFileSync(`${out}/p${String(i).padStart(2,'0')}.png`, c.toBuffer('image/png'));
  const tc = await p.getTextContent();
  txt += `\n=== PAGE ${i} (${vp0.width}x${vp0.height}) ===\n` + tc.items.map(t => t.str).join(' ');
}
fs.writeFileSync(`${out}/text.txt`, txt);
