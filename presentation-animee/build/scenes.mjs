// Gabarits HTML des scènes recomposées. Chaque fonction reçoit l'entrée de slides.mjs et des outils,
// et renvoie le contenu de la scène. Les animations correspondantes sont dans choreo.js.
// Coordonnées en pixels sur une slide 1920 × 1080.

// Image recadrée dans un cadre : la zone (fx, fy) de l'image (0 à 1) est centrée, sans laisser de vide.
export function crop(K, src, pw, ph, fx = 0.5, fy = 0.5, zoom = 1, cls = '') {
  const [iw, ih] = K.size(src);
  const s = Math.max(pw / iw, ph / ih) * zoom;
  const w = iw * s, h = ih * s;
  const left = Math.min(0, Math.max(pw - w, pw / 2 - fx * w));
  const top = Math.min(0, Math.max(ph - h, ph / 2 - fy * h));
  return `<img class="${cls}" src="assets/img/${src}" alt="" style="position:absolute;left:${left.toFixed(1)}px;top:${top.toFixed(1)}px;width:${w.toFixed(1)}px;height:${h.toFixed(1)}px" />`;
}

const box = (x, y, w, h) => `left:${x}px;top:${y}px;width:${w}px;height:${h}px`;

// Coins de cadrage (dessin technique) autour d'un rectangle.
export function brackets(x, y, w, h, len = 36, cls = 'brk') {
  const p = (d) => `<path class="${cls}" d="${d}" />`;
  return [
    p(`M${x} ${y + len}V${y}H${x + len}`),
    p(`M${x + w - len} ${y}H${x + w}V${y + len}`),
    p(`M${x + w} ${y + h - len}V${y + h}H${x + w - len}`),
    p(`M${x + len} ${y + h}H${x}V${y + h - len}`),
  ].join('');
}

export const html = {
  // 1. Couverture : montage rapide de projets, compteur 2008 → 2026, puis titre.
  cover(s, i, K) {
    const montage = ['p03-a.jpg', 'p06-a.jpg', 'p09-a.jpg', 'p07-b.jpg', 'p10-a.jpg', 'p13-a.jpg', 'p15-a.jpg',
      'p16-a.jpg', 'p22-c.jpg', 'p05-a.jpg', 'p26-b.jpg', 'p24-a.jpg'];
    return `
      <div class="cover cam" data-layout-allow-overlap>
        <div class="montage">${montage.map((m, k) => `<div class="mt" data-k="${k}">${crop(K, m, 1920, 1080, 0.5, 0.55)}</div>`).join('')}</div>
        <p class="wordmark">Chapelet.</p>
        <svg class="cover-line" viewBox="0 0 1920 1080" aria-hidden="true"><line x1="881" y1="792" x2="1253" y2="377" /></svg>
        <p class="y0">2008–</p>
        <p class="count">2008</p>
        <p class="byline">${K.words('Stéphane Chapelet, designer')}</p>
        <h1 class="cover-title"><span class="mask"><span class="rise">Mobilier</span></span> <span class="mask"><span class="rise">urbain</span></span></h1>
      </div>`;
  },

  // 2. Crossed : la tôle est découpée au laser ligne à ligne, puis le profil se plie en cinq temps.
  'crossed-principe'(s, i, K) {
    return `
      <div class="sheet" style="${box(150, 50, 860, 960)}">
        <img src="assets/img/p02-panel.jpg" alt="" style="position:absolute;inset:0;width:100%;height:100%" />
        ${[115, 272, 412, 607, 947].map((y, k) => `<i class="band" data-k="${k}" style="top:${y - 50 - 13}px"></i>`).join('')}
        <i class="laser-head"></i>
        ${Array.from({ length: 30 }, (_, k) => `<i class="spark" data-k="${k}"></i>`).join('')}
        <i class="scan"></i>
      </div>
      <figure class="ph fold-img" style="${box(1150, 420, 640, 450)}"><img src="assets/img/p02-fold.jpg" alt="" /></figure>
      <svg class="fold-svg" viewBox="0 0 1920 1080" aria-hidden="true">
        <polyline class="profile" points="" />
        ${[5, 4, 3, 2, 1].map((n, k) => `<g class="fold-num" data-k="${k}"><g class="fn-in"><circle r="19" /><text dy="7">${n}</text></g></g>`).join('')}
      </svg>
      ${K.caption(s, i)}`;
  },

  // 3. Crossed de nuit : le mot apparaît dans le noir, puis les lumières s'allument une à une.
  'crossed-nuit'(s, i, K) {
    return `
      <div class="cam">
        <img class="lit" src="assets/img/p03-a.jpg" alt="" />
        <div class="dark"></div>
        <i class="spot" style="left:115px;top:662px"></i>
        <i class="spot" style="left:1728px;top:624px"></i>
        <i class="spot spot--wide" style="left:1000px;top:880px"></i>
      </div>
      <p class="bigword" data-chars>CROSSED</p>
      ${K.caption(s, i)}`;
  },

  // 4. La famille Crossed : triptyque, chaque objet dans sa colonne.
  'crossed-famille'(s, i, K) {
    const cols = [
      { src: 'p04-b.jpg', fx: 0.53, fy: 0.72, z: 1.0, tag: 'Jardinière', place: 'Barcelone' },
      { src: 'p04-a.jpg', fx: 0.47, fy: 0.62, z: 1.0, tag: 'Siège', place: 'Capri' },
      { src: 'p04-c.jpg', fx: 0.5, fy: 0.62, z: 1.05, tag: 'Corbeille', place: 'Crossed' },
    ];
    const W = 628, G = 18, Y = 330, H = 1080 - Y;
    return `
      ${cols.map((c, k) => `
      <div class="pn" data-k="${k}" style="${box(k * (W + G), Y, W, H)}">
        <div class="pn-in">${crop(K, c.src, W, H, c.fx, c.fy, c.z)}</div>
        <p class="tag"><b>${K.words(c.tag)}</b> ${K.words(c.place)}</p>
      </div>`).join('')}
      ${K.caption(s, i)}`;
  },

  // 5. Hilton : travelling de caméra sur le collage, du banc à la jardinière, puis vue d'ensemble.
  hilton(s, i, K) {
    return `
      <div class="world">
        <figure class="ph" style="${box(0, 0, 960, 1080)}"><img src="assets/img/p05-a.jpg" alt="" /></figure>
        <figure class="ph" style="${box(960, 0, 960, 680)}"><img src="assets/img/p05-b.jpg" alt="" /></figure>
        <figure class="ph" style="${box(960, 570, 960, 510)}"><img src="assets/img/p05-c.jpg" alt="" /></figure>
        <svg class="world-svg" viewBox="0 0 1920 1080" aria-hidden="true">
          <g class="bk bk-a">${brackets(60, 560, 540, 220)}</g>
          <g class="bk bk-b">${brackets(1200, 120, 340, 290)}</g>
        </svg>
      </div>
      <p class="tag tag-a"><b>Banc et corbeille</b> Hilton Lac-Leamy</p>
      <p class="tag tag-b"><b>Jardinière</b> entrée de l'hôtel</p>
      ${K.caption(s, i)}`;
  },
};
