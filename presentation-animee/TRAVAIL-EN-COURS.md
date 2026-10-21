# Passation — présentation animée « Mobilier urbain »

Document pour la session qui reprend le travail (dans le cloud). À lire en entier avant de toucher au code.

## Le projet en une phrase
Stéphane Chapelet (designer de mobilier urbain, studio à Cannes) présente son travail en cours, devant des étudiants,
à partir de son PDF de 27 pages. Il veut une présentation **vraiment animée (motion design)**, qui avance **au clic comme
PowerPoint**, dans le style de son site https://www.stephanechapelet.com/. Elle est construite avec **HyperFrames**.

## Ce que l'auteur a demandé (dans l'ordre)
1. Une animation par slide, au clic, motion design très graphique inspiré du site.
   Utiliser les skills `hyperframes`, `taste-skill` (design-taste-frontend), `impeccable`, `emil-design-eng`
   (copiés dans `.claude/skills/` à la racine du dépôt).
2. Un clic = une slide. Légendes déduites du site (validées : « tout est ok »).
3. « Pas simplement des slides avec transition » : de vraies animations sur chaque slide.
   Réponses aux questions : **recomposer librement** chaque slide ; **séquence de 5 à 10 s puis vie légère** ;
   vocabulaire : **dessin technique, grande typographie, caméra et parallaxe, matière** ; **bruitages discrets**.
