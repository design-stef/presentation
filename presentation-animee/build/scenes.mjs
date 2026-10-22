// Gabarits HTML des scènes. Chaque fonction reçoit l'entrée de slides.mjs et des outils, et renvoie
// le contenu de la scène ; les animations correspondantes sont dans choreo.js.
// Mise en page : les images occupent la « scène » (1920 × 940) ; la légende vit dans le bandeau
// blanc du bas (940 → 1080), jamais sur une photo.

export const STAGE_W = 1920;
export const STAGE_H = 940;

// Placement d'une image qui couvre un cadre pw × ph, la zone (fx, fy) de l'image (0 à 1) centrée.
export function place(K, src, pw, ph, fx = 0.5, fy = 0.5, zoom = 1) {
  const [iw, ih] = K.size(src);
  const s = Math.max(pw / iw, ph / ih) * zoom;
  const w = iw * s, h = ih * s;
  const left = Math.min(0, Math.max(pw - w, pw / 2 - fx * w));
  const top = Math.min(0, Math.max(ph - h, ph / 2 - fy * h));
  return { s, w, h, left, top };
}
// Placement par fenêtre : la portion de l'image qui commence en (ix, iy) et fait iw de large remplit le cadre.
export function windowed(K, src, pw, ph, ix, iy, iw) {
  const [W, H] = K.size(src);
  const s = pw / iw;
  return { s, w: W * s, h: H * s, left: -ix * s, top: Math.max(ph - H * s, -iy * s) };
}
const f1 = (v) => v.toFixed(1);
export function img(src, p, cls = '') {
  return `<img class="${cls}" src="assets/img/${src}" alt="" style="position:absolute;left:${f1(p.left)}px;top:${f1(p.top)}px;width:${f1(p.w)}px;height:${f1(p.h)}px" />`;
}
// Même chose en image de fond (pour les découpages en bandes : évite de multiplier les <img>).
function bg(src, p, dx = 0, dy = 0) {
  return `background-image:url('assets/img/${src}');background-size:${f1(p.w)}px ${f1(p.h)}px;background-position:${f1(p.left - dx)}px ${f1(p.top - dy)}px`;
}
const box = (x, y, w, h) => `left:${x}px;top:${y}px;width:${w}px;height:${h}px`;
function frame(src, x, y, w, h, p, cls = '') {
  return `<figure class="ph ${cls}" style="${box(x, y, w, h)}">${img(src, p)}</figure>`;
}
// Bandes verticales ou horizontales d'une même image (lattes, planches…).
function strips(src, p, w, h, n, dir, cls = 'strip') {
  let out = '';
  for (let k = 0; k < n; k++) {
    if (dir === 'v') {
      const x0 = Math.round(k * w / n), x1 = Math.round((k + 1) * w / n);
      out += `<i class="${cls}" data-k="${k}" style="${box(x0, 0, x1 - x0, h)};${bg(src, p, x0, 0)}"></i>`;
    } else {
      const y0 = Math.round(k * h / n), y1 = Math.round((k + 1) * h / n);
      out += `<i class="${cls}" data-k="${k}" style="${box(0, y0, w, y1 - y0)};${bg(src, p, 0, y0)}"></i>`;
    }
  }
  return out;
}
// Coins de cadrage (dessin technique) autour d'un rectangle.
export function brackets(x, y, w, h, len = 36) {
  const p = (d) => `<path class="brk" d="${d}" />`;
  return [
    p(`M${x} ${y + len}V${y}H${x + len}`),
    p(`M${x + w - len} ${y}H${x + w}V${y + len}`),
    p(`M${x + w} ${y + h - len}V${y + h}H${x + w - len}`),
    p(`M${x + len} ${y + h}H${x}V${y + h - len}`),
  ].join('');
}
// Ligne de cote sans chiffre : trait + deux talons.
function dim(x1, y1, x2, y2, tick = 18) {
  const horiz = Math.abs(y2 - y1) < Math.abs(x2 - x1);
  const t = horiz
    ? `M${x1} ${y1 - tick}V${y1 + tick}M${x2} ${y2 - tick}V${y2 + tick}`
    : `M${x1 - tick} ${y1}H${x1 + tick}M${x2 - tick} ${y2}H${x2 + tick}`;
  return `<path class="dim-tick" d="${t}" /><path class="dim-line" d="M${x1} ${y1}L${x2} ${y2}" />`;
}
const svg = (inner, cls = '') => `<svg class="ov ${cls}" viewBox="0 0 1920 940" aria-hidden="true">${inner}</svg>`;

