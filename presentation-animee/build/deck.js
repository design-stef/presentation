// Moteur du deck.
// Toute l'animation vit dans UNE timeline GSAP « root », découpée en scènes de D.len secondes
// qui se chevauchent d'une seconde (la transition diagonale vit dans ce chevauchement).
// - Rendu / capture : la timeline est simplement positionnée (seek), image par image.
// - Présentation (?live) : au changement de slide, on joue la scène depuis son début,
//   puis la fin de la scène « respire » en aller-retour tant qu'on reste dessus.
(function () {
  var D = window.DECK;
  var N = D.scenes.length;
  var LIVE = /[?&]live\b/.test(location.search);
  // ?capture : photos automatiques (le temps virtuel du navigateur avance par grands sauts).
  if (/[?&]capture\b/.test(location.search)) gsap.ticker.lagSmoothing(0);
  var RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var SLOPE = 968; // décalage horizontal de la diagonale de couverture sur 1080 px
  var WIPE = 0.95;
  var HOLD_END = D.step - 0.1; // fin de la partie jouée d'une scène (avant la transition suivante)
  var IDLE_FROM = 6.8; // début de la zone de respiration
  var frames = D.scenes.map(function (s) { return document.getElementById('sc-' + s.id); });
  var cutSvg = document.getElementById('cut');
  var cutLine = document.getElementById('cutline');
  var bar = document.querySelector('#progress i');
  var root = gsap.timeline({ paused: true });

  // ---------------------------------------------------------------- outils
  function sendCue(name) {
    if (!LIVE || window.parent === window) return;
    try { window.parent.postMessage({ type: 'hf-sfx', name: name }, '*'); } catch (e) {}
  }

  var K = {
    LIVE: LIVE,
    q: function (el, sel) { return el.querySelector(sel); },
    qa: function (el, sel) { return Array.prototype.slice.call(el.querySelectorAll(sel)); },
    // pseudo-hasard déterministe dans [0, 1]
    hash: function (i, j) {
      var n = (i * 374761393 + j * 668265263) | 0;
      n = Math.imul(n ^ (n >>> 13), 1274126177);
      n = n ^ (n >>> 16);
      return (n >>> 0) / 4294967295;
    },
    cue: function (tl, name, t) { tl.call(sendCue, [name], t); },
    clamp: function (v, a, b) { return Math.max(a, Math.min(b, v)); },

    // Légende : cartouche qui s'ouvre, numéro qui roule, mots qui sortent du flou.
    caption: function (tl, f, t) {
      var cap = f.querySelector('.cap');
      if (!cap) return;
      if (cap.classList.contains('cap--plate')) {
        var fromRight = cap.classList.contains('cap--tr') || cap.classList.contains('cap--br');
        tl.fromTo(cap, { clipPath: fromRight ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.8, ease: 'expo.out' }, t);
        t += 0.12;
      }
      var num = cap.querySelector('.num');
      var tot = cap.querySelector('.tot');
      if (num) tl.fromTo(num, { yPercent: 110 }, { yPercent: 0, duration: 0.8, ease: 'expo.out' }, t);
      if (tot) tl.fromTo(tot, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power1.out' }, t + 0.2);
      tl.fromTo(cap.querySelectorAll('.cap-name .w'), { opacity: 0, yPercent: 50, filter: 'blur(14px)' },
        { opacity: 1, yPercent: 0, filter: 'blur(0px)', duration: 0.9, ease: 'expo.out', stagger: 0.07 }, t + 0.08);
      tl.fromTo(cap.querySelectorAll('.cap-meta .w'), { opacity: 0, y: 12, filter: 'blur(8px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, ease: 'expo.out', stagger: 0.035 }, t + 0.32);
      K.cue(tl, 'tick', t);
    },

    // Apparition d'une image par un masque. kind : up, down, left, right, diag, iris, pop, light, draw.
    reveal: function (tl, fig, kind, t, o) {
      o = o || {};
      var img = fig.querySelector('img');
      var dur = o.dur || 1.1;
      if (kind === 'pop') {
        tl.fromTo(fig, { opacity: 0, y: 36, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'expo.out' }, t);
        return;
      }
      if (kind === 'light') {
        tl.fromTo(fig, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'power1.out' }, t);
        if (img) tl.fromTo(img, { scale: 1.08, filter: 'brightness(0.1) saturate(0.3)' },
          { scale: 1, filter: 'brightness(1) saturate(1)', duration: 2.8, ease: 'power2.out' }, t);
        return;
      }
      if (kind === 'diag') {
        var w = o.w || Number(fig.getAttribute('data-w')), h = o.h || Number(fig.getAttribute('data-h'));
        var p = { t: -h * 0.896 - 10 };
        var apply = function () {
          fig.style.clipPath = 'polygon(-2000px 0px, ' + (p.t + h * 0.896) + 'px 0px, ' + p.t + 'px ' + h + 'px, -2000px ' + h + 'px)';
        };
        apply();
        tl.fromTo(p, { t: -h * 0.896 - 10 }, { t: w + 10, duration: 1.15, ease: 'power3.inOut', onUpdate: apply, immediateRender: false }, t);
      } else if (kind === 'iris') {
        tl.fromTo(fig, { clipPath: 'circle(0% at 50% 55%)' }, { clipPath: 'circle(80% at 50% 55%)', duration: 1.3, ease: 'power3.inOut' }, t);
      } else {
        var from = {
          up: 'inset(100% 0% 0% 0%)', down: 'inset(0% 0% 100% 0%)', laser: 'inset(0% 0% 100% 0%)',
          left: 'inset(0% 100% 0% 0%)', draw: 'inset(0% 100% 0% 0%)', right: 'inset(0% 0% 0% 100%)'
        }[kind] || 'inset(100% 0% 0% 0%)';
        tl.fromTo(fig, { clipPath: from }, { clipPath: 'inset(0% 0% 0% 0%)', duration: kind === 'draw' ? 1.8 : dur, ease: kind === 'draw' ? 'power2.inOut' : 'power4.inOut' }, t);
        if (kind === 'draw') return;
      }
      if (img && o.zoom !== false) tl.fromTo(img, { scale: 1.14 }, { scale: 1, duration: 2.3, ease: 'expo.out' }, t);
    },

    // Mouvement lent continu (caméra qui dérive) entre t0 et t1.
    drift: function (tl, el, t0, t1, from, to) {
      tl.fromTo(el, from, Object.assign({ duration: t1 - t0, ease: 'sine.inOut', immediateRender: false }, to), t0);
    },

    // Tracé de traits SVG (stroke-dashoffset), longueurs mesurées une fois à la construction.
    draw: function (tl, els, t, dur, o) {
      o = o || {};
      els = els.length === undefined ? [els] : els;
      Array.prototype.forEach.call(els, function (el, k) {
        var len = el.getTotalLength ? el.getTotalLength() + 2 : 1000;
        tl.fromTo(el, { strokeDasharray: len, strokeDashoffset: len },
          { strokeDashoffset: 0, duration: dur, ease: o.ease || 'power3.inOut' }, t + k * (o.stagger || 0));
      });
    },

    // Mots qui sortent du flou.
    wordsIn: function (tl, els, t, o) {
      o = o || {};
      tl.fromTo(els, { opacity: 0, y: o.y || 14, filter: 'blur(' + (o.blur || 10) + 'px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: o.dur || 0.7, ease: 'expo.out', stagger: o.stagger || 0.05 }, t);
    }
  };

  // ------------------------------------------------- scènes sans chorégraphie dédiée
  function generic(tl, f, t0, s) {
    var figs = K.qa(f, '.ph[data-rv]');
    var gap = s.stepGap || 0.16;
    var base = t0 + 0.35 + (s.stepGap ? 0.5 : 0);
    figs.forEach(function (fig) {
      K.reveal(tl, fig, fig.getAttribute('data-rv'), base + Number(fig.getAttribute('data-o') || 0) * gap);
    });
    K.caption(tl, f, s.stepGap ? t0 + 0.35 : t0 + 0.9);
    if (figs[0] && figs[0].querySelector('img') && figs[0].getAttribute('data-rv') !== 'draw') {
      K.drift(tl, figs[0].querySelector('img'), t0 + 2.6, t0 + s.len, { scale: 1 }, { scale: 1.05 });
    }
    if (s.fx === 'end') {
      K.draw(tl, f.querySelector('.cover-line line'), t0 + 0.4, 1.0);
      tl.fromTo(f.querySelectorAll('.cover-title .rise'), { yPercent: 105 }, { yPercent: 0, duration: 1.2, ease: 'expo.out' }, t0 + 0.6);
      tl.fromTo(f.querySelector('.wordmark'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out' }, t0 + 0.6);
      K.wordsIn(tl, f.querySelectorAll('.byline .w'), t0 + 1.1);
    }
    if (s.fx === 'glow') {
      tl.fromTo(f.querySelector('.glow'), { opacity: 0, scaleY: 0.4 }, { opacity: 1, scaleY: 1, duration: 2.2, ease: 'power2.out' }, t0 + 1.4);
    }
  }

  // ------------------------------------------------------- transition diagonale
  function wipe(k) {
    var t0 = D.scenes[k].start;
    var inner = frames[k].querySelector('.inner');
    var p = { t: -SLOPE - 20 };
    function apply() {
      inner.style.clipPath = 'polygon(-2000px 0px, ' + (p.t + SLOPE) + 'px 0px, ' + p.t + 'px 1080px, -2000px 1080px)';
      cutLine.setAttribute('x1', p.t + SLOPE); cutLine.setAttribute('y1', 0);
      cutLine.setAttribute('x2', p.t); cutLine.setAttribute('y2', 1080);
    }
    apply();
    root.set(cutSvg, { opacity: 1 }, t0);
    root.fromTo(p, { t: -SLOPE - 20 }, { t: 1940, duration: WIPE, ease: 'power3.inOut', onUpdate: apply, immediateRender: false }, t0);
    root.set(cutSvg, { opacity: 0 }, t0 + WIPE);
    K.cue(root, 'whoosh', t0);
  }

  // --------------------------------------------------------- visibilité des scènes
  var shown = [];
  function vis(t) {
    for (var k = 0; k < N; k++) {
      var s = D.scenes[k];
      var on = t >= s.start && (t < s.start + s.len || (k === N - 1 && t <= D.total));
      if (shown[k] === on) continue;
      shown[k] = on;
      var f = frames[k];
      f.style.opacity = on ? '1' : '0';
      f.style.visibility = on ? 'visible' : 'hidden';
      f.style.pointerEvents = on ? 'auto' : 'none';
    }
  }

  // ------------------------------------------------------------------ construction
  function build() {
    gsap.set(bar, { scaleY: 0 });
    for (var k = 0; k < N; k++) {
      var s = D.scenes[k];
      var f = frames[k];
      if (k > 0) wipe(k);
      root.fromTo(bar, { scaleY: k / N }, { scaleY: (k + 1) / N, duration: 0.9, ease: 'expo.out', immediateRender: false }, s.start + 0.3);
      var fn = window.SCENES && window.SCENES[s.id];
      if (fn) fn(K, root, f, s.start, s); else generic(root, f, s.start, s);
    }
    root.eventCallback('onUpdate', function () { vis(getTime()); });
    window.__timelines = window.__timelines || {};
    window.__timelines["root"] = root;
    hookTime();
    setTime(0, true);
    if (window.parent !== window) setTimeout(postTimeline, 300);
  }

  // ------------------------------------------------- lecture pilotée par le lecteur
  var orig = {};
  ['seek', 'time', 'totalTime', 'progress', 'totalProgress'].forEach(function (m) { orig[m] = root[m]; });
  // busy : GSAP rappelle en interne les méthodes interceptées (time → totalTime) ; on ne réagit qu'au premier appel.
  var busy = false;
  function getTime() { return orig.time.call(root); }
  function setTime(t, suppress) {
    busy = true;
    try { orig.time.call(root, t, !!suppress); } finally { busy = false; }
    vis(t);
  }

  var cur = -1;
  var play = { t: 0 };
  var playTween = null;

  function indexAt(t) {
    for (var k = N - 1; k >= 0; k--) if (t >= D.scenes[k].start - 1e-6) return k;
    return 0;
  }
  function tick() { setTime(play.t, false); }

  function navigate(k) {
    var prev = cur;
    cur = k;
    if (playTween) { playTween.kill(); playTween = null; }
    var s = D.scenes[k];
    if (RM) { setTime(s.start + HOLD_END, true); play.t = s.start + HOLD_END; return; }
    // En avançant d'une slide, on joue la transition ; sinon on arrive juste après.
    var from = (k === 0 || prev === k - 1) ? s.start : s.start + 1.0;
    setTime(from, true);
    play.t = from;
    playTween = gsap.to(play, {
      t: s.start + HOLD_END, duration: s.start + HOLD_END - from, ease: 'none', onUpdate: tick,
      onComplete: function () {
        playTween = gsap.fromTo(play, { t: s.start + HOLD_END }, {
          t: s.start + IDLE_FROM, duration: 3.1, ease: 'sine.inOut', yoyo: true, repeat: 999, onUpdate: tick
        });
      }
    });
  }

  // Le lecteur déplace la tête de lecture (seek sans événement) : on réagit à chaque appel.
  function external() {
    var t = getTime();
    if (!LIVE) { vis(t); return; }
    var k = indexAt(t);
    if (k === cur) { setTime(play.t, true); return; }
    navigate(k);
  }
  function hookTime() {
    Object.keys(orig).forEach(function (m) {
      root[m] = function () {
        if (busy) return orig[m].apply(root, arguments);
        busy = true;
        var r;
        try { r = orig[m].apply(root, arguments); } finally { busy = false; }
        if (arguments.length) external();
        return r;
      };
    });
  }

  // Plage de temps de chaque scène, pour <hyperframes-slideshow> hors moteur.
  function postTimeline() {
    try {
      window.parent.postMessage({
        source: 'hf-preview', type: 'timeline', durationInFrames: Math.round(D.total * 30),
        scenes: D.scenes.map(function (s) { return { id: s.id, start: s.start, duration: s.len }; })
      }, '*');
    } catch (e) {}
  }

  // Clic = slide suivante, comme PowerPoint. Les touches tapées dans la slide sont renvoyées à la page.
  var NEXT = { ArrowRight: 1, ArrowDown: 1, PageDown: 1, ' ': 1, Enter: 1, ArrowLeft: -1, ArrowUp: -1, PageUp: -1, Backspace: -1 };
  function nav(dir) { if (window.parent !== window) window.parent.postMessage({ type: 'deck-nav', dir: dir }, '*'); }
  document.addEventListener('click', function () { nav(1); });
  document.addEventListener('keydown', function (e) {
    if (NEXT[e.key]) { nav(NEXT[e.key]); e.preventDefault(); }
  });

  for (var k = 0; k < N; k++) { frames[k].style.opacity = '0'; frames[k].style.visibility = 'hidden'; }
  // On construit une fois la police et toutes les photos chargées, pour un premier passage net.
  var loaded = document.readyState === 'complete' ? Promise.resolve() : new Promise(function (r) { window.addEventListener('load', r); });
  Promise.all([loaded, document.fonts ? document.fonts.ready : null]).then(build);
})();
