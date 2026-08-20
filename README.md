# Trajectoires économiques du Maroc

Plateforme d'analyse de trajectoires économiques marocaines, construite pendant
un stage de Master 1 chez DIGIUP (Rabat), du 1er juin au 1er septembre 2026.

**En ligne :** https://trajectoires-maroc-fac.vercel.app

## Ce que c'est

Trois filières suivies dans la durée — automobile, blé, énergie — à partir de
séries publiques, avec une règle tenue de bout en bout : **aucun chiffre affiché
qui ne soit remontable à sa source**, et aucune valeur manquante comblée en
silence. La page `/sources` expose l'état des données elle-même : période,
nombre de relevés, taux de couverture et années manquantes, calculés à partir
des données et non saisis à la main.

Les graphiques sont écrits à la main en SVG. Il n'y a **aucune bibliothèque de
graphiques** dans le projet, et quatre dépendances au total : React, React DOM,
React Router et une police.

## Faire tourner

```sh
npm install
npm run dev        # serveur de développement
npm test           # la suite de tests
npm run build      # build de production
```

**`npm test`, jamais `node --test` seul** : la suite charge un crochet
(`tests/support/json-hook.mjs`) qui permet d'importer les fichiers JSON sans
déformer le code de `src/` pour les besoins des tests.

## Où regarder

| Fichier | Ce qu'il contient |
|---|---|
| `src/utils/` | Les modules de calcul. Ils n'affichent rien. |
| `src/composants/` | Les composants d'affichage. Ils ne calculent rien. |
| `src/utils/donnees.js` | La porte d'entrée vers les fichiers de données. **Aucun composant** n'en lit un directement ; deux exceptions assumées subsistent côté modules, `PageTerritoires.jsx` et `prevision.js`. |
| `src/utils/graphique.js` | L'échelle « à pas rond » et le repère de dessin. |
| `src/utils/analyse.js` | Les phrases calculées sous chaque graphique. |
| `src/data/` | Les données, en JSON. |

`GUIDE-CODE.md` explique le code fichier par fichier, `TESTS.md` ce que chaque
test protège, et `DONNEES-PROVENANCE.md` d'où vient chaque série — y compris ce
qui est un jeu de démonstration et non une donnée observée.
