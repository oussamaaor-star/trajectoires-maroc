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

## 2. Les trois fichiers de tests

| Fichier | Ce qu'il protège | Exemple de risque attrapé |
|---|---|---|
| `tests/formatage.test.mjs` | le formatage des nombres « à la française » | les nombres repassent au format anglais (`1,240.5`) |
| `tests/donnees.test.mjs` | la couche d'accès aux JSON (`utils/donnees.js`) | une recherche de série renvoie la mauvaise, ou un `0` confondu avec « valeur absente » |
| `tests/analyse.test.mjs` | la synthèse auto (2 phrases) et la projection simple | une phrase générée affiche un chiffre faux, ou la projection sort du cadre |

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
