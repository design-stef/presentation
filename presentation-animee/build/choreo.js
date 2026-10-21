// Chorégraphies des scènes. Chaque fonction écrit ses animations dans la timeline commune « tl »
// à partir de t0 (début de la scène). La transition diagonale occupe [t0 ; t0 + 0,95] ;
// la zone [t0 + 6,8 ; t0 + 9,9] ne contient que des mouvements lents (elle est rejouée en aller-retour).
window.SCENES = {};

// 1. Couverture -----------------------------------------------------------------------------
SCENES.cover = function (K, tl, f, t0) {
  var mts = K.qa(f, '.mt');
  var count = K.q(f, '.count');
  var T0 = t0 + 0.3, DT = 0.13;
  mts.forEach(function (m, k) {
    tl.set(m, { opacity: 1 }, T0 + k * DT);
    tl.set(m, { opacity: 0 }, T0 + (k + 1) * DT);
    tl.fromTo(m.querySelector('img'), { scale: 1.12 }, { scale: 1, duration: DT, ease: 'none' }, T0 + k * DT);
    K.cue(tl, 'tick', T0 + k * DT);
  });
  var end = T0 + mts.length * DT;
  var c = { v: 2008 };
  tl.fromTo(c, { v: 2008 }, {
    v: 2026, duration: mts.length * DT, ease: 'none', immediateRender: false,
    onUpdate: function () { count.textContent = Math.round(c.v); }
  }, T0);
  // Le compteur, géant au centre pendant le montage, rejoint sa place à côté de « 2008– ».
  var cx = count.offsetLeft + count.offsetWidth / 2, cy = count.offsetTop + count.offsetHeight / 2;
  tl.fromTo(count, { x: 960 - cx, y: 540 - cy, scale: 3.75 }, { x: 0, y: 0, scale: 1, duration: 1.1, ease: 'expo.inOut' }, end + 0.1);
  tl.fromTo(K.q(f, '.y0'), { opacity: 0, x: 40, filter: 'blur(12px)' }, { opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.9, ease: 'expo.out' }, end + 0.9);
  K.draw(tl, K.q(f, '.cover-line line'), end + 0.4, 1.1);
  K.cue(tl, 'whoosh', end + 0.4);
  tl.fromTo(K.qa(f, '.cover-title .rise'), { yPercent: 105 }, { yPercent: 0, duration: 1.3, ease: 'expo.out', stagger: 0.11 }, end + 0.7);
  tl.fromTo(K.q(f, '.wordmark'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out' }, end + 1.1);
  K.wordsIn(tl, K.qa(f, '.byline .w'), end + 1.3);
  K.drift(tl, K.q(f, '.cam'), t0 + 4.2, t0 + 11, { scale: 1 }, { scale: 1.025 });
};

// 2. Crossed : découpe laser ligne à ligne, puis pliage du profil en cinq temps -------------
SCENES['crossed-principe'] = function (K, tl, f, t0) {
  var sheet = K.q(f, '.sheet');
  var img = sheet.querySelector('img');
  var head = K.q(f, '.laser-head');
  var sparks = K.qa(f, '.spark');
  var W = 860, H = 960, ROWS = 12, RH = H / ROWS, T = 2.6, ts = t0 + 0.45;
  var pr = { p: 0 };
  function raster() {
    var P = pr.p * ROWS;
    var r = Math.min(ROWS - 1, Math.floor(P));
    var x = pr.p >= 1 ? W : (P - r) * W;
    var y0 = r * RH, y1 = (r + 1) * RH;
    img.style.clipPath = 'polygon(0px 0px,' + W + 'px 0px,' + W + 'px ' + y0 + 'px,' + x + 'px ' + y0 + 'px,' + x + 'px ' + y1 + 'px,0px ' + y1 + 'px)';
    var active = pr.p > 0 && pr.p < 1;
    head.style.opacity = active ? '1' : '0';
    head.style.transform = 'translate(' + x + 'px,' + y0 + 'px)';
    var tau = pr.p * T, life = 0.42;
    sparks.forEach(function (sp, k) {
      var phase = k * life / sparks.length;
      var age = (((tau - phase) % life) + life) % life;
      var te = tau - age;
      if (!active || te < 0) { sp.style.opacity = '0'; return; }
      var Pe = te / T * ROWS, re = Math.floor(Pe);
      var xe = (Pe - re) * W, ye = (re + 0.5) * RH;
      var vx = (K.hash(k, 1) - 0.7) * 700, vy = -160 - K.hash(k, 2) * 460;
      sp.style.opacity = String(1 - age / life);
      sp.style.transform = 'translate(' + (xe + vx * age) + 'px,' + (ye + vy * age + 1300 * age * age) + 'px)';
    });
  }
  raster();
  tl.fromTo(pr, { p: 0 }, { p: 1, duration: T, ease: 'none', onUpdate: raster, immediateRender: false }, ts);
  K.cue(tl, 'laser', ts);

  // Profil vu de côté, relevé sur le schéma : pied, avant d'assise, arrière d'assise, haut du dossier, dos.
  // La tôle part à plat sous le schéma ; chaque sommet rejoint sa place l'un après l'autre.
  var P = [[1241, 719], [1274, 711], [1196, 591], [1301, 575], [1357, 450], [1391, 735]];
  var F = [], acc = 0;
  for (var i = 0; i < P.length; i++) {
    if (i > 0) acc += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]) * 0.78;
    F.push([1170 + acc, 960]);
  }
  var q = [0, 0, 0, 0, 0, 0];
  var poly = K.q(f, '.profile');
  var nums = K.qa(f, '.fold-num');
  function shape() {
    var pts = P.map(function (p, k) {
      return [F[k][0] + (p[0] - F[k][0]) * q[k], F[k][1] + (p[1] - F[k][1]) * q[k]];
    });
    poly.setAttribute('points', pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' '));
    nums.forEach(function (n, j) {
      var v = pts[j + 1];
      n.setAttribute('transform', 'translate(' + (v[0] - 34).toFixed(1) + ',' + (v[1] - 26).toFixed(1) + ')');
    });
  }
  shape();
  var tf = t0 + 3.1;
  K.draw(tl, poly, tf, 0.5, { ease: 'power2.out' });
  K.cue(tl, 'draw', tf);
  var bands = K.qa(f, '.band');
  [0, 1, 2, 3, 4, 5].forEach(function (k) {
    var o = { v: 0 };
    var at = tf + 0.5 + k * 0.42;
    tl.fromTo(o, { v: 0 }, {
      v: 1, duration: 0.7, ease: 'power3.inOut', immediateRender: false,
      onUpdate: function () { q[k] = o.v; shape(); }
    }, at);
    if (k === 0) return;
    var j = k - 1;
    tl.fromTo(nums[j].firstElementChild, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)', transformOrigin: '50% 50%' }, at + 0.55);
    // la ligne de pli correspondante s'allume sur la tôle
    tl.fromTo(bands[4 - j], { opacity: 0 }, { opacity: 0.55, duration: 0.15, ease: 'power1.out' }, at + 0.3);
    tl.to(bands[4 - j], { opacity: 0.12, duration: 0.9, ease: 'power2.out' }, at + 0.5);
    K.cue(tl, 'tick', at + 0.55);
  });
  var fig = K.q(f, '.fold-img');
  tl.fromTo(fig, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.1, ease: 'power2.inOut' }, tf + 3.2);
  tl.to(nums, { opacity: 0, duration: 0.4, ease: 'power1.out' }, tf + 3.9);
  tl.to(poly, { opacity: 0, duration: 0.6, ease: 'power1.out' }, tf + 3.9);
  K.caption(tl, f, t0 + 0.7);
  // respiration : un balayage laser lent parcourt la tôle
  var scan = K.q(f, '.scan');
  tl.fromTo(scan, { opacity: 0, y: 0 }, { opacity: 0.65, duration: 0.6 }, t0 + 6.4);
  tl.fromTo(scan, { y: 0 }, { y: H, duration: 4.4, ease: 'none', immediateRender: false }, t0 + 6.6);
  K.drift(tl, sheet, t0 + 3.2, t0 + 11, { scale: 1 }, { scale: 1.02 });
};

