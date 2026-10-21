// Génère composition/index.html (la composition HyperFrames) et index.html (la page à ouvrir).
// Usage : node build/build.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { slides } from './slides.mjs';
import { html as custom } from './scenes.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const imgDir = path.join(root, 'composition', 'assets', 'img');

// Chaque scène dure LEN secondes ; la suivante commence STEP secondes plus tard,
// si bien que la seconde de recouvrement contient la transition (coupe diagonale).
const LEN = 11;
const STEP = 10;
const N = slides.length;
const total = (N - 1) * STEP + LEN;
const pad = (n) => String(n).padStart(2, '0');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Taille d'une image en pixels de slide (les fichiers sont extraits à 1,5×).
function jpegSize(file) {
  const b = fs.readFileSync(file);
  let i = 2;
  while (i < b.length) {
    const marker = b[i + 1];
    const len = b.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return [b.readUInt16BE(i + 7), b.readUInt16BE(i + 5)];
    }
    i += 2 + len;
  }
  throw new Error('taille introuvable : ' + file);
}
const sizes = {};
function size(src) {
  if (!sizes[src]) { const [w, h] = jpegSize(path.join(imgDir, src)); sizes[src] = [w / 1.5, h / 1.5]; }
  return sizes[src];
}

function words(text) {
  return esc(text).split(/\s+/).map((w) => `<span class="w">${w}</span>`).join(' ');
}

function caption(s, i) {
  const c = s.cap;
  if (!c) return '';
  // Légende dans le bandeau du bas, sous les images.
  return `
      <div class="cap bcap">
        <div class="cap-num"><span class="mask"><span class="num">${pad(i + 1)}</span></span><span class="tot">/${pad(N)}</span></div>
        <h2 class="cap-name">${words(c.name)}</h2>
        ${c.meta ? `<p class="cap-meta">${words(c.meta)}</p>` : ''}
      </div>`;
}

const K = { caption, size, words, esc };

// Scènes génériques (en attendant leur version sur mesure) : photos à leur place, entrées variées.
function generic(s, i) {
  const figs = (s.imgs || []).map((m) => {
    const b = `left:${m.x}px;top:${m.y}px;width:${m.w}px;height:${m.h}px`;
    return `
      <figure class="ph" data-rv="${m.rv}" data-o="${m.o || 0}" data-w="${m.w}" data-h="${m.h}" style="${b}"><img src="assets/img/${m.src}" alt="" /></figure>`;
  }).join('');
  let extra = '';
  if (s.fx === 'end') extra = `
      <div class="cover end">
        <p class="wordmark">Chapelet.</p>
        <svg class="cover-line" viewBox="0 0 1920 1080" aria-hidden="true"><line x1="1253" y1="377" x2="1625" y2="-38" /></svg>
        <p class="byline">${words('stephanechapelet.com')}</p>
        <h1 class="cover-title"><span class="mask"><span class="rise">Merci.</span></span></h1>
      </div>`;
  if (s.fx === 'glow') extra = `
      <div class="glow"></div>`;
  return figs + extra + caption(s, i);
}

function charsOf(htmlStr) {
  // data-chars : chaque lettre dans son propre span
  return htmlStr.replace(/<p class="bigword" data-chars>([^<]*)<\/p>/g, (_, t) =>
    `<p class="bigword">${[...t].map((c) => `<span class="ch">${esc(c)}</span>`).join('')}</p>`);
}

const scenes = slides.map((s, i) => ({ id: s.id, start: i * STEP, len: LEN, fx: s.fx || '', custom: !!custom[s.id], stepGap: s.stepGap || 0 }));

const sceneHtml = slides.map((s, i) => {
  const bg = s.bg ? ` style="background:${s.bg}"` : '';
  const body = custom[s.id] ? charsOf(custom[s.id](s, i, K)) : generic(s, i);
  return `
    <div id="sc-${s.id}" class="scene-frame clip" data-composition-id="${s.id}" data-start="${i * STEP}" data-duration="${LEN}" data-track-index="1" data-label="${esc(s.label)}" data-theme="${s.theme || 'light'}" style="z-index:${i + 1}">
      <div class="inner"${bg}>${body}
      </div>
    </div>`;
}).join('\n');

