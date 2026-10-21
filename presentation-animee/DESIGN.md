# Design de la présentation

Repris de stephanechapelet.com, ajusté selon les retours de l'auteur (moins de texte, aucun effet de lumière).

## Mise en page
- Les images occupent la scène (1920 × 940). La légende vit dans un **bandeau de 140 px en bas**, sous les images,
  jamais par-dessus : numéro « 04/28 », nom du projet, une ligne de description.
- Fond blanc ; bandeau noir sur les trois scènes sombres (Crossed de nuit, Zadig, KJ).

## Typographie
- Inter (fichiers locaux), 600 pour les titres, 500 pour les descriptions, interlettrage serré (-0,045em).
- Bandeau : numéro 40 px, nom 50 px, description 30 px.

## Couleurs
| Rôle | Valeur |
| --- | --- |
| Fond | #FFFFFF |
| Encre | #121212 |
| Gris (descriptions) | #6F6B65 |
| Gris sur fond noir | #A8A39B |

## Mouvement
- **Transition** : la diagonale de la couverture balaie l'écran entre deux slides.
- **Chaque slide a son geste**, tiré du sujet : tôle pliée en 3D (Crossed), photo recomposée en lattes ou en
  planches, trame de perforations (Zadig), gros plan qui rejoint sa place, travellings et plongées de caméra,
  balayage circulaire (Variations), croquis qui se tracent, moule en quatre gestes, survol de la corniche (Djeddah),
  mise au point, traits de cote et coins de cadrage (dessin technique), objets posés un à un, étapes de fonderie.
- Une slide joue sa séquence (5 à 7 s), puis « respire » lentement tant qu'on reste dessus.
- Courbes : expo.out pour les entrées, power3/power4.inOut pour les déplacements.
- Aucun halo, aucune lueur, aucun allumage.
- `prefers-reduced-motion` : la slide s'affiche directement dans son état final.

## Son
Bruitages discrets synthétisés dans le navigateur (souffle de transition, petit clic, crayon, laser, choc sourd).
Le bouton haut-parleur de la barre de navigation les coupe.
