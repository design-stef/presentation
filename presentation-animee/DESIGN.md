# Design de la présentation

Repris de stephanechapelet.com.

## Typographie
- Inter (fichiers locaux, fonctionne hors ligne), graisse 600 pour les titres, 500 pour les sous-titres.
- Interlettrage serré : -0.045em sur les titres, comme le site.
- Titre de projet 84 px, sous-titre 40 px, numéro 56 px avec « /28 » en exposant (le « 04/08 » du site).

## Couleurs
| Rôle | Valeur |
| --- | --- |
| Fond | #FFFFFF |
| Encre | #121212 |
| Gris (sous-titres) | #6F6B65 |
| Gris sur fond noir | #A8A39B |
| Laser (slide 2 uniquement) | #FF5A1F |

## Mouvement
- **Le geste signature : la coupe diagonale.** La ligne de la couverture du PDF devient la transition :
  un trait balaie l'écran à 48° et découvre la slide suivante (vers la droite en avançant, vers la gauche en reculant).
- Les photos apparaissent chacune à leur façon, liée au sujet : découpe laser (Crossed), image qui s'allume
  (scènes de nuit, KJ), tracé lent (croquis, schémas), étapes successives (moulage, fonderie), volets et cercle.
- Les mots des légendes sortent du flou un par un, comme sur la page d'accueil du site.
- Une barre d'avancement verticale sur le bord droit, comme l'indicateur de défilement du site.
- Courbes : expo.out pour les entrées, power3/power4.inOut pour les déplacements ; aucune animation de rebond.
- `prefers-reduced-motion` : simples fondus, sans déplacement.

## Écarts assumés
- Inter est signalé comme police « trop commune » par le détecteur : c'est la police du site, conservée.
- La lueur orange de la slide 2 représente le faisceau laser ; elle ne dure que le temps de la découpe.
