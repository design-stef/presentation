// Chorégraphies des scènes. Chaque fonction écrit ses animations dans la timeline commune « tl »
// à partir de t0 (début de la scène). La transition diagonale occupe [t0 ; t0 + 0,95] ;
// la zone [t0 + 6,8 ; t0 + 9,9] ne contient que des mouvements lents (elle est rejouée en aller-retour).
// Aucune lumière, aucun halo : le mouvement vient du cadre, de la caméra et du dessin.
window.SCENES = {};

// 1. Couverture -----------------------------------------------------------------------------
SCENES.cover = function (K, tl, f, t0) {
  var frame = K.q(f, '.mframe');
  var mts = K.qa(f, '.mt');
  var count = K.q(f, '.count');
  K.gfx(tl, frame, 'block', t0 + 0.05, { img: false, w: 1180, h: 664 });
  var T0 = t0 + 0.4, DT = 0.13;
  mts.forEach(function (m, k) {
    tl.set(m, { opacity: 1 }, T0 + k * DT);
    if (k < mts.length - 1) tl.set(m, { opacity: 0 }, T0 + (k + 1) * DT);
    tl.fromTo(m.querySelector('img'), { scale: 1.1 }, { scale: 1, duration: DT, ease: 'none' }, T0 + k * DT);
    K.cue(tl, 'tick', T0 + k * DT);
  });
  var end = T0 + mts.length * DT;
  var c = { v: 2008 };
  tl.fromTo(c, { v: 2008 }, {
    v: 2026, duration: mts.length * DT, ease: 'none', immediateRender: false,
    onUpdate: function () { count.textContent = Math.round(c.v); }
  }, T0);
  // Le compteur, en grand à droite du cadre pendant le montage, rejoint sa place à côté de « 2008– ».
  var cx = count.offsetLeft + count.offsetWidth / 2, cy = count.offsetTop + count.offsetHeight / 2;
  tl.fromTo(count, { x: 1600 - cx, y: 470 - cy, scale: 2.1 }, { x: 0, y: 0, scale: 1, duration: 1.1, ease: 'expo.inOut' }, end + 0.35);
  K.gfx(tl, frame, 'block', end + 0.05, { img: false, w: 1180, h: 664, out: true });
  tl.fromTo(K.q(f, '.y0'), { opacity: 0, x: 40, filter: 'blur(12px)' }, { opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.9, ease: 'expo.out' }, end + 1.1);
  K.draw(tl, K.q(f, '.cover-line line'), end + 0.6, 1.1);
  K.cue(tl, 'whoosh', end + 0.6);
  tl.fromTo(K.qa(f, '.cover-title .rise'), { yPercent: 105 }, { yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: 0.11 }, end + 0.9);
  tl.fromTo(K.q(f, '.wordmark'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out' }, end + 1.3);
  K.wordsIn(tl, K.qa(f, '.byline .w'), end + 1.5);
  K.drift(tl, K.q(f, '.cam'), t0 + 4.6, t0 + 11, { scale: 1 }, { scale: 1.025 });
};

// 2. Crossed : la tôle est découpée, puis elle se plie en 3D le long de ses cinq lignes ------
SCENES['crossed-principe'] = function (K, tl, f, t0) {
  var cam = K.q(f, '.f3-cam');
  var flat = K.q(f, '.f3-flat');
  var cut = K.q(f, '.f3-cut');
  var head = K.q(f, '.cut-head');
  var sparks = K.qa(f, '.spark');
  var root3 = K.q(f, '.f3.root');
  var W = 720, H = 921, ROWS = 12, RH = H / ROWS, T = 2.0, ts = t0 + 1.0;
  // 1. la plaque pleine, à gauche
  tl.fromTo(cam, { x: 160, y: 10, scale: 0.88, rotationX: 0, rotationY: 0 }, { x: 160, y: 10, scale: 0.88, duration: 0.01 }, t0);
  K.gfx(tl, flat, 'block', t0 + 0.25, { img: false, w: 720, h: 921 });
  // 2. le laser la découpe ligne à ligne : derrière la tête, la tôle découpée remplace la plaque
  var pr = { p: 0 };
  function raster() {
    var P = pr.p * ROWS;
    var r = Math.min(ROWS - 1, Math.floor(P));
    var x = pr.p >= 1 ? W : (P - r) * W;
    var y0 = r * RH, y1 = (r + 1) * RH;
    cut.style.clipPath = pr.p >= 1 ? 'none' : 'polygon(0px 0px,' + W + 'px 0px,' + W + 'px ' + y0 + 'px,' + x + 'px ' + y0 + 'px,' + x + 'px ' + y1 + 'px,0px ' + y1 + 'px)';
    var active = pr.p > 0 && pr.p < 1;
    head.style.opacity = active ? '1' : '0';
    head.style.transform = 'translate(' + x + 'px,' + (y0 + RH / 2) + 'px)';
    var tau = pr.p * T, life = 0.32;
    sparks.forEach(function (sp, k) {
      var age = (((tau - k * life / sparks.length) % life) + life) % life;
      var te = tau - age;
      if (!active || te < 0) { sp.style.opacity = '0'; return; }
      var Pe = te / T * ROWS, re = Math.floor(Pe);
      var xe = (Pe - re) * W, ye = (re + 0.5) * RH;
      var vx = (K.hash(k, 1) - 0.75) * 520, vy = -60 - K.hash(k, 2) * 300;
      sp.style.opacity = String(1 - age / life);
      sp.style.transform = 'translate(' + (xe + vx * age).toFixed(1) + 'px,' + (ye + vy * age + 1500 * age * age).toFixed(1) + 'px)';
    });
  }
  raster();
  tl.fromTo(pr, { p: 0 }, { p: 1, duration: T, ease: 'none', onUpdate: raster, immediateRender: false }, ts);
  K.cue(tl, 'laser', ts);
  // 3. la tôle découpée passe en 3D : même image, découpée en six bandes articulées
  tl.fromTo(root3, { opacity: 0 }, { opacity: 1, duration: 0.01 }, ts + T + 0.1);
  tl.fromTo(flat, { opacity: 1 }, { opacity: 0, duration: 0.01, immediateRender: false }, ts + T + 0.1);
  tl.fromTo(cam, { x: 160, y: 10, scale: 0.88, rotationX: 0, rotationY: 0 },
    { x: 600, y: 60, scale: 0.78, rotationX: -16, rotationY: -36, duration: 1.0, ease: 'power3.inOut', immediateRender: false }, t0 + 3.15);
  K.cue(tl, 'whoosh', t0 + 3.15);
  // 4. pli après pli, dans l'ordre des numéros gravés sur la tôle
  var folds = [['.s0', 109.4], ['.s1', -114.3], ['.s2', 57.2], ['.s3', -149.1], ['.s5', -83.2]];
  tl.fromTo(root3, { rotationX: 0 }, { rotationX: -6.8, duration: 0.5, ease: 'power2.inOut' }, t0 + 4.2);
  var counter = K.q(f, '.fold-count'), strip = K.q(f, '.fc-strip');
  tl.fromTo(counter, { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.5, ease: 'expo.out' }, t0 + 4.1);
  tl.fromTo(strip, { yPercent: 0 }, { yPercent: 0, duration: 0.01 }, t0);
  tl.fromTo(cam, { x: 600, y: 60, scale: 0.78 }, { x: 622, y: -330, scale: 1.12, duration: 1.5, ease: 'power2.inOut', immediateRender: false }, t0 + 5.3);
  folds.forEach(function (fd, k) {
    var el = f.querySelector('.f3' + fd[0]);
    var at = t0 + 4.2 + k * 0.46;
    tl.fromTo(el, { rotationX: 0 }, { rotationX: fd[1], duration: 0.5, ease: 'power2.inOut' }, at);
    if (k > 0) tl.fromTo(strip, { yPercent: -(k - 1) * 20 }, { yPercent: -k * 20, duration: 0.45, ease: 'expo.out', immediateRender: false }, at);
    K.cue(tl, 'tick', at + 0.3);
  });
  K.caption(tl, f, t0 + 0.7);
  // respiration : le banc plié tourne lentement
  K.drift(tl, cam, t0 + 6.8, t0 + 11, { rotationY: -36, rotationX: -16 }, { rotationY: -50, rotationX: -18 });
};

// 3. Crossed de nuit : la photo se recompose en lattes, puis cadrage du banc ------------------
SCENES['crossed-nuit'] = function (K, tl, f, t0) {
  var cam = K.q(f, '.cam');
  K.qa(f, '.strip').forEach(function (s, k) {
    tl.fromTo(s, { yPercent: k % 2 ? 100 : -100 }, { yPercent: 0, duration: 1.1, ease: 'power4.out' }, t0 + 0.35 + K.hash(k, 3) * 0.45);
  });
  K.cue(tl, 'whoosh', t0 + 0.4);
  tl.fromTo(cam, { scale: 1.1 }, { scale: 1, duration: 4.2, ease: 'power2.out' }, t0 + 0.3);
  K.draw(tl, f.querySelectorAll('.bk path'), t0 + 2.6, 0.6, { stagger: 0.06 });
  K.cue(tl, 'tick', t0 + 2.6);
  K.caption(tl, f, t0 + 1.6);
  K.drift(tl, cam, t0 + 6.4, t0 + 11, { scale: 1, x: 0 }, { scale: 1.04, x: -20 });
};

// 4. La famille Crossed : triptyque ---------------------------------------------------------
SCENES['crossed-famille'] = function (K, tl, f, t0) {
  var kinds = ['diag', 'slices', 'block'];
  K.qa(f, '.pn').forEach(function (pn, k) {
    var at = t0 + 0.4 + k * 0.2;
    var img = pn.querySelector('img');
    K.gfx(tl, pn, kinds[k], at, k === 1 ? { dir: 'h', n: 5 } : {});
    if (k < 2) K.drift(tl, img, t0 + 3.0, t0 + 11, { x: 0 }, { x: k ? -40 : -30 });
    else K.drift(tl, img, t0 + 3.0, t0 + 11, { y: 0 }, { y: 16 });
  });
  K.caption(tl, f, t0 + 1.4);
};

// 5. Hilton : travelling du banc à la jardinière, puis vue d'ensemble ------------------------
SCENES.hilton = function (K, tl, f, t0) {
  var world = K.q(f, '.world');
  var cam = { fx: 323, fy: 538, s: 2.0 };
  function apply() {
    var s = cam.s;
    var tx = K.clamp(960 - cam.fx * s, 1920 - 1920 * s, 0);
    var ty = K.clamp(470 - cam.fy * s, 940 - 940 * s, 0);
    world.style.transform = 'translate(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px) scale(' + s.toFixed(4) + ')';
  }
  apply();
  function move(to, at, dur, ease) {
    var from = { fx: cam.fx, fy: cam.fy, s: cam.s };
    tl.fromTo(cam, from, Object.assign({ duration: dur, ease: ease, onUpdate: apply, immediateRender: false }, to), at);
    cam.fx = to.fx; cam.fy = to.fy; cam.s = to.s;
  }
  move({ fx: 323, fy: 538, s: 2.2 }, t0, 2.7, 'power1.inOut');
  move({ fx: 1365, fy: 200, s: 2.05 }, t0 + 2.75, 1.4, 'power3.inOut');
  move({ fx: 1365, fy: 200, s: 2.15 }, t0 + 4.15, 0.6, 'none');
  move({ fx: 960, fy: 470, s: 1 }, t0 + 4.75, 1.5, 'power3.inOut');
  move({ fx: 900, fy: 450, s: 1.035 }, t0 + 6.25, 4.75, 'sine.inOut');
  K.cue(tl, 'whoosh', t0 + 2.75);
  K.cue(tl, 'whoosh', t0 + 4.75);
  K.draw(tl, f.querySelectorAll('.bk-a path'), t0 + 1.0, 0.6, { stagger: 0.06 });
  K.cue(tl, 'tick', t0 + 1.0);
  K.draw(tl, f.querySelectorAll('.bk-b path'), t0 + 3.6, 0.6, { stagger: 0.06 });
  K.cue(tl, 'tick', t0 + 3.6);
  K.caption(tl, f, t0 + 5.4);
};

// 6. Zadig : la photo apparaît à travers une trame de perforations ---------------------------
SCENES.zadig = function (K, tl, f, t0) {
  var circles = K.qa(f, '.perf circle');
  var O = [1150, 630], SPEED = 1000, RAMP = 220, RMAX = 44;
  var dist = circles.map(function (c, k) {
    var x = Number(c.getAttribute('cx')), y = Number(c.getAttribute('cy'));
    return Math.hypot(x - O[0], y - O[1]) + K.hash(k, 7) * 160;
  });
  var pr = { t: 0 };
  function grow() {
    var front = pr.t * SPEED;
    for (var k = 0; k < circles.length; k++) {
      var v = K.clamp((front - dist[k]) / RAMP, 0, 1);
      circles[k].setAttribute('r', (v * RMAX).toFixed(1));
    }
  }
  grow();
  tl.fromTo(pr, { t: 0 }, { t: 2.2, duration: 2.2, ease: 'power1.in', onUpdate: grow, immediateRender: false }, t0 + 0.4);
  K.cue(tl, 'draw', t0 + 0.4);
  var cam = K.q(f, '.cam');
  tl.fromTo(cam, { scale: 1.08 }, { scale: 1, duration: 5, ease: 'power2.out' }, t0 + 0.3);
  K.caption(tl, f, t0 + 2.2);
  K.drift(tl, cam, t0 + 5.4, t0 + 11, { scale: 1 }, { scale: 1.04 });
};

// 7. Zadig à Bergen et Milan : le détail perforé, en gros plan, rejoint sa place -------------
SCENES['zadig-lieux'] = function (K, tl, f, t0) {
  var det = K.q(f, '.detail'), mus = K.q(f, '.museum'), mil = K.q(f, '.milan');
  tl.fromTo(det.querySelector('img'), { scale: 1.12 }, { scale: 1, duration: 1.4, ease: 'power1.out' }, t0 + 0.2);
  tl.fromTo(det, { x: 960 - 1515, y: 470 - 707.5, scale: 2.37 }, { x: 0, y: 0, scale: 1, duration: 1.3, ease: 'expo.inOut' }, t0 + 1.5);
  K.cue(tl, 'whoosh', t0 + 1.5);
  K.gfx(tl, mus, 'slices', t0 + 1.7);
  K.gfx(tl, mil, 'block', t0 + 1.9);
  K.caption(tl, f, t0 + 2.7);
  K.drift(tl, mus.querySelector('img'), t0 + 4.2, t0 + 11, { scale: 1 }, { scale: 1.05 });
  K.drift(tl, mil.querySelector('img'), t0 + 3.6, t0 + 11, { x: 0 }, { x: -24 });
};

// 8. Du croquis au banc ----------------------------------------------------------------------
SCENES.croquis = function (K, tl, f, t0) {
  K.gfx(tl, K.q(f, '.sk2'), 'tiles', t0 + 0.4, { cols: 5, rows: 5 });
  K.cue(tl, 'draw', t0 + 0.4);
  K.gfx(tl, K.q(f, '.sk1'), 'tiles', t0 + 1.5, { cols: 6, rows: 4 });
  K.cue(tl, 'draw', t0 + 1.5);
  tl.fromTo(K.qa(f, '.slat'), { x: 180, opacity: 0 }, { x: 0, opacity: 1, duration: 0.9, ease: 'expo.out', stagger: 0.07 }, t0 + 2.8);
  K.cue(tl, 'tick', t0 + 2.8);
  K.caption(tl, f, t0 + 0.9);
  K.drift(tl, K.q(f, '.slats'), t0 + 4.6, t0 + 11, { scale: 1 }, { scale: 1.035 });
};

// 9. Alassio --------------------------------------------------------------------------------
SCENES.alassio = function (K, tl, f, t0) {
  var sea = K.q(f, '.sea'), park = K.q(f, '.park');
  K.gfx(tl, sea, 'diag', t0 + 0.35);
  tl.fromTo(sea.querySelector('img'), { x: 46 }, { x: -46, duration: 9.2, ease: 'none' }, t0 + 1.8);
  K.gfx(tl, park, 'slices', t0 + 1.2, { n: 5 });
  K.caption(tl, f, t0 + 2.0);
  K.drift(tl, park.querySelector('img'), t0 + 3.2, t0 + 11, { y: 0 }, { y: -30 });
};

// 10. Emme à Monte-Carlo ----------------------------------------------------------------------
SCENES['emme-monaco'] = function (K, tl, f, t0) {
  var walk = K.q(f, '.walk'), cam = walk.querySelector('.cam');
  var va = K.q(f, '.view-a'), vb = K.q(f, '.view-b');
  K.gfx(tl, walk, 'diag', t0 + 0.35);
  tl.fromTo(cam, { scale: 1 }, { scale: 1.12, duration: 4.9, ease: 'power1.inOut', transformOrigin: '55% 50%' }, t0 + 1.8);
  K.draw(tl, f.querySelectorAll('.bk path'), t0 + 3.0, 0.6, { stagger: 0.06 });
  K.cue(tl, 'tick', t0 + 3.0);
  // vues d'ensemble de la digue, tirées de la vidéo du projet : elles glissent lentement, comme le drone
  K.gfx(tl, va, 'block', t0 + 1.2);
  K.gfx(tl, vb, 'block', t0 + 1.45);
  tl.fromTo(va.querySelector('img'), { x: 22 }, { x: -22, duration: 9.6, ease: 'none' }, t0 + 1.2);
  tl.fromTo(vb.querySelector('img'), { x: -22 }, { x: 22, duration: 9.3, ease: 'none' }, t0 + 1.5);
  K.caption(tl, f, t0 + 2.2);
  K.drift(tl, cam, t0 + 6.7, t0 + 11, { scale: 1.12 }, { scale: 1.16 });
};

// 11. Variations : balayage circulaire ----------------------------------------------------------
SCENES.variations = function (K, tl, f, t0) {
  var ring = K.q(f, '.ring'), snake = K.q(f, '.snake');
  K.gfx(tl, ring, 'tiles', t0 + 0.4, { cols: 7, rows: 6 });
  K.gfx(tl, snake, 'block', t0 + 1.7);
  K.caption(tl, f, t0 + 1.0);
  K.drift(tl, ring.querySelector('img'), t0 + 2.4, t0 + 11, { scale: 1 }, { scale: 1.04 });
  K.drift(tl, snake, t0 + 3.4, t0 + 11, { x: 0 }, { x: -16 });
};

// 12. Variations, esquisse --------------------------------------------------------------------
SCENES['variations-detail'] = function (K, tl, f, t0) {
  var back = K.q(f, '.back');
  K.gfx(tl, K.q(f, '.sketch'), 'tiles', t0 + 0.4, { cols: 7, rows: 5 });
  K.cue(tl, 'draw', t0 + 0.4);
  K.gfx(tl, back, 'slices', t0 + 1.2, { n: 5 });
  tl.fromTo(back.querySelector('.cam'), { scale: 1 }, { scale: 1.16, duration: 9.6, ease: 'power1.inOut', transformOrigin: '50% 22%' }, t0 + 1.2);
  K.caption(tl, f, t0 + 1.0);
};

// 13. Variations à Paris : plongée aérienne, puis la place s'ouvre en cercle ------------------
SCENES['variations-paris'] = function (K, tl, f, t0) {
  var aerial = K.q(f, '.aerial'), ground = K.q(f, '.ground');
  // la place de nuit, plein cadre, puis elle rejoint sa moitié d'écran
  tl.fromTo(aerial.querySelector('.cam'), { scale: 1.1 }, { scale: 1, duration: 1.8, ease: 'power1.out' }, t0 + 0.1);
  tl.fromTo(aerial, { x: -480, y: 0, scale: 2 }, { x: 0, y: 0, scale: 1, duration: 1.3, ease: 'expo.inOut' }, t0 + 1.7);
  K.cue(tl, 'whoosh', t0 + 1.7);
  K.gfx(tl, ground, 'diag', t0 + 2.3);
  K.caption(tl, f, t0 + 2.6);
  K.drift(tl, aerial.querySelector('.cam'), t0 + 3.4, t0 + 11, { scale: 1 }, { scale: 1.06 });
  K.drift(tl, ground.querySelector('img'), t0 + 4.9, t0 + 11, { scale: 1 }, { scale: 1.04 });
};

// 14. Emme, moulage : quatre temps, chacun avec son geste --------------------------------------
SCENES['emme-moule'] = function (K, tl, f, t0) {
  var render = K.q(f, '.render');
  K.gfx(tl, render, 'block', t0 + 0.35, { zoom: false });
  tl.fromTo(render, { y: 60 }, { y: 0, duration: 1.4, ease: 'expo.out' }, t0 + 0.35);
  var arrows = K.qa(f, '.arw');
  // 1. le moule arrive
  K.gfx(tl, K.q(f, '.step1'), 'block', t0 + 1.4, { zoom: false });
  K.cue(tl, 'tick', t0 + 1.5);
  K.draw(tl, arrows[0], t0 + 2.0, 0.4);
  // 2. la coulée monte
  tl.fromTo(K.q(f, '.step2'), { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'power2.inOut' }, t0 + 2.3);
  K.cue(tl, 'tick', t0 + 2.3);
  K.draw(tl, arrows[1], t0 + 3.1, 0.4);
  // 3. le retournement
  tl.fromTo(K.q(f, '.step3'), { rotation: -180, opacity: 0 }, { rotation: 0, opacity: 1, duration: 1.0, ease: 'power3.inOut' }, t0 + 3.4);
  K.cue(tl, 'tick', t0 + 3.4);
  K.draw(tl, arrows[2], t0 + 4.3, 0.4);
  // 4. le démoulage
  tl.fromTo(K.q(f, '.step4'), { y: 90, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'expo.out' }, t0 + 4.6);
  K.cue(tl, 'thud', t0 + 4.7);
  K.caption(tl, f, t0 + 0.8);
  K.drift(tl, render, t0 + 5.2, t0 + 11, { y: 0 }, { y: -10 });
};

// 15. Les moules : la photo se recompose en planches ---------------------------------------------
SCENES.moules = function (K, tl, f, t0) {
  var cam = K.q(f, '.cam');
  K.qa(f, '.plank').forEach(function (p, k) {
    tl.fromTo(p, { xPercent: k % 2 ? 105 : -105 }, { xPercent: 0, duration: 1.1, ease: 'power4.out' }, t0 + 0.35 + K.hash(k, 5) * 0.5);
  });
  K.cue(tl, 'whoosh', t0 + 0.4);
  tl.fromTo(cam, { scale: 1.08 }, { scale: 1, duration: 4, ease: 'power2.out' }, t0 + 0.3);
  K.caption(tl, f, t0 + 1.6);
  K.drift(tl, cam, t0 + 5.2, t0 + 11, { x: 0, scale: 1 }, { x: -34, scale: 1.03 });
};

// 16. Emme à Djeddah : survol de la corniche, puis la photo des bancs ------------------------------
SCENES['emme-djeddah'] = function (K, tl, f, t0) {
  var aer = K.q(f, '.aer'), ai = aer.querySelector('img'), ground = K.q(f, '.ground');
  var S1 = 1100 / 624, S2 = 0.9936;
  tl.fromTo(aer, { clipPath: 'inset(0px 410px 0px 410px)' }, { clipPath: 'inset(0px 410px 0px 410px)', duration: 0.01 }, t0);
  tl.fromTo(ai, { x: 410, y: -264, scale: S1 }, { x: 410, y: -964, scale: S1, duration: 3.0, ease: 'power1.inOut' }, t0 + 0.3);
  tl.fromTo(ai, { x: 410, y: -964, scale: S1 }, { x: 1300, y: -80, scale: S2, duration: 1.2, ease: 'power3.inOut', immediateRender: false }, t0 + 3.4);
  tl.fromTo(aer, { clipPath: 'inset(0px 410px 0px 410px)' }, { clipPath: 'inset(0px 0px 0px 1300px)', duration: 1.2, ease: 'power3.inOut', immediateRender: false }, t0 + 3.4);
  K.cue(tl, 'whoosh', t0 + 3.4);
  K.gfx(tl, ground, 'slices', t0 + 3.7);
  K.caption(tl, f, t0 + 4.4);
  K.drift(tl, ai, t0 + 6.2, t0 + 11, { y: -80 }, { y: -125 });
};

// 17. Banc béton et bois : mise au point, puis traits de cote ---------------------------------------
SCENES['beton-bois'] = function (K, tl, f, t0) {
  var cam = K.q(f, '.cam'), img = K.q(f, '.focus');
  tl.fromTo(img, { filter: 'blur(18px)', scale: 1.06 }, { filter: 'blur(0px)', scale: 1, duration: 2.0, ease: 'power2.out' }, t0 + 0.35);
  K.draw(tl, f.querySelectorAll('.bk path'), t0 + 2.4, 0.6, { stagger: 0.06 });
  K.draw(tl, f.querySelectorAll('.dim-line'), t0 + 2.9, 0.8, { stagger: 0.2 });
  tl.fromTo(f.querySelectorAll('.dim-tick'), { opacity: 0 }, { opacity: 1, duration: 0.3, stagger: 0.2 }, t0 + 2.9);
  K.cue(tl, 'draw', t0 + 2.9);
  K.caption(tl, f, t0 + 1.4);
  K.drift(tl, cam, t0 + 4.4, t0 + 11, { scale: 1 }, { scale: 1.035 });
};

// 18. Banc acier et béton : travelling latéral, puis contour ------------------------------------------
SCENES['acier-beton'] = function (K, tl, f, t0) {
  var cam = K.q(f, '.cam');
  tl.fromTo(cam, { x: 90, scale: 1.1 }, { x: 0, scale: 1, duration: 3.6, ease: 'power3.out' }, t0 + 0.3);
  K.draw(tl, f.querySelectorAll('.bk path'), t0 + 3.0, 0.6, { stagger: 0.06 });
  K.draw(tl, f.querySelectorAll('.dim-line'), t0 + 3.5, 0.8);
  tl.fromTo(f.querySelectorAll('.dim-tick'), { opacity: 0 }, { opacity: 1, duration: 0.3 }, t0 + 3.5);
  K.cue(tl, 'draw', t0 + 3.0);
  K.caption(tl, f, t0 + 1.4);
  K.drift(tl, cam, t0 + 4.4, t0 + 11, { x: 0, scale: 1 }, { x: -18, scale: 1.03 });
};

// 19. Ligne ----------------------------------------------------------------------------------------
SCENES.ligne = function (K, tl, f, t0) {
  var photo = K.q(f, '.photo');
  K.gfx(tl, photo, 'slices', t0 + 0.35);
  K.gfx(tl, K.q(f, '.diagram'), 'tiles', t0 + 1.6, { cols: 6, rows: 4 });
  K.cue(tl, 'draw', t0 + 1.6);
  K.caption(tl, f, t0 + 1.0);
  K.drift(tl, photo.querySelector('.cam'), t0 + 3.4, t0 + 11, { scale: 1 }, { scale: 1.04 });
};

// 20. Banc monolithe ---------------------------------------------------------------------------------
SCENES.monolithe = function (K, tl, f, t0) {
  var photo = K.q(f, '.photo');
  K.gfx(tl, photo, 'diag', t0 + 0.35);
  tl.fromTo(photo.querySelector('.cam'), { x: 0, scale: 1 }, { x: 40, scale: 1.06, duration: 9.2, ease: 'none' }, t0 + 1.8);
  K.gfx(tl, K.q(f, '.diagram'), 'block', t0 + 1.8, { zoom: false });
  K.cue(tl, 'draw', t0 + 1.8);
  K.caption(tl, f, t0 + 1.0);
};

// 21. Banc et jardinières : posés un à un ---------------------------------------------------------------
SCENES.blanc = function (K, tl, f, t0) {
  K.qa(f, '.obj').forEach(function (o, k) {
    var at = t0 + 0.5 + [0, 0.8, 1.25][k];
    tl.fromTo(o, { y: -80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }, at);
    K.cue(tl, 'thud', at + 0.55);
    K.drift(tl, o, t0 + 3.2, t0 + 11, { x: 0 }, { x: k === 0 ? -10 : 10 });
  });
  K.caption(tl, f, t0 + 1.2);
};

// 22. Monaco : du port au crépuscule vers le banc et la jardinière ----------------------------------------
SCENES.fontvieille = function (K, tl, f, t0) {
  var dusk = K.q(f, '.dusk'), harbour = K.q(f, '.harbour'), planter = K.q(f, '.planter');
  tl.fromTo(dusk.querySelector('img'), { scale: 1.1 }, { scale: 1, duration: 1.6, ease: 'power1.out' }, t0 + 0.1);
  tl.fromTo(dusk, { x: 485, y: 237.5, scale: 2.0215 }, { x: 0, y: 0, scale: 1, duration: 1.3, ease: 'expo.inOut' }, t0 + 1.6);
  K.cue(tl, 'whoosh', t0 + 1.6);
  K.gfx(tl, harbour, 'block', t0 + 2.1);
  K.gfx(tl, planter, 'slices', t0 + 2.3, { n: 5 });
  K.caption(tl, f, t0 + 3.0);
  K.drift(tl, planter.querySelector('img'), t0 + 4.4, t0 + 11, { scale: 1 }, { scale: 1.05 });
};

// 23. KJ : axes de construction, puis le luminaire se dévoile ------------------------------------------------
SCENES.kj = function (K, tl, f, t0) {
  var cam = K.q(f, '.cam');
  K.draw(tl, f.querySelectorAll('.axis'), t0 + 0.4, 1.0, { stagger: 0.15 });
  K.cue(tl, 'draw', t0 + 0.4);
  K.gfx(tl, K.q(f, '.lamp'), 'block', t0 + 1.3, { zoom: false });
  tl.to(f.querySelectorAll('.axis'), { opacity: 0.25, duration: 0.8, ease: 'power1.out' }, t0 + 3.4);
  tl.fromTo(cam, { scale: 1.06 }, { scale: 1, duration: 6, ease: 'power2.out', transformOrigin: '36% 44%' }, t0 + 0.3);
  K.caption(tl, f, t0 + 2.2);
  K.drift(tl, cam, t0 + 6.3, t0 + 11, { scale: 1, rotation: 0 }, { scale: 1.03, rotation: -0.8 });
};

// 24. KJ, prix Design Plus --------------------------------------------------------------------------------------
SCENES['kj-prix'] = function (K, tl, f, t0) {
  var cam = K.q(f, '.cam');
  tl.fromTo(cam, { x: -70, scale: 1.08 }, { x: 0, scale: 1, duration: 4.6, ease: 'power2.out' }, t0 + 0.3);
  K.caption(tl, f, t0 + 1.2);
  K.drift(tl, cam, t0 + 5.0, t0 + 11, { x: 0, scale: 1 }, { x: 22, scale: 1.03 });
};

// 25. KJ, technique : vues, traits de rappel ---------------------------------------------------------------------
SCENES['kj-technique'] = function (K, tl, f, t0) {
  K.gfx(tl, K.q(f, '.side'), 'slices', t0 + 0.35, { n: 6 });
  K.gfx(tl, K.q(f, '.front'), 'block', t0 + 1.2, { zoom: false });
  var leads = K.qa(f, '.lead'), dots = K.qa(f, '.lead-dot'), notes = K.qa(f, '.note');
  [0, 1].forEach(function (k) {
    var at = t0 + 2.4 + k * 0.7;
    tl.fromTo(dots[k], { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2)', transformOrigin: '50% 50%' }, at);
    K.draw(tl, leads[k], at + 0.1, 0.5);
    tl.fromTo(notes[k], { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'steps(14)' }, at + 0.55);
    K.cue(tl, 'tick', at);
  });
  K.caption(tl, f, t0 + 0.9);
  K.drift(tl, K.q(f, '.front'), t0 + 2.4, t0 + 11, { y: 0 }, { y: -14 });
};

// 26. Le moule : trois colonnes comme des passes d'usinage ----------------------------------------------------------
SCENES.usinage = function (K, tl, f, t0) {
  K.qa(f, '.pn').forEach(function (pn, k) {
    var at = t0 + 0.4 + k * 0.32;
    var img = pn.querySelector('img');
    K.gfx(tl, pn, 'slices', at, { dir: 'h', n: 6 });
    K.drift(tl, img, t0 + 3.2, t0 + 11, { y: 0 }, { y: k % 2 ? -26 : 26 });
  });
  K.caption(tl, f, t0 + 1.6);
};

// 27. Fonderie : les cinq temps, l'un après l'autre ------------------------------------------------------------------
SCENES.fonderie = function (K, tl, f, t0) {
  var steps = K.qa(f, '.step');
  steps.forEach(function (s, k) {
    K.gfx(tl, s, 'block', t0 + 0.5 + k * 0.16, { zoom: false });
  });
  K.cue(tl, 'tick', t0 + 0.5);
  // un repère parcourt les étapes : l'étape en cours est pleine, les autres s'effacent
  var cyc = { v: 0 };
  function light() {
    var active = Math.floor(cyc.v);
    steps.forEach(function (s, j) {
      var on = cyc.v >= 5 || j === active;
      s.style.opacity = on ? '1' : '0.22';
    });
  }
  tl.fromTo(cyc, { v: 0 }, { v: 5, duration: 3.4, ease: 'none', onUpdate: light, immediateRender: false }, t0 + 2.6);
  K.draw(tl, K.q(f, '.track'), t0 + 2.6, 3.4, { ease: 'none' });
  [0, 1, 2, 3, 4].forEach(function (k) { K.cue(tl, 'tick', t0 + 2.6 + k * 0.68); });
  K.caption(tl, f, t0 + 1.0);
};

// 28. Merci -------------------------------------------------------------------------------------------------------------
SCENES.merci = function (K, tl, f, t0) {
  K.draw(tl, f.querySelector('.cover-line line'), t0 + 0.4, 1.0);
  K.cue(tl, 'whoosh', t0 + 0.4);
  tl.fromTo(f.querySelectorAll('.cover-title .rise'), { yPercent: 105 }, { yPercent: 0, duration: 1.3, ease: 'expo.out' }, t0 + 0.6);
  tl.fromTo(f.querySelector('.wordmark'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out' }, t0 + 0.6);
  K.wordsIn(tl, f.querySelectorAll('.byline .w'), t0 + 1.1);
  K.drift(tl, f.querySelector('.cover'), t0 + 2.6, t0 + 11, { scale: 1 }, { scale: 1.02 });
};