// 3. Crossed de nuit : le mot dans le noir, puis les lumières s'allument -------------------
SCENES['crossed-nuit'] = function (K, tl, f, t0) {
  var cam = K.q(f, '.cam');
  var dark = K.q(f, '.dark');
  var spots = K.qa(f, '.spot');
  var chars = K.qa(f, '.bigword .ch');
  tl.fromTo(cam, { scale: 1.14, x: -40 }, { scale: 1, x: 0, duration: 6.2, ease: 'power2.out' }, t0);
  tl.fromTo(chars, { opacity: 0, yPercent: 40, filter: 'blur(18px)' },
    { opacity: 1, yPercent: 0, filter: 'blur(0px)', duration: 1.0, ease: 'expo.out', stagger: 0.06 }, t0 + 0.5);
  gsap.set(dark, { '--r1': '0px', '--r2': '0px', '--r3': '0px', '--r4': '0px' });
  function flick(spot, at) {
    tl.fromTo(spot, { opacity: 0 }, { opacity: 0.9, duration: 0.05 }, at);
    tl.to(spot, { opacity: 0.15, duration: 0.05 }, at + 0.09);
    tl.to(spot, { opacity: 1, duration: 0.08 }, at + 0.2);
    K.cue(tl, 'light', at);
  }
  flick(spots[0], t0 + 1.9);
  tl.fromTo(dark, { '--r1': '0px' }, { '--r1': '760px', duration: 1.8, ease: 'power2.out', immediateRender: false }, t0 + 1.95);
  flick(spots[1], t0 + 2.4);
  tl.fromTo(dark, { '--r2': '0px' }, { '--r2': '700px', duration: 1.8, ease: 'power2.out', immediateRender: false }, t0 + 2.45);
  flick(spots[2], t0 + 2.9);
  tl.fromTo(dark, { '--r3': '0px' }, { '--r3': '1300px', duration: 2.2, ease: 'power2.out', immediateRender: false }, t0 + 2.95);
  tl.fromTo(dark, { '--r4': '0px' }, { '--r4': '2400px', duration: 2.0, ease: 'power1.in', immediateRender: false }, t0 + 3.4);
  tl.fromTo(dark, { opacity: 1 }, { opacity: 0, duration: 1.2, ease: 'power1.inOut' }, t0 + 4.2);
  tl.fromTo(chars, { opacity: 1, yPercent: 0, filter: 'blur(0px)' },
    { opacity: 0, yPercent: -30, filter: 'blur(14px)', duration: 0.8, ease: 'power2.in', stagger: 0.04, immediateRender: false }, t0 + 3.1);
  K.caption(tl, f, t0 + 4.3);
  K.drift(tl, cam, t0 + 6.2, t0 + 11, { scale: 1, x: 0 }, { scale: 1.04, x: -24 });
  spots.forEach(function (sp, k) {
    tl.fromTo(sp, { opacity: 1 }, { opacity: 0.72, duration: 0.7 + k * 0.23, ease: 'sine.inOut', yoyo: true, repeat: 5, immediateRender: false }, t0 + 6.4);
  });
};

