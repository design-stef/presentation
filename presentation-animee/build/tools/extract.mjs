import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from '@napi-rs/canvas';
import fs from 'fs';
const [,, src, out, S = '1.5'] = process.argv;
const SC = Number(S);
fs.mkdirSync(out + '/full', { recursive: true });
const doc = await pdfjs.getDocument({ data: new Uint8Array(fs.readFileSync(src)) }).promise;
const O = pdfjs.OPS;
const mul = (m, n) => [m[0]*n[0]+m[2]*n[1], m[1]*n[0]+m[3]*n[1], m[0]*n[2]+m[2]*n[3], m[1]*n[2]+m[3]*n[3], m[0]*n[4]+m[2]*n[5]+m[4], m[1]*n[4]+m[3]*n[5]+m[5]];
const bbox = (m, x0, y0, x1, y1) => { const pts = [[x0,y0],[x1,y0],[x0,y1],[x1,y1]].map(([x,y]) => [m[0]*x+m[2]*y+m[4], m[1]*x+m[3]*y+m[5]]); const xs = pts.map(p=>p[0]), ys = pts.map(p=>p[1]); return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; };
const inter = (a, b) => [Math.max(a[0],b[0]), Math.max(a[1],b[1]), Math.min(a[2],b[2]), Math.min(a[3],b[3])];
const result = {};
for (let i = 1; i <= doc.numPages; i++) {
  const p = await doc.getPage(i);
  const vp1 = p.getViewport({ scale: 1 });
  const W = vp1.width, H = vp1.height;
  const ol = await p.getOperatorList();
  let ctm = [1,0,0,1,0,0], clip = [0,0,W,H], stack = [], pendingClip = null, lastPath = null;
  const imgs = [];
  for (let k = 0; k < ol.fnArray.length; k++) {
    const f = ol.fnArray[k], a = ol.argsArray[k];
    if (f === O.save) stack.push([ctm, clip]);
    else if (f === O.restore) { [ctm, clip] = stack.pop() || [ctm, clip]; }
    else if (f === O.transform) ctm = mul(ctm, a);
    else if (f === O.constructPath) { const mm = a[2]; lastPath = mm ? bbox(ctm, mm[0], mm[1], mm[2], mm[3]) : null; }
    else if (f === O.clip || f === O.eoClip) pendingClip = lastPath;
    else if (f === O.endPath) { if (pendingClip) clip = inter(clip, pendingClip); pendingClip = null; }
    else if (f === O.paintImageXObject || f === O.paintInlineImageXObject) {
      const r = inter(bbox(ctm, 0, 0, 1, 1), clip);
      if (r[2] - r[0] > 4 && r[3] - r[1] > 4) imgs.push(r);
    }
  }
  const vp = p.getViewport({ scale: SC });
  const c = createCanvas(Math.round(vp.width), Math.round(vp.height));
  const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0,0,c.width,c.height);
  await p.render({ canvasContext: g, viewport: vp }).promise;
  const n = String(i).padStart(2, '0');
  fs.writeFileSync(`${out}/full/p${n}.jpg`, c.toBuffer('image/jpeg', 90));
  result[n] = imgs.map((r, j) => {
    // PDF y-up -> top-left origin, rounded to px in 1920x1080 space
    const x = Math.round(r[0]), y = Math.round(H - r[3]), w = Math.round(r[2] - r[0]), h = Math.round(r[3] - r[1]);
    const cc = createCanvas(Math.round(w*SC), Math.round(h*SC));
    cc.getContext('2d').drawImage(c, x*SC, y*SC, w*SC, h*SC, 0, 0, cc.width, cc.height);
    const name = `p${n}-${String.fromCharCode(97+j)}.jpg`;
    fs.writeFileSync(`${out}/${name}`, cc.toBuffer('image/jpeg', 86));
    return { name, x, y, w, h };
  });
}
fs.writeFileSync(`${out}/layout.json`, JSON.stringify(result, null, 1));
console.log(JSON.stringify(result));