4. Retour sur les 5 premières scènes refaites (dernier retour, à appliquer partout) :
   - **« Les textes prennent trop de place, et cachent l'image parfois »** → légendes nettement plus petites,
     jamais sur le sujet d'une photo. Préférer un blanc de la slide, ou une petite étiquette dans un coin vide.
     Le grand cartouche blanc posé sur les photos (`.cap--plate`) est à abandonner ou à réduire fortement.
   - **« Je n'aime pas les effets de lumière »** → supprimer tous les halos, lueurs et allumages : scène 3
     (lampes qui s'allument, masque sombre), lueur et étincelles du laser en scène 2, halo `.glow` de KJ (scène 23),
     brillance `light` des anciennes entrées. Pas de `box-shadow` lumineux, pas de `radial-gradient` décoratif.
   - **« Le pliage de Crossed n'est pas compréhensible »** → à repenser (voir plus bas).
5. **« Fait toutes les slides dans le cloud, même si j'éteins mon ordi »** → c'est cette session.

## Où en est le code
- Scènes 1 à 5 : refaites en motion design (à corriger selon le point 4).
- Scènes 6 à 28 : encore « génériques » (photos à leur place du PDF, volets, légende). **Toutes à refaire.**

## Architecture (dossier `presentation-animee/`)
- `build/slides.mjs` : contenu de chaque slide (légendes, notes, images de la version générique).
- `build/scenes.mjs` : gabarits HTML des scènes recomposées (une fonction par id de slide). `crop()` recadre une image
  sur un point d'intérêt, `brackets()` dessine des coins de cadrage SVG.
- `build/choreo.js` : chorégraphies GSAP, une fonction `SCENES[id](K, tl, f, t0, s)` par scène recomposée.
- `build/deck.js` : moteur (timeline unique, transition diagonale, visibilité, lecture en direct, navigation au clic).
- `build/deck.css` : styles. `build/sfx.js` : bruitages synthétisés en WebAudio (aucun fichier son).
- `build/build.mjs` : génère `composition/index.html` (la composition HyperFrames) et `index.html` (la page à ouvrir).
- `composition/assets/img/` : photos extraites du PDF (à 1,5×). `build/source/pages/` : chaque page du PDF en entier,
  `build/source/layout.json` : position de chaque photo dans sa page (coordonnées d'une slide 1920 × 1080).
- `build/tools/` : `measure.mjs` (grille chiffrée sur une image pour relever des coordonnées), `sheet3.mjs`
  (planche contact), `crops.mjs`. Faire `npm install` dans ce dossier une fois.

### La timeline
- Une seule timeline GSAP `root`. Scène k : début `10·k`, durée 11 s. La seconde de recouvrement contient la
  transition diagonale de la scène suivante (`wipe()` dans `deck.js`).
- Dans une scène : `[t0 ; t0+0,95]` transition ; chorégraphie jusqu'à ~`t0+6,5` ;
  **`[t0+6,8 ; t0+9,9]` = zone de respiration, rejouée en aller-retour** pendant que l'orateur parle :
  n'y mettre que des mouvements lents et continus (dérive de caméra, parallaxe), aucune entrée, aucun son.
- Tout doit être déterministe et « seekable » : `fromTo`, `immediateRender: false` quand un élément a déjà une
  animation sur la même propriété, pas de `Math.random` (utiliser `K.hash`), pas de mesure DOM dans les callbacks.
- Mode `?live` (la page `index.html`) : à chaque changement de slide, la scène est jouée depuis son début puis
  respire. Sans `?live` (rendu, captures, `hyperframes present`), la timeline est simplement positionnée.
- Bruitages : `K.cue(tl, 'whoosh' | 'tick' | 'laser' | 'light' | 'thud' | 'draw', t)`. Garder discret.
  (Supprimer `light` avec les effets de lumière.)

### Vérifier
```
node build/build.mjs
cd composition && npx hyperframes check            # doit rester à 0 erreur
npx hyperframes snapshot . -o /tmp/snap --no-end --at 10.5,12,14,16,18.5   # images exactes à ces instants
```
Lire les planches `contact-sheet*.jpg` produites. Pour tester la page réelle : `node serve.mjs` (port 4173), puis
Chrome headless `--virtual-time-budget=6000 --screenshot` sur `http://localhost:4173/?capture`.

## Direction artistique (à respecter)
- Site de l'auteur : Inter 600, interlettrage serré (-0,045em), fond blanc, encre #121212, gris #6F6B65,
  numéros « 04/28 » avec le total en petit. Pas de dégradés, pas d'ombres, pas d'icônes, pas d'eyebrows.
- **Signature** : la diagonale de la couverture (48°), utilisée pour la transition entre slides.
- **Moins de texte, plus d'image.** Les photos sont le sujet. Texte : nom du projet + une ligne, petit,
  dans un blanc. La grande typographie est permise comme élément graphique ponctuel (titre géant qui traverse,
  puis disparaît), jamais posée durablement sur une photo.
- Motion : entrées `expo.out`, déplacements `power3/power4.inOut`, pas de rebond sauf micro-détails ;
  caméra et parallaxe, masques (volets, diagonales, iris), dessin technique (traits, cotes sans chiffres
  inventés, coins de cadrage, flèches), photos découpées en bandes ou tuiles qui se recomposent.
- Ne jamais inventer de faits (dimensions, dates, clients). Textes existants : `build/slides.mjs`.

## Le pliage de Crossed (scène 2) — à refaire, piste recommandée
Le panneau découpé (`p02-panel.jpg`) porte 5 bandes de pliage numérotées, à y = 115, 272, 412, 607, 947
(coordonnées slide ; le panneau va de x 195 à 915, y 72 à 993). Le schéma `p02-fold.jpg` montre le banc plié.
Faire comprendre « cette tôle plate devient ce banc » : découper l'image du panneau en 6 bandes horizontales
le long des lignes de pliage et les **plier en vraie 3D CSS** (chaîne d'éléments imbriqués en `preserve-3d`,
chaque bande pivote en `rotateX` autour de sa charnière), vue en légère perspective, pli après pli avec le numéro
du pli affiché au moment où il se fait ; terminer en fondu vers le schéma. Profil vu de côté relevé sur le
schéma (pied → avant d'assise → arrière d'assise → haut du dossier → dos) :
`[[1241,719],[1274,711],[1196,591],[1301,575],[1357,450],[1391,735]]`.
Ne garder la découpe laser que comme un trait net (sans lueur ni étincelles), ou la supprimer.

## Plan des scènes 6 à 28 (sans effets de lumière)
- 6 Zadig (rendu de nuit) : la photo apparaît à travers une trame de perforations (cercles qui grossissent,
  masque SVG), puis lente avancée de caméra.
- 7 Zadig Bergen / Milan : le détail perforé plein écran (macro) rétrécit à sa place pendant que les deux
  autres photos glissent ; deux petites étiquettes de lieu.
- 8 Du croquis au banc : les croquis se dessinent (révélation au trait), le rendu s'assemble latte par latte
  (bandes horizontales qui glissent) ; les annotations manuscrites réelles du croquis sont reprises en petit texte
  tapé : « plat découpé laser », « plat cintré puis soudé », « inox poli miroir », « plaque cache boulonnage au sol ».
- 9 Alassio : panoramique lent sur la photo du front de mer, le mot « Alassio » géant traverse le ciel puis sort ;
  la photo du parc glisse en colonne.
- 10 Emme Monte-Carlo : avancée de caméra le long de la promenade, coins de cadrage sur un transat Emme,
  la vue de Monaco arrive en vignette.
- 11 Variations : le banc circulaire se révèle par un balayage angulaire (comme une aiguille), cercles de
  construction tracés autour ; la composition en S glisse.
- 12 Variations, esquisse : l'esquisse se dessine, caméra qui pousse vers le dossier.
- 13 Variations Paris : on part de la vue aérienne plein écran, zoom vers la place, fondu vers la photo au sol.
- 14 Emme, moulage : les 4 étapes du moule arrivent l'une après l'autre avec un geste propre à chacune
  (le moule, la coulée qui monte, le retournement à 180°, le démoulage qui se soulève), libellés courts.
- 15 Les moules : la photo se recompose en bandes (comme des planches de coffrage), puis travelling.
- 16 Emme Djeddah : la vue aérienne verticale défile (survol de la corniche), puis la photo des bancs entre.
- 17 Banc béton et bois / 18 Banc acier et béton : mise au point (flou → net), coins de cadrage et traits de
  cote sans chiffres autour du banc, petites étiquettes des matériaux.
- 19 Ligne : photo dans les fontaines, le schéma se trace ; grand profil en I dessiné au trait.
- 20 Banc monolithe : la photo de la baie glisse, le schéma se trace et ses flèches se dessinent.
- 21 Banc et jardinières : les objets sont « posés » un à un (petite descente, ombre au sol qui apparaît).
- 22 Monaco : de la vue du port au crépuscule vers les photos du banc et de la jardinière (grille qui s'assemble).
- 23 KJ (fond noir) : **sans halo** ; le luminaire se dessine au trait puis la photo apparaît, lente rotation de
  caméra.
- 24 KJ Design Plus : panoramique dans le ciel, un cercle se trace autour du badge du prix.
- 25 KJ technique : vue de côté puis vue de face, traits de rappel vers « capot ouvrant » et « module LED ».
- 26 Le moule : les trois photos montent en colonnes comme des passes d'usinage.
- 27 Fonderie : les 5 étapes s'allument une par une (les autres atténuées), un grand numéro 1→5 défile à côté.
- 28 Merci : la diagonale revient, « Merci. » monte, l'adresse du site.

## Livraison
- Committer et pousser régulièrement (un commit par lot de scènes) pour que rien ne se perde.
- Quand tout est fini et vérifié (check à 0 erreur, planches relues), l'auteur récupère le dossier en local :
  sur GitHub, bouton **Code → Download ZIP**, ou en demandant à Claude sur son ordinateur de récupérer les
  changements (`git pull`). Le lanceur `Lancer la presentation.bat` et `serve.mjs` restent valables.
- Mettre à jour `LISEZ-MOI.md` et `DESIGN.md` si le design change.