// 4. La famille Crossed : triptyque ---------------------------------------------------------
SCENES['crossed-famille'] = function (K, tl, f, t0) {
  K.caption(tl, f, t0 + 0.35);
  K.qa(f, '.pn').forEach(function (pn, k) {
    var at = t0 + 0.75 + k * 0.16;
    var img = pn.querySelector('img');
    tl.fromTo(pn, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.15, ease: 'power4.inOut' }, at);
    tl.fromTo(img, { y: 240, scale: 1.14 }, { y: 0, scale: 1, duration: 1.9, ease: 'expo.out' }, at);
    var tag = pn.querySelector('.tag');
    tl.fromTo(tag, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: 'expo.out' }, at + 1.1);
    K.wordsIn(tl, tag.querySelectorAll('.w'), at + 1.2, { y: 8, blur: 6, stagger: 0.04 });
    K.cue(tl, 'tick', at);
    K.drift(tl, img, t0 + 3.2, t0 + 11, { y: 0 }, { y: k % 2 ? 30 : -30 });
  });
};

// 5. Hilton : travelling du banc à la jardinière, puis vue d'ensemble ------------------------
SCENES.hilton = function (K, tl, f, t0) {
  var world = K.q(f, '.world');
  var tagA = K.q(f, '.tag-a'), tagB = K.q(f, '.tag-b');
  var cam = { fx: 335, fy: 665, s: 2.0 };
  function apply() {
    var s = cam.s;
    var tx = K.clamp(960 - cam.fx * s, 1920 - 1920 * s, 0);
    var ty = K.clamp(540 - cam.fy * s, 1080 - 1080 * s, 0);
    world.style.transform = 'translate(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px) scale(' + s.toFixed(4) + ')';
    tagA.style.transform = 'translate(' + (tx + 60 * s).toFixed(1) + 'px,' + (ty + 800 * s).toFixed(1) + 'px)';
    tagB.style.transform = 'translate(' + (tx + 1200 * s).toFixed(1) + 'px,' + (ty + 425 * s).toFixed(1) + 'px)';
  }
  apply();
  function move(to, at, dur, ease) {
    var from = { fx: cam.fx, fy: cam.fy, s: cam.s };
    tl.fromTo(cam, from, Object.assign({ duration: dur, ease: ease, onUpdate: apply, immediateRender: false }, to), at);
    cam.fx = to.fx; cam.fy = to.fy; cam.s = to.s;
  }
  move({ fx: 335, fy: 665, s: 2.25 }, t0, 2.7, 'power1.inOut');
  move({ fx: 1370, fy: 265, s: 2.1 }, t0 + 2.75, 1.4, 'power3.inOut');
  move({ fx: 1370, fy: 265, s: 2.2 }, t0 + 4.15, 0.6, 'none');
  move({ fx: 960, fy: 540, s: 1 }, t0 + 4.75, 1.5, 'power3.inOut');
  move({ fx: 900, fy: 520, s: 1.035 }, t0 + 6.25, 4.75, 'sine.inOut');
  K.cue(tl, 'whoosh', t0 + 2.75);
  K.cue(tl, 'whoosh', t0 + 4.75);

  K.draw(tl, f.querySelectorAll('.bk-a path'), t0 + 1.0, 0.6, { stagger: 0.06 });
  K.cue(tl, 'tick', t0 + 1.0);
  tl.fromTo(tagA, { clipPath: 'inset(0% 100% 0% 0%)', opacity: 1 }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'expo.out' }, t0 + 1.3);
  tl.to(tagA, { opacity: 0, duration: 0.3 }, t0 + 2.6);
  K.draw(tl, f.querySelectorAll('.bk-b path'), t0 + 3.7, 0.6, { stagger: 0.06 });
  K.cue(tl, 'tick', t0 + 3.7);
  tl.fromTo(tagB, { clipPath: 'inset(0% 100% 0% 0%)', opacity: 1 }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'expo.out' }, t0 + 3.95);
  tl.to(tagB, { opacity: 0, duration: 0.3 }, t0 + 4.6);
  K.caption(tl, f, t0 + 5.9);
};