export const html = {
  // 1. Couverture : montage de projets dans un cadre, compteur 2008 → 2026, puis titre.
  cover(s, i, K) {
    const montage = ['p03-a.jpg', 'p06-a.jpg', 'p09-a.jpg', 'p07-b.jpg', 'p10-a.jpg', 'p13-a.jpg', 'p15-a.jpg',
      'p16-a.jpg', 'p22-c.jpg', 'p05-a.jpg', 'p26-b.jpg', 'p24-a.jpg'];
    const FW = 1180, FH = 664;
    return `
      <div class="cover cam" data-layout-allow-overlap>
        <div class="mframe" style="${box(96, 140, FW, FH)}">${montage.map((m, k) => `<div class="mt" data-k="${k}">${img(m, place(K, m, FW, FH, 0.5, 0.6))}</div>`).join('')}</div>
        <p class="wordmark">Chapelet.</p>
        <svg class="cover-line" viewBox="0 0 1920 1080" aria-hidden="true"><line x1="881" y1="792" x2="1253" y2="377" /></svg>
        <p class="y0">2008–</p>
        <p class="count">2008</p>
        <p class="byline">${K.words('Stéphane Chapelet, designer')}</p>
        <h1 class="cover-title"><span class="mask"><span class="rise">Mobilier</span></span> <span class="mask"><span class="rise">urbain</span></span></h1>
      </div>`;
  },

  // 2. Crossed : la tôle découpée se plie en vraie 3D le long de ses cinq lignes de pliage.
  'crossed-principe'(s, i, K) {
    // Le panneau (720 × 921) dans l'image p02-panel.jpg commence en (45, 22). Lignes de pliage à 43, 200, 340, 535, 875.
    const P = { w: 860, h: 960, left: -45, top: -22 };
    const strip = (cls, top, h, inner = '', num = '') =>
      `<div class="f3 ${cls}" style="height:${h}px;${bg('p02-panel.jpg', P, 0, top)}">${num ? `<b class="fnum">${num}</b>` : ''}${inner}</div>`;
    // chaîne vers le haut à partir du grand dos (s4) : s3, s2, s1, s0 ; vers le bas : s5
    const up = strip('up s3', 340, 195, strip('up s2', 200, 140, strip('up s1', 43, 157, strip('up s0', 0, 43, '', '1'), '2'), '3'), '4');
    const down = strip('down s5', 875, 46, '', '5');
    return `
      <div class="stage">
        <div class="f3-scene">
          <div class="f3-cam">
            <div class="f3-flat">${img('p02-plate.jpg', P)}
              <div class="f3-cut">${img('p02-panel.jpg', P)}</div>
              <i class="cut-head"></i>${Array.from({ length: 22 }, (_, k) => `<i class="spark" data-k="${k}"></i>`).join('')}
            </div>
            <div class="f3 root s4" style="top:535px;height:340px;${bg('p02-panel.jpg', P, 0, 535)}">${up}${down}</div>
          </div>
        </div>
        <p class="fold-count"><span class="mask"><span class="fc-strip">${[1, 2, 3, 4, 5].map((n) => `<span>${n}</span>`).join('')}</span></span><span class="fc-tot">/5</span></p>
      </div>
      ${K.caption(s, i)}`;
  },

  // 3. Crossed de nuit : la photo se recompose en lattes verticales, puis cadrage du banc.
  'crossed-nuit'(s, i, K) {
    const p = place(K, 'p03-a.jpg', 1920, 940, 0.5, 0.62);
    return `
      <div class="stage"><div class="cam">${strips('p03-a.jpg', p, 1920, 940, 12, 'v')}
        ${svg(brackets(530, 270, 1080, 590), 'bk')}</div></div>
      ${K.caption(s, i)}`;
  },

  // 4. La famille Crossed : Barcelone et Capri en entier (format paysage), la corbeille en colonne.
  'crossed-famille'(s, i, K) {
    // les deux photos paysage sont montrées presque entières (fenêtre sans la bande de droite, qui contient la corbeille)
    const land = (src) => { const p = windowed(K, src, 1270, 465, 0, 0, 1195); p.top = 465 - p.h; return p; };
    return `
      <div class="stage">
        <div class="pn" data-k="0" style="${box(0, 0, 1270, 465)}"><div class="pn-in">${img('p04-b.jpg', land('p04-b.jpg'))}</div></div>
        <div class="pn" data-k="1" style="${box(0, 475, 1270, 465)}"><div class="pn-in">${img('p04-a.jpg', land('p04-a.jpg'))}</div></div>
        <div class="pn" data-k="2" style="${box(1280, 0, 640, 940)}"><div class="pn-in">${img('p04-c.jpg', place(K, 'p04-c.jpg', 640, 940, 0.5, 0.6))}</div></div>
      </div>
      ${K.caption(s, i)}`;
  },

  // 5. Hilton : travelling du banc à la jardinière, puis vue d'ensemble.
  hilton(s, i, K) {
    const a = windowed(K, 'p05-a.jpg', 940, 940, 0, 120, 960);
    const b = windowed(K, 'p05-b.jpg', 970, 465, 0, 60, 960);
    const c = place(K, 'p05-c.jpg', 970, 465);
    return `
      <div class="stage"><div class="world">
        ${frame('p05-a.jpg', 0, 0, 940, 940, a)}
        ${frame('p05-b.jpg', 950, 0, 970, 465, b)}
        ${frame('p05-c.jpg', 950, 475, 970, 465, c)}
        ${svg(`<g class="bk-a">${brackets(45, 415, 560, 250)}</g><g class="bk-b">${brackets(1180, 45, 370, 330)}</g>`)}
      </div></div>
      ${K.caption(s, i)}`;
  },

  // 6. Zadig : la photo apparaît à travers une trame de perforations.
  zadig(s, i, K) {
    const p = place(K, 'p06-a.jpg', 1920, 940, 0.5, 0.62);
    let circles = '';
    for (let y = 0; y <= 940 + 30; y += 60) for (let x = 0; x <= 1920 + 30; x += 60) circles += `<circle cx="${x}" cy="${y}" r="0" />`;
    return `
      <div class="stage"><div class="cam">
        <svg class="perf" viewBox="0 0 1920 940" aria-hidden="true">
          <defs><mask id="perf-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1920" height="940"><rect width="1920" height="940" fill="#000" /><g fill="#fff">${circles}</g></mask></defs>
          <image href="assets/img/p06-a.jpg" x="${f1(p.left)}" y="${f1(p.top)}" width="${f1(p.w)}" height="${f1(p.h)}" preserveAspectRatio="none" mask="url(#perf-mask)" />
        </svg>
      </div></div>
      ${K.caption(s, i)}`;
  },

  // 7. Zadig à Bergen et Milan : le détail perforé, en gros plan, rejoint sa place.
  'zadig-lieux'(s, i, K) {
    return `
      <div class="stage">
        ${frame('p07-b.jpg', 0, 0, 1100, 940, place(K, 'p07-b.jpg', 1100, 940), 'museum')}
        ${frame('p07-c.jpg', 1110, 0, 810, 465, place(K, 'p07-c.jpg', 810, 465), 'milan')}
        ${frame('p07-a.jpg', 1110, 475, 810, 465, place(K, 'p07-a.jpg', 810, 465, 0.5, 0.55), 'detail')}
      </div>
      ${K.caption(s, i)}`;
  },

  // 8. Du croquis au banc : les croquis se tracent, puis le banc s'assemble latte par latte.
  croquis(s, i, K) {
    const r = { s: 1, w: 660, h: 540, left: 0, top: 0 };
    return `
      <div class="stage">
        ${frame('p08-sketch2.jpg', 1280, 120, 610, 610, { w: 610, h: 610, left: 0, top: 0 }, 'sk2')}
        ${frame('p08-sketch1.jpg', 680, 330, 600, 420, { w: 600, h: 420, left: 0, top: 0 }, 'sk1')}
        <div class="slats" style="${box(30, 170, 660, 540)}">${strips('p08-render.jpg', r, 660, 540, 14, 'h', 'slat')}</div>
      </div>
      ${K.caption(s, i)}`;
  },

  // 9. Alassio : panoramique sur le front de mer, la photo du parc monte en colonne.
  alassio(s, i, K) {
    return `
      <div class="stage">
        ${frame('p09-a.jpg', 0, 0, 1290, 940, place(K, 'p09-a.jpg', 1290, 940, 0.5, 0.55, 1.08), 'sea')}
        ${frame('p09-b.jpg', 1300, 0, 620, 940, place(K, 'p09-b.jpg', 620, 940, 0.5, 0.6), 'park')}
      </div>
      ${K.caption(s, i)}`;
  },

  // 10. Emme à Monte-Carlo : la caméra avance sur la promenade ; à droite, deux vues d'ensemble
  // de la digue tirées de la vidéo du projet.
  'emme-monaco'(s, i, K) {
    const a = windowed(K, 'p10-a.jpg', 1100, 940, 0, 10, 1150);
    return `
      <div class="stage">
        <figure class="ph walk" style="${box(0, 0, 1100, 940)}"><div class="cam">${img('p10-a.jpg', a)}
          ${svg(brackets(520, 540, 265, 315), 'bk')}</div></figure>
        ${frame('p10-v44.jpg', 1110, 0, 810, 465, place(K, 'p10-v44.jpg', 810, 465, 0.5, 0.55, 1.06), 'view view-a')}
        ${frame('p10-v52.jpg', 1110, 475, 810, 465, place(K, 'p10-v52.jpg', 810, 465, 0.45, 0.5, 1.06), 'view view-b')}
      </div>
      ${K.caption(s, i)}`;
  },

  // 11. Variations : le banc circulaire se dévoile en tournant, la composition en S arrive.
  variations(s, i, K) {
    return `
      <div class="stage">
        ${frame('p11-a.jpg', 40, 0, 1002, 940, place(K, 'p11-a.jpg', 1002, 940), 'ring')}
        ${frame('p11-b.jpg', 1120, 150, 760, 660, place(K, 'p11-b.jpg', 760, 660), 'snake')}
      </div>
      ${K.caption(s, i)}`;
  },

  // 12. Variations, esquisse : l'esquisse se trace, la caméra s'approche du dossier.
  'variations-detail'(s, i, K) {
    return `
      <div class="stage">
        ${frame('p12-b.jpg', 30, 40, 1092, 842, place(K, 'p12-b.jpg', 1092, 842), 'sketch')}
        <figure class="ph back" style="${box(1170, 0, 750, 940)}"><div class="cam">${img('p12-a.jpg', place(K, 'p12-a.jpg', 750, 940, 0.5, 0.4))}</div></figure>
      </div>
      ${K.caption(s, i)}`;
  },

  // 13. Variations à Paris : la place de nuit, plein cadre, rejoint sa place ; les bancs s'ouvrent en cercle.
  'variations-paris'(s, i, K) {
    return `
      <div class="stage">
        <figure class="ph ground" style="${box(0, 0, 950, 940)}">${img('p13-a.jpg', windowed(K, 'p13-a.jpg', 950, 940, 60, 0, 1003))}</figure>
        <figure class="ph aerial" style="${box(960, 0, 960, 940)}"><div class="cam">${img('p13-nuit.jpg', place(K, 'p13-nuit.jpg', 960, 940, 0.5, 0.6))}</div></figure>
      </div>
      ${K.caption(s, i)}`;
  },

  // 14. Emme, moulage : le rendu monte, puis les quatre temps du moule, chacun avec son geste.
  'emme-moule'(s, i, K) {
    const one = (n, x, y, w, h) => `<figure class="ph step step${n}" style="${box(x, y, w, h)}"><img src="assets/img/p14-s${n}.jpg" alt="" style="position:absolute;inset:0;width:100%;height:100%" /></figure>`;
    const arrow = (x1, x2, y) => `<path class="arw" d="M${x1} ${y}H${x2}M${x2 - 14} ${y - 10}L${x2} ${y}L${x2 - 14} ${y + 10}" />`;
    return `
      <div class="stage">
        <figure class="ph render" style="${box(700, 10, 532, 560)}"><img src="assets/img/p14-render.jpg" alt="" style="position:absolute;inset:0;width:100%;height:100%" /></figure>
        ${one(1, 80, 640, 340, 240)}${one(2, 540, 640, 340, 240)}${one(3, 1000, 640, 340, 240)}${one(4, 1470, 450, 350, 440)}
        ${svg(arrow(440, 520, 760) + arrow(900, 980, 760) + arrow(1360, 1450, 760), 'arrows')}
      </div>
      ${K.caption(s, i)}`;
  },

  // 15. Les moules : la photo se recompose en planches, puis travelling.
  moules(s, i, K) {
    const p = place(K, 'p15-a.jpg', 1920, 940, 0.5, 0.5, 1.04);
    return `
      <div class="stage"><div class="cam">${strips('p15-a.jpg', p, 1920, 940, 9, 'h', 'plank')}</div></div>
      ${K.caption(s, i)}`;
  },

  // 16. Emme à Djeddah : survol de la corniche, puis la photo des bancs.
  'emme-djeddah'(s, i, K) {
    return `
      <div class="stage">
        <figure class="ph ground" style="${box(0, 0, 1290, 940)}">${img('p16-a.jpg', place(K, 'p16-a.jpg', 1290, 940, 0.5, 0.55))}</figure>
        <div class="aer"><img src="assets/img/p16-b.jpg" alt="" /></div>
      </div>
      ${K.caption(s, i)}`;
  },

  // 17. Banc béton et bois : mise au point, puis traits de cote.
  'beton-bois'(s, i, K) {
    return `
      <div class="stage"><div class="cam">${img('p17-a.jpg', place(K, 'p17-a.jpg', 1920, 940), 'focus')}
        ${svg(`<g class="bk">${brackets(345, 432, 1355, 432)}</g>${dim(361, 904, 1682, 904)}${dim(1752, 448, 1752, 848)}`, 'tech tech--ink')}</div></div>
      ${K.caption(s, i)}`;
  },

  // 18. Banc acier et béton : travelling latéral, puis contour et cote.
  'acier-beton'(s, i, K) {
    return `
      <div class="stage"><div class="cam">${img('p18-a.jpg', place(K, 'p18-a.jpg', 1920, 940))}
        ${svg(`<g class="bk">${brackets(600, 384, 1054, 494)}</g>${dim(618, 344, 1636, 344)}`, 'tech')}</div></div>
      ${K.caption(s, i)}`;
  },

  // 19. Ligne : la photo monte, le schéma du profil se trace.
  ligne(s, i, K) {
    return `
      <div class="stage">
        <figure class="ph photo" style="${box(0, 0, 900, 940)}"><div class="cam">${img('p19-a.jpg', place(K, 'p19-a.jpg', 900, 940, 0.5, 0.55))}</div></figure>
        <figure class="ph diagram" style="${box(1060, 220, 680, 480)}"><img src="assets/img/p19-diagram.jpg" alt="" style="position:absolute;inset:0;width:100%;height:100%" /></figure>
      </div>
      ${K.caption(s, i)}`;
  },

  // 20. Banc monolithe : la photo glisse, le schéma et ses flèches se tracent.
  monolithe(s, i, K) {
    return `
      <div class="stage">
        <figure class="ph photo" style="${box(0, 0, 1040, 940)}"><div class="cam">${img('p20-a.jpg', place(K, 'p20-a.jpg', 1040, 940, 0.5, 0.8))}</div></figure>
        <figure class="ph diagram" style="${box(1100, 300, 770, 350)}"><img src="assets/img/p20-diagram.jpg" alt="" style="position:absolute;inset:0;width:100%;height:100%" /></figure>
      </div>
      ${K.caption(s, i)}`;
  },

  // 21. Banc et jardinières : les objets sont posés un à un.
  blanc(s, i, K) {
    const b = { w: 1020, h: 729, left: 0, top: 0 };
    const a = { w: 945, h: 571, left: 0, top: 0 };
    return `
      <div class="stage">
        <div class="obj" style="${box(10, 110, 1020, 729)};${bg('p21-b.jpg', b)}"></div>
        <div class="obj" style="${box(960, 260, 520, 571)};${bg('p21-a.jpg', a)}"></div>
        <div class="obj" style="${box(1480, 260, 425, 571)};${bg('p21-a.jpg', a, 520, 0)}"></div>
      </div>
      ${K.caption(s, i)}`;
  },

  // 22. Monaco : du port au crépuscule vers le banc et la jardinière.
  fontvieille(s, i, K) {
    return `
      <div class="stage">
        ${frame('p22-a.jpg', 0, 475, 950, 465, place(K, 'p22-a.jpg', 950, 465), 'harbour')}
        ${frame('p22-c.jpg', 960, 0, 960, 940, place(K, 'p22-c.jpg', 960, 940, 0.5, 0.55), 'planter')}
        ${frame('p22-b.jpg', 0, 0, 950, 465, place(K, 'p22-b.jpg', 950, 465), 'dusk')}
      </div>
      ${K.caption(s, i)}`;
  },

  // 23. KJ : axes de construction, puis le luminaire se dévoile le long de sa tête.
  kj(s, i, K) {
    return `
      <div class="stage"><div class="cam">
        <figure class="ph lamp" style="${box(206, 0, 1507, 940)}"><img src="assets/img/p23-a.jpg" alt="" style="position:absolute;inset:0;width:100%;height:100%" /></figure>
        ${svg('<path class="axis" d="M120 409H1800" /><path class="axis" d="M689 60V940" /><circle class="axis" cx="689" cy="409" r="34" />', 'axes')}
      </div></div>
      ${K.caption(s, i)}`;
  },

  // 24. KJ, prix Design Plus : panoramique dans le ciel, un cercle se trace autour du prix.
  'kj-prix'(s, i, K) {
    const p = place(K, 'p24-a.jpg', 1920, 940, 0.5, 1);
    return `
      <div class="stage"><div class="cam">${img('p24-a.jpg', p)}
        <img class="badge" src="assets/img/p24-b.jpg" alt="" style="position:absolute;${box(1378, 934 + p.top, 267, 40)}" /></div></div>
      ${K.caption(s, i)}`;
  },

  // 25. KJ, technique : vue de côté et de face, traits de rappel.
  'kj-technique'(s, i, K) {
    const lead = (d) => `<path class="lead" d="${d}" /><circle class="lead-dot" cx="${d.split(/[ML ]+/)[1]}" cy="${d.split(/[ML ]+/)[2]}" r="6" />`;
    return `
      <div class="stage">
        <figure class="ph side" style="${box(0, 0, 1237, 940)}"><img src="assets/img/p25-b.jpg" alt="" style="position:absolute;inset:0;width:100%;height:100%" /></figure>
        <figure class="ph front" style="${box(1520, 16, 339, 909)}"><img src="assets/img/p25-a.jpg" alt="" style="position:absolute;inset:0;width:100%;height:100%" /></figure>
        ${svg(lead('M560 210L760 120H860') + lead('M880 470L880 600H960'), 'tech tech--ink leads')}
        <p class="note n1">Capot ouvrant</p>
        <p class="note n2">Module LED</p>
      </div>
      ${K.caption(s, i)}`;
  },

  // 26. Le moule : trois colonnes qui montent comme des passes d'usinage.
  usinage(s, i, K) {
    const W = 633;
    return `
      <div class="stage">${['p26-a.jpg', 'p26-b.jpg', 'p26-c.jpg'].map((src, k) => `
        <div class="pn" data-k="${k}" style="${box(k * (W + 10) + (k === 2 ? 1 : 0), 0, k === 2 ? 634 : W, 940)}"><div class="pn-in">${img(src, place(K, src, W, 940, 0.5, 0.5))}</div></div>`).join('')}
      </div>
      ${K.caption(s, i)}`;
  },

  // 27. Fonderie : les cinq temps, l'un après l'autre.
  fonderie(s, i, K) {
    const xs = [50, 415, 780, 1140, 1505], ws = [330, 330, 330, 340, 365];
    return `
      <div class="stage">
        ${xs.map((x, k) => `<figure class="ph step" data-k="${k}" style="${box(x, 300, ws[k], 290)}"><img src="assets/img/p27-s${k + 1}.jpg" alt="" style="position:absolute;inset:0;width:100%;height:100%" /></figure>`).join('')}
        ${svg('<path class="track" d="M70 660H1850" />', 'tech tech--ink')}
      </div>
      ${K.caption(s, i)}`;
  },

  // 28. Merci.
  merci(s, i, K) {
    return `
      <div class="cover end">
        <p class="wordmark">Chapelet.</p>
        <svg class="cover-line" viewBox="0 0 1920 1080" aria-hidden="true"><line x1="1253" y1="377" x2="1625" y2="-38" /></svg>
        <p class="byline">${K.words('stephanechapelet.com')}</p>
        <h1 class="cover-title"><span class="mask"><span class="rise">Merci.</span></span></h1>
      </div>`;
  },
};
