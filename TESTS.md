# Tests automatisés de la plateforme

> Mission de stage concernée : **« Réaliser des tests et améliorations fonctionnelles »**.

## 1. À quoi servent ces tests

Une plateforme de données a un défaut particulier : **quand elle se trompe, elle
ne plante pas**. Elle affiche un graphique propre, une carte KPI bien alignée, et
un chiffre faux. Personne ne voit rien. Ces tests existent pour attraper ces
régressions **silencieuses**.

Ils sont écrits avec le lanceur intégré à Node (`node:test`), sans aucune
dépendance de test à installer. On les lance avec :

```bash
npm test
```

## 2. Les neuf fichiers de tests

**75 tests répartis en 24 groupes, tous passants.** La commande affiche
`1..24  # tests 75  # suites 24  # pass 75  # fail 0`.

| Fichier | Groupes | Tests | Ce qu'il protège | Exemple de risque attrapé |
|---|--:|--:|---|---|
| `tests/analyse.test.mjs` | 5 | 11 | la synthèse automatique (deux phrases) et la projection | une phrase affiche « progression » sous une courbe qui baisse |
| `tests/distribution.test.mjs` | 4 | 14 | médiane, écart-type, description d'une série | l'écart-type bascule de la convention population à celle d'échantillon |
| `tests/donnees.test.mjs` | 3 | 7 | la couche d'accès aux JSON (`utils/donnees.js`) | une recherche de série renvoie la mauvaise, ou un `0` confondu avec « valeur absente » |
| `tests/donnees-integrite.test.mjs` | 1 | 3 | le recoupement des douze valeurs régionales | la somme des populations régionales cesse de tomber sur 36 828 330 |
| `tests/echange.test.mjs` | 1 | 5 | le format d'échange avec l'équipe data | le fichier livré par le binôme change de forme sans qu'on le voie |
| `tests/formatage.test.mjs` | 4 | 9 | le formatage des nombres « à la française » | les nombres repassent au format anglais (`1,240.5`), ou une valeur absente s'affiche `0` |
| `tests/graphique.test.mjs` | 3 | 14 | l'échelle verticale, l'axe des années, le repère de dessin | une barre est tronquée, ou l'échelle ne part plus de zéro |
| `tests/prevision.test.mjs` | 1 | 5 | le contrat des prévisions livrées | un fichier de prévision mal formé passe sans être signalé |
| `tests/qualite.test.mjs` | 2 | 7 | la couverture et la synthèse sur les vraies données | un trou de série cesse d'être compté comme tel |

*(Relevé du 20/08/2026, obtenu en lançant chaque fichier séparément.
`tests/support/` n'est pas compté : ce sont deux fichiers d'outillage.)*

Les tests travaillent sur des **séries fabriquées à la main** (des chiffres ronds,
vérifiables de tête) pour être indépendants du dataset, plus quelques
vérifications sur les **vraies données** du site (par exemple : la production
céréalière est bien passée de 6,28 Mt en 1990 à 3,21 Mt en 2024).

## 3. Le point important à défendre à l'oral

La **synthèse automatique** et la **projection** sont des fonctions
**déterministes** : les mêmes données produisent toujours le même résultat. C'est
précisément ce qui les rend **testables** — un modèle de langage, lui, ne pourrait
pas garantir qu'il n'invente pas un chiffre. Chaque nombre affiché sort d'un
calcul sur `series.json`.

## 4. Détail technique : lire les JSON depuis Node

`src/utils/donnees.js` écrit `import series from '../data/series.json'`. Vite sait
résoudre cet import tout seul ; Node exige en plus un attribut explicite. Plutôt
que de modifier le code de l'application pour les tests, on ajoute cet attribut à
la volée avec `tests/support/json-hook.mjs` (branché via `node --import` dans le
script `test` de `package.json`). Le code de `src/` reste donc exactement celui
qui part en production.
