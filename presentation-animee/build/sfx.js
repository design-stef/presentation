// Bruitages discrets, synthétisés dans le navigateur (aucun fichier son).
// La composition envoie { type: 'hf-sfx', name } ; le bouton muet du lecteur les coupe.
(function () {
  var ss = document.querySelector('hyperframes-slideshow');
  var ctx = null, master = null, muted = false, noise = null;

  function audio() {
    if (!ctx) {
      var C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ctx = new C();
      master = ctx.createGain();
      master.gain.value = 0.55;
      master.connect(ctx.destination);
      var n = ctx.sampleRate * 4.5, b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0), s = 22695477;
      for (var i = 0; i < n; i++) { s = (Math.imul(s, 1103515245) + 12345) | 0; d[i] = ((s >>> 8) & 0xffff) / 32768 - 1; }
      noise = b;
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  window.addEventListener('pointerdown', audio, true);
  window.addEventListener('keydown', audio, true);
  ss.addEventListener('hf-sound', function (e) { muted = !!(e.detail && e.detail.muted); });

  function env(g, t, a, peak, d) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  }
  function noiseSrc(t, dur) {
    var src = ctx.createBufferSource();
    src.buffer = noise;
    src.start(t, (t * 7.3) % 1.5, dur + 0.05);
    return src;
  }
  function chain(nodes) { for (var i = 0; i < nodes.length - 1; i++) nodes[i].connect(nodes[i + 1]); nodes[nodes.length - 1].connect(master); }

  var SFX = {
    // souffle de la coupe diagonale
    whoosh: function (t) {
      var src = noiseSrc(t, 0.7), bp = ctx.createBiquadFilter(), g = ctx.createGain();
      bp.type = 'bandpass'; bp.Q.value = 1.4;
      bp.frequency.setValueAtTime(380, t); bp.frequency.exponentialRampToValueAtTime(2600, t + 0.45);
      env(g, t, 0.18, 0.32, 0.5);
      chain([src, bp, g]);
    },
    // petit clic sec (mots, repères)
    tick: function (t) {
      var src = noiseSrc(t, 0.05), hp = ctx.createBiquadFilter(), g = ctx.createGain();
      hp.type = 'highpass'; hp.frequency.value = 3200;
      env(g, t, 0.002, 0.22, 0.04);
      chain([src, hp, g]);
    },
    // découpe laser : sifflement aigu et grésillement
    laser: function (t) {
      var o = ctx.createOscillator(), g = ctx.createGain(), lp = ctx.createBiquadFilter();
      o.type = 'sawtooth'; o.frequency.setValueAtTime(1650, t);
      lp.type = 'lowpass'; lp.frequency.value = 4200;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.025, t + 0.08);
      g.gain.setValueAtTime(0.025, t + 2.5); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.7);
      o.start(t); o.stop(t + 2.8);
      chain([o, lp, g]);
      var src = noiseSrc(t, 2.7), hp = ctx.createBiquadFilter(), g2 = ctx.createGain();
      hp.type = 'highpass'; hp.frequency.value = 5000;
      g2.gain.setValueAtTime(0.0001, t); g2.gain.exponentialRampToValueAtTime(0.05, t + 0.1);
      g2.gain.setValueAtTime(0.05, t + 2.4); g2.gain.exponentialRampToValueAtTime(0.0001, t + 2.7);
      chain([src, hp, g2]);
    },
    // interrupteur puis bourdonnement de lampe
    light: function (t) {
      SFX.tick(t);
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.value = 100;
      env(g, t + 0.01, 0.05, 0.06, 0.7);
      o.start(t); o.stop(t + 0.9);
      chain([o, g]);
    },
    // choc sourd (béton, moule)
    thud: function (t) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.3);
      env(g, t, 0.005, 0.35, 0.32);
      o.start(t); o.stop(t + 0.4);
      chain([o, g]);
    },
    // crayon sur papier
    draw: function (t) {
      var src = noiseSrc(t, 1.3), bp = ctx.createBiquadFilter(), g = ctx.createGain();
      bp.type = 'bandpass'; bp.frequency.value = 2400; bp.Q.value = 0.8;
      g.gain.setValueAtTime(0.0001, t);
      for (var k = 0; k < 6; k++) {
        g.gain.exponentialRampToValueAtTime(0.06, t + k * 0.2 + 0.05);
        g.gain.exponentialRampToValueAtTime(0.012, t + k * 0.2 + 0.17);
      }
      g.gain.exponentialRampToValueAtTime(0.0001, t + 1.3);
      chain([src, bp, g]);
    }
  };

  window.addEventListener('message', function (e) {
    var d = e.data;
    if (!d || d.type !== 'hf-sfx' || muted) return;
    // en mode présentateur, seul l'onglet public fait du bruit
    var mode = ss.getAttribute('mode');
    if (mode && mode !== 'audience') return;
    var player = document.querySelector('hyperframes-player');
    if (player && player.iframeElement && e.source !== player.iframeElement.contentWindow) return;
    var c = audio();
    if (!c || c.state !== 'running') return;
    (SFX[d.name] || SFX.tick)(c.currentTime + 0.01);
  });
})();