// Îlot du diaporama : la plage [start + 7 ; start + 9,9] place l'image de repos sur la scène construite.
const island = JSON.stringify({
  slides: slides.map((s, i) => ({ sceneId: s.id, startTime: i * STEP + 7, endTime: i * STEP + 9.9, notes: s.notes || '' })),
  slideSequences: [],
}, null, 2);

const css = fs.readFileSync(path.join(here, 'deck.css'), 'utf8');
const js = fs.readFileSync(path.join(here, 'deck.js'), 'utf8');
const choreo = fs.readFileSync(path.join(here, 'choreo.js'), 'utf8');

const composition = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <title>Mobilier urbain, Stéphane Chapelet</title>
    <script src="assets/js/gsap.min.js"></script>
    <style>
${css}
    </style>
  </head>
  <body>
    <script type="application/hyperframes-slideshow+json">
${island}
    </script>
    <div id="deck" data-composition-id="root" data-start="0" data-duration="${total}" data-width="1920" data-height="1080">
${sceneHtml}
      <svg id="cut" data-layout-allow-overflow viewBox="0 0 1920 1080" aria-hidden="true"><line id="cutline" x1="0" y1="0" x2="0" y2="1080" /></svg>
      <div id="progress" aria-hidden="true"><i></i></div>
    </div>
    <script>
      window.DECK = ${JSON.stringify({ total, step: STEP, len: LEN, scenes })};
    </script>
    <script>
${choreo}
    </script>
    <script>
${js}
    </script>
  </body>
</html>
`;

const sfx = fs.readFileSync(path.join(here, 'sfx.js'), 'utf8');

const wrapper = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mobilier urbain, Stéphane Chapelet</title>
    <script src="lib/hyperframes-player.global.js"></script>
    <script src="lib/hyperframes-slideshow.global.js"></script>
    <style>
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { width: 100%; height: 100%; overflow: hidden; background: #121212; }
      hyperframes-slideshow:focus { outline: none; }
    </style>
  </head>
  <body>
    <hyperframes-slideshow tabindex="0" sound notes-storage-key="chapelet-mobilier-urbain" style="display: block; position: relative; width: 100vw; height: 100vh">
      <hyperframes-player interactive assets-loading-ui="none" style="position: absolute; inset: 0" src="composition/index.html?live"></hyperframes-player>
      <!-- Copie de l'îlot de composition/index.html (généré par build/build.mjs) -->
      <script type="application/hyperframes-slideshow+json">
${island}
      </script>
    </hyperframes-slideshow>
    <script>
      // Navigation : clic sur la slide, télécommande de présentation (PageSuivante / PagePrécédente).
      (function () {
        var ss = document.querySelector('hyperframes-slideshow');
        if (/[?&]capture\\b/.test(location.search)) ss.querySelector('hyperframes-player').setAttribute('src', 'composition/index.html?live&capture');
        function go(dir) {
          var c = ss.controller;
          if (!c) return;
          if (dir > 0) c.next(); else c.prev();
        }
        window.addEventListener('message', function (e) {
          if (e.data && e.data.type === 'deck-nav') go(e.data.dir);
        });
        document.addEventListener('keydown', function (e) {
          if (e.key === 'PageDown' || e.key === 'ArrowDown' || e.key === 'Enter') { go(1); e.preventDefault(); }
          else if (e.key === 'PageUp' || e.key === 'ArrowUp') { go(-1); e.preventDefault(); }
        });
        ss.addEventListener('click', function (e) {
          if (e.target.closest('button, a, input, textarea, [role="button"]')) return;
          go(1);
        });
        ss.focus();
      })();
    </script>
    <script>
${sfx}
    </script>
  </body>
</html>
`;

fs.writeFileSync(path.join(root, 'composition', 'index.html'), composition);
fs.writeFileSync(path.join(root, 'index.html'), wrapper);
console.log(`${N} scènes, ${total}s de timeline`);
