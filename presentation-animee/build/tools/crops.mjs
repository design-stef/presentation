import { createCanvas, loadImage } from '@napi-rs/canvas';
import fs from 'fs';
const [,, dir, out] = process.argv; const SC = 1.5;
const C = {
 '02': { panel:[150,50,860,960], fold:[1150,320,640,450] },
 '08': { render:[40,280,660,540], sketch1:[700,430,600,420], sketch2:[1300,210,610,610] },
 '14': { render:[740,100,560,590], s1:[100,690,340,240], s2:[560,690,340,240], s3:[1030,690,340,240], s4:[1480,490,350,440] },
 '19': { diagram:[1170,330,680,480] },
 '20': { diagram:[1110,400,770,350] },
 '27': { s1:[50,380,330,290], s2:[415,380,330,290], s3:[780,380,330,290], s4:[1140,380,340,290], s5:[1505,380,365,290] },
};
for (const [p, crops] of Object.entries(C)) {
  const im = await loadImage(`${dir}/full/p${p}.jpg`);
  for (const [n, [x,y,w,h]] of Object.entries(crops)) {
    const c = createCanvas(w*SC, h*SC); c.getContext('2d').drawImage(im, x*SC, y*SC, w*SC, h*SC, 0, 0, w*SC, h*SC);
    fs.writeFileSync(`${out}/p${p}-${n}.jpg`, c.toBuffer('image/jpeg', 88));
  }
}
console.log('ok');
