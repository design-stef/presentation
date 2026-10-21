// Contenu de la présentation : une entrée par slide, dans l'ordre du PDF.
// Modifier les textes ici puis relancer : node build/build.mjs
//
// imgs : x, y, w, h en pixels sur une slide 1920 × 1080 (positions reprises du PDF).
// rv   : façon dont l'image apparaît
//        diag  = coupe diagonale (la ligne de la couverture)
//        up / down / left / right = volet depuis ce bord
//        iris  = cercle qui s'ouvre
//        draw  = tracé lent de gauche à droite (croquis, schémas)
//        laser = découpe verticale avec ligne incandescente
//        pop   = apparition nette (étapes de process)
//        light = image qui s'allume (scènes de nuit)
// o    : ordre d'apparition (0, 1, 2…)
// cap  : légende. at = bl | tl | tr | br pour un cartouche posé sur la photo,
//        ou { left, top } pour un texte posé dans un blanc de la slide.
//        layout = stack (empilé) ou row (sur une ligne).

export const slides = [
  {
    id: 'cover', label: 'Couverture', theme: 'light', fx: 'cover',
    notes: "Présentation : dix-huit ans de mobilier urbain, de l'acier découpé au béton moulé et à la lumière.",
  },
  {
    id: 'crossed-principe', label: 'Crossed, principe', theme: 'light', fx: 'laser',
    imgs: [
      { src: 'p02-panel.jpg', x: 150, y: 50, w: 860, h: 960, rv: 'laser', o: 0 },
      { src: 'p02-fold.jpg', x: 1150, y: 420, w: 640, h: 450, rv: 'draw', o: 1 },
    ],
    cap: { at: { left: 1160, top: 64 }, name: 'Crossed', meta: "Une tôle d'acier découpée au laser, pliée en cinq temps" },
    notes: 'Une seule tôle découpée au laser. Les lignes 1 à 5 sont les plis qui donnent le banc.',
  },
  {
    id: 'crossed-nuit', label: 'Crossed bench', theme: 'dark',
    imgs: [{ src: 'p03-a.jpg', x: 0, y: 0, w: 1920, h: 1080, rv: 'light', o: 0 }],
    cap: { at: 'bl', name: 'Crossed bench', meta: 'Lab23 · acier découpé, éclairé par dessous' },
    notes: 'Le banc Crossed pour Lab23, la nuit : la découpe joue avec la lumière.',
  },
  {
    id: 'crossed-famille', label: 'La famille Crossed', theme: 'light',
    imgs: [
      { src: 'p04-b.jpg', x: 0, y: 0, w: 1270, h: 540, rv: 'down', o: 0 },
      { src: 'p04-a.jpg', x: 0, y: 540, w: 1270, h: 540, rv: 'up', o: 1 },
      { src: 'p04-c.jpg', x: 1200, y: 0, w: 720, h: 1080, rv: 'right', o: 2 },
    ],
    cap: { at: { left: 80, top: 64 }, w: 1760, name: 'La famille Crossed', meta: 'Jardinières à Barcelone, siège à Capri, corbeille' },
    notes: "Jardinières au siège d'iGuzzini à Barcelone, siège Crossed à Capri, corbeille Crossed.",
  },
  {
    id: 'hilton', label: 'Hilton', theme: 'light',
    imgs: [
      { src: 'p05-a.jpg', x: 0, y: 0, w: 960, h: 1080, rv: 'diag', o: 0 },
      { src: 'p05-b.jpg', x: 960, y: 0, w: 960, h: 680, rv: 'down', o: 1 },
      { src: 'p05-c.jpg', x: 960, y: 570, w: 960, h: 510, rv: 'up', o: 2 },
    ],
    cap: { at: 'bl', name: 'Hilton Lac-Leamy', meta: 'Canada · bancs, corbeilles et jardinières' },
    notes: 'Nouveau mobilier pour les hôtels Hilton, ici Lac-Leamy au Canada.',
  },
  {
    id: 'zadig', label: 'Zadig', theme: 'dark',
    imgs: [{ src: 'p06-a.jpg', x: 0, y: 0, w: 1920, h: 1080, rv: 'light', o: 0 }],
    cap: { at: 'tl', name: 'Zadig', meta: 'Banc en acier perforé, à facettes' },
    notes: 'Zadig : des facettes pliées et perforées.',
  },
  {
    id: 'zadig-lieux', label: 'Zadig, Bergen et Milan', theme: 'light',
    imgs: [
      { src: 'p07-b.jpg', x: 0, y: 0, w: 1194, h: 1080, rv: 'diag', o: 0 },
      { src: 'p07-c.jpg', x: 1194, y: 0, w: 726, h: 545, rv: 'down', o: 1 },
      { src: 'p07-a.jpg', x: 1194, y: 540, w: 726, h: 540, rv: 'iris', o: 2 },
    ],
    cap: { at: 'bl', name: 'Zadig', meta: 'Musée de Bergen, Norvège · Milan' },
    notes: 'Zadig installé au musée de Bergen en Norvège, et à Milan.',
  },
  {
    id: 'croquis', label: 'Du croquis au banc', theme: 'light',
    imgs: [
      { src: 'p08-render.jpg', x: 40, y: 280, w: 660, h: 540, rv: 'left', o: 0 },
      { src: 'p08-sketch1.jpg', x: 700, y: 430, w: 600, h: 420, rv: 'draw', o: 1 },
      { src: 'p08-sketch2.jpg', x: 1300, y: 210, w: 610, h: 610, rv: 'draw', o: 2 },
    ],
    cap: { at: { left: 80, top: 904 }, layout: 'row', name: 'Du croquis au banc', meta: 'Lattes en plat cintré puis soudé' },
    notes: "Le croquis annoté : plat découpé laser, plat cintré puis soudé, inox poli miroir, plaque qui cache le boulonnage au sol.",
  },
  {
    id: 'alassio', label: 'Alassio', theme: 'light',
    imgs: [
      { src: 'p09-a.jpg', x: 0, y: 0, w: 1257, h: 1080, rv: 'diag', o: 0 },
      { src: 'p09-b.jpg', x: 1257, y: 0, w: 663, h: 1080, rv: 'up', o: 1 },
    ],
    cap: { at: 'tl', name: 'Alassio, Italie', meta: 'Mobilier urbain du front de mer' },
    notes: 'Le banc installé sur le front de mer d’Alassio, en Italie.',
  },
  {
    id: 'emme-monaco', label: 'Emme, Monte-Carlo', theme: 'light',
    imgs: [
      { src: 'p10-a.jpg', x: 36, y: 51, w: 1384, h: 993, rv: 'diag', o: 0 },
      { src: 'p10-b.jpg', x: 1215, y: 78, w: 669, h: 501, rv: 'left', o: 1 },
    ],
    cap: { at: { left: 1460, top: 640 }, name: 'Emme', meta: 'Promenade de Monte-Carlo, Monaco' },
    notes: 'Les bancs Emme sur la promenade de Monte-Carlo.',
  },
  {
    id: 'variations', label: 'Variations', theme: 'light',
    imgs: [
      { src: 'p11-a.jpg', x: 0, y: 0, w: 1150, h: 1080, rv: 'iris', o: 0 },
      { src: 'p11-b.jpg', x: 1110, y: 189, w: 810, h: 703, rv: 'left', o: 1 },
    ],
    cap: { at: { left: 80, top: 56 }, layout: 'row', name: 'Variations', meta: 'Bancs courbes en bois, modulables' },
    notes: 'Variations : des modules courbes qui se combinent en cercle ou en vague.',
  },
  {
    id: 'variations-detail', label: 'Variations, détail', theme: 'light',
    imgs: [
      { src: 'p12-b.jpg', x: 0, y: 140, w: 1112, h: 857, rv: 'draw', o: 0 },
      { src: 'p12-a.jpg', x: 1150, y: 0, w: 770, h: 1080, rv: 'up', o: 1 },
    ],
    cap: { at: { left: 80, top: 56 }, layout: 'row', name: 'Variations', meta: 'Esquisse de la structure et du dossier' },
    notes: 'Esquisse de la structure sous l’assise, et le dossier en bois.',
  },
  {
    id: 'variations-paris', label: 'Variations, Paris', theme: 'light',
    imgs: [
      { src: 'p13-a.jpg', x: 36, y: 51, w: 1324, h: 993, rv: 'iris', o: 0 },
      { src: 'p13-b.jpg', x: 1153, y: 51, w: 731, h: 502, rv: 'down', o: 1 },
    ],
    cap: { at: { left: 1420, top: 640 }, name: 'Variations', meta: 'Bancs installés à Paris' },
    notes: 'Variations installés à Paris.',
  },
  {
    id: 'emme-moule', label: 'Emme, moulage', theme: 'light',
    imgs: [
      { src: 'p14-render.jpg', x: 740, y: 100, w: 560, h: 590, rv: 'up', o: 0 },
      { src: 'p14-s1.jpg', x: 100, y: 690, w: 340, h: 240, rv: 'pop', o: 1 },
      { src: 'p14-s2.jpg', x: 560, y: 690, w: 340, h: 240, rv: 'pop', o: 2 },
      { src: 'p14-s3.jpg', x: 1030, y: 690, w: 340, h: 240, rv: 'pop', o: 3 },
      { src: 'p14-s4.jpg', x: 1480, y: 490, w: 350, h: 440, rv: 'pop', o: 4 },
    ],
    stepGap: 0.42,
    cap: { at: { left: 80, top: 80 }, w: 600, name: 'Emme', meta: 'Béton moulé : remplir, retourner, démouler' },
    notes: 'Le principe du moule : on remplit, on retourne, on démoule.',
  },
  {
    id: 'moules', label: 'Moules', theme: 'light',
    imgs: [{ src: 'p15-a.jpg', x: 0, y: 0, w: 1920, h: 1080, rv: 'diag', o: 0 }],
    cap: { at: 'bl', name: 'Les moules', meta: "Coffrages de fabrication à l'atelier" },
    notes: 'Les moules réels, après de nombreuses coulées.',
  },
  {
    id: 'emme-djeddah', label: 'Emme, Djeddah', theme: 'light',
    imgs: [
      { src: 'p16-a.jpg', x: 0, y: 0, w: 1293, h: 1080, rv: 'diag', o: 0 },
      { src: 'p16-b.jpg', x: 1295, y: 0, w: 624, h: 1080, rv: 'up', o: 1 },
    ],
    cap: { at: 'bl', name: 'Emme', meta: 'Corniche de Djeddah' },
    notes: 'Les bancs Emme en béton sur la corniche de Djeddah.',
  },
  {
    id: 'beton-bois', label: 'Banc béton et bois', theme: 'light',
    imgs: [{ src: 'p17-a.jpg', x: 0, y: 0, w: 1920, h: 1080, rv: 'left', o: 0 }],
    cap: { at: 'bl', name: 'Banc béton et bois', meta: 'Piètements en béton, assise en bois' },
    notes: 'À compléter : nom du banc.',
  },
  {
    id: 'acier-beton', label: 'Banc acier et béton', theme: 'light',
    imgs: [{ src: 'p18-a.jpg', x: 0, y: 0, w: 1920, h: 1080, rv: 'diag', o: 0 }],
    cap: { at: 'tl', name: 'Banc acier et béton', meta: 'Une coque en acier sur un socle en béton' },
    notes: 'À compléter : nom du banc.',
  },
  {
    id: 'ligne', label: 'Ligne', theme: 'light',
    imgs: [
      { src: 'p19-a.jpg', x: 0, y: 0, w: 960, h: 1080, rv: 'up', o: 0 },
      { src: 'p19-diagram.jpg', x: 1170, y: 330, w: 680, h: 480, rv: 'draw', o: 1 },
    ],
    cap: { at: { left: 1180, top: 64 }, name: 'Ligne', meta: 'MyWay · une assise sur un profil en I' },
    notes: 'Le banc Ligne pour MyWay, dans les fontaines. Le schéma montre le profil.',
  },
  {
    id: 'monolithe', label: 'Banc monolithe', theme: 'light',
    imgs: [
      { src: 'p20-a.jpg', x: 0, y: 0, w: 1077, h: 1080, rv: 'diag', o: 0 },
      { src: 'p20-diagram.jpg', x: 1110, y: 400, w: 770, h: 350, rv: 'draw', o: 1 },
    ],
    cap: { at: { left: 1160, top: 64 }, name: 'Banc monolithe', meta: 'Béton, une assise qui se décale' },
    notes: 'À compléter : nom et lieu.',
  },
  {
    id: 'blanc', label: 'Banc et jardinières', theme: 'light',
    imgs: [
      { src: 'p21-a.jpg', x: 936, y: 243, w: 984, h: 595, rv: 'up', o: 1 },
      { src: 'p21-b.jpg', x: 0, y: 175, w: 1020, h: 729, rv: 'left', o: 0 },
    ],
    cap: { at: { left: 80, top: 940 }, layout: 'row', name: 'Banc et jardinières', meta: 'Béton blanc, formes galets' },
    notes: 'À compléter : nom de la collection.',
  },
  {
    id: 'fontvieille', label: 'Monaco, Fontvieille', theme: 'light',
    imgs: [
      { src: 'p22-b.jpg', x: 0, y: 0, w: 960, h: 526, rv: 'down', o: 0 },
      { src: 'p22-a.jpg', x: 0, y: 526, w: 960, h: 554, rv: 'up', o: 1 },
      { src: 'p22-c.jpg', x: 960, y: 0, w: 960, h: 1080, rv: 'diag', o: 2 },
    ],
    cap: { at: 'bl', name: 'Monaco', meta: 'Port de Fontvieille' },
    notes: 'À vérifier : Fontvieille, Monaco.',
  },
  {
    id: 'kj', label: 'KJ', theme: 'dark', bg: '#000', fx: 'glow',
    imgs: [{ src: 'p23-a.jpg', x: 60, y: 0, w: 1732, h: 1080, rv: 'light', o: 0 }],
    cap: { at: { left: 96, top: 80 }, name: 'KJ', meta: 'Éclairage urbain pour Fontes de Paris' },
    notes: 'KJ, le luminaire urbain dessiné pour Fontes de Paris.',
  },
  {
    id: 'kj-prix', label: 'KJ, Design Plus', theme: 'light',
    imgs: [
      { src: 'p24-a.jpg', x: 0, y: 0, w: 1920, h: 1080, rv: 'diag', o: 0 },
      { src: 'p24-b.jpg', x: 1378, y: 934, w: 267, h: 40, rv: 'pop', o: 3 },
    ],
    cap: { at: 'tl', name: 'KJ', meta: 'Lauréat du prix Design Plus' },
    notes: 'KJ a reçu le prix Design Plus.',
  },
  {
    id: 'kj-technique', label: 'KJ, technique', theme: 'light',
    imgs: [
      { src: 'p25-b.jpg', x: 110, y: 0, w: 1421, h: 1080, rv: 'up', o: 0 },
      { src: 'p25-a.jpg', x: 1531, y: 36, w: 389, h: 1044, rv: 'left', o: 1 },
    ],
    cap: { at: { left: 720, top: 700 }, name: 'KJ', meta: 'Capot ouvrant, module LED' },
    notes: 'Le capot s’ouvre pour accéder au module LED.',
  },
  {
    id: 'usinage', label: 'Usinage du moule', theme: 'light',
    imgs: [
      { src: 'p26-a.jpg', x: 0, y: 0, w: 642, h: 1080, rv: 'down', o: 0 },
      { src: 'p26-b.jpg', x: 642, y: 0, w: 640, h: 1080, rv: 'down', o: 1 },
      { src: 'p26-c.jpg', x: 1282, y: 0, w: 638, h: 1080, rv: 'down', o: 2 },
    ],
    cap: { at: 'bl', name: 'Le moule', meta: 'Usinage, puis levage du moule en acier' },
    notes: 'À vérifier : usinage du moule de fonderie.',
  },
  {
    id: 'fonderie', label: 'Fonderie', theme: 'light',
    imgs: [
      { src: 'p27-s1.jpg', x: 50, y: 520, w: 330, h: 290, rv: 'pop', o: 0 },
      { src: 'p27-s2.jpg', x: 415, y: 520, w: 330, h: 290, rv: 'pop', o: 1 },
      { src: 'p27-s3.jpg', x: 780, y: 520, w: 330, h: 290, rv: 'pop', o: 2 },
      { src: 'p27-s4.jpg', x: 1140, y: 520, w: 340, h: 290, rv: 'pop', o: 3 },
      { src: 'p27-s5.jpg', x: 1505, y: 520, w: 365, h: 290, rv: 'pop', o: 4 },
    ],
    stepGap: 0.5,
    cap: { at: { left: 80, top: 80 }, name: 'Fonderie', meta: "Moulage sous pression de l'aluminium, en cinq temps" },
    notes: 'À vérifier : 1 versement, 2 injection, 3 remplissage, 4 ouverture, 5 éjection.',
  },
  {
    id: 'merci', label: 'Merci', theme: 'light', fx: 'end',
    notes: 'Fin. stephanechapelet.com',
  },
];
