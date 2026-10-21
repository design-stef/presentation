# Présentation animée « Mobilier urbain »

## Lancer la présentation
Double-cliquer sur **Lancer la presentation.bat**. Le navigateur s'ouvre sur la présentation
(il faut Node.js, déjà installé sur cet ordinateur). Garder la fenêtre noire ouverte pendant la présentation.

Sur un autre ordinateur : copier tout le dossier `presentation-animee` et installer Node.js (nodejs.org).
Aucune connexion internet n'est nécessaire pendant la présentation.

## Pendant la présentation
| Action | Effet |
| --- | --- |
| Clic, →, Espace, PageSuivante (télécommande) | slide suivante |
| ←, PagePrécédente | slide précédente |
| F ou bouton plein écran | plein écran |
| P ou bouton « Present » | mode présentateur : un onglet public plein écran, et sur votre écran la slide suivante, vos notes et un chronomètre |

Les notes du présentateur se modifient directement dans le mode présentateur ; elles restent enregistrées dans ce navigateur.

## Modifier les textes
Les légendes et les notes sont dans `build/slides.mjs` (une entrée par slide). Après modification,
ouvrir un terminal dans le dossier et lancer :

```
node build/build.mjs
```

## Contenu du dossier
- `index.html` : la page de présentation (navigation, mode présentateur).
- `composition/` : la composition HyperFrames (les 28 slides et leurs animations).
- `composition/assets/img/` : les photos extraites du PDF.
- `build/` : le générateur (textes, styles, animations).
