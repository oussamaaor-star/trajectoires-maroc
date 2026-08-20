# GUIDE-CODE — plateforme « Trajectoires économiques du Maroc » (version simple)

Guide destiné à l'étudiant : de quoi expliquer chaque fichier au tuteur ou au
jury. La stack est **volontairement minimale** : **React + Vite +
react-router-dom**, du **CSS pur**, et des **graphiques SVG faits main** (aucune
bibliothèque de graphiques, aucune dépendance ajoutée).

Cette version est **simplifiée** pour rester lisible de bout en bout : un seul
graphique principal par secteur, une synthèse automatique en 2 phrases, une
projection simple, une page territoires en barres. Elle couvre néanmoins **tous
les objectifs de la fiche de stage** (voir §8).

## 1. Lancer le projet

```bash
npm install        # une seule fois
npm run dev        # serveur de développement (http://localhost:5173)
npm run build      # version de production dans dist/
npm run lint       # vérification du code (oxlint)
npm test           # tests automatisés (node:test)
```

## 2. L'arborescence, fichier par fichier

```
plateforme-fac/
├── index.html                  ← la seule « vraie » page HTML (titre, meta, favicon)
├── DESIGN-SPEC.md              ← la spec du designer (palette, règles)
├── DONNEES-PROVENANCE.md       ← provenance exacte de chaque série de données
└── src/
    ├── main.jsx                ← point d'entrée : monte React + le routeur + le CSS
    ├── App.jsx                 ← la table de routage (4 routes)
    │
    ├── styles/design.css       ← TOUT le style du site
    │
    ├── data/                   ← les données (JSON), à remplacer plus tard
    │   ├── secteurs.json           3 secteurs : nom, résumé, cartes KPI
    │   ├── series.json             les séries temporelles {annee, valeur}
    │   ├── evenements.json         les événements marquants (année + libellé)
    │   ├── sources.json            sources, indicateurs couverts, limites
    │   ├── valeurs-regionales.json valeurs par région (population, page Territoires)
    │   ├── regions-noms.json       codes région MA-01…MA-12 → noms
    │   └── predictions.json        le prolongement de démonstration (1 série, 2026-2028)
    │
    ├── utils/                  ← 7 modules de fonctions pures, sans React
    │   ├── formatage.js            formate(valeur, unite) : « 6,39 Md USD »
    │   ├── donnees.js              la « couche d'accès » aux JSON
    │   ├── analyse.js              synthèse auto (2 phrases)
    │   ├── prevision.js            le prolongement de tendance et son contrat
    │   ├── distribution.js         médiane, écart-type, dispersion d'une série
    │   ├── qualite.js              couverture d'une série, comptage des trous
    │   └── graphique.js            géométrie SVG partagée (repère 720×400, échelles)
    │
    ├── composants/             ← 18 briques réutilisables
    │   ├── NavHaut.jsx             barre de navigation
    │   ├── PiedPage.jsx            pied de page
    │   ├── CarteKPI.jsx            carte « gros chiffre + variation ↑↓ »
    │   ├── CarteSecteur.jsx        carte cliquable d'un secteur (accueil)
    │   ├── MiniSparkline.jsx       mini-courbe décorative des cartes
    │   ├── MenuAncres.jsx          sommaire sticky des pages secteur
    │   ├── GraphiqueSerie.jsx      assemble config éditoriale → graphique complet
    │   ├── ConteneurGraphique.jsx  carte englobante : titre, bascule Graphique/Données, CSV
    │   ├── CourbeTrajectoire.jsx   graphique en courbe SVG
    │   ├── BarresAnnuelles.jsx     graphique en barres SVG (production céréalière)
    │   ├── GrilleAxes.jsx          grille + axes, partagés par courbe et barres
    │   ├── Infobulle.jsx           bulle de survol (année + valeur)
    │   ├── TableauDonnees.jsx      tableau année × séries (vue accessible)
    │   ├── ListeEvenements.jsx     liste des événements en texte, sous le graphique
    │   ├── LectureAutomatique.jsx  le bloc « Lecture automatique » (2 phrases)
    │   ├── TableauDistribution.jsx tableau de dispersion des séries
    │   ├── TableauQualite.jsx      tableau de couverture (relevés présents / attendus)
    │   └── BarresRegions.jsx       barres horizontales par région (page Territoires)
    │
    └── pages/                  ← 5 pages, une page = une route
        ├── PageAccueil.jsx       /
        ├── PageSecteur.jsx       /secteur/:id  (gabarit UNIQUE des 3 secteurs)
        ├── PageTerritoires.jsx   /territoires
        ├── PageSources.jsx       /sources
        ├── PageIntrouvable.jsx   toute autre adresse (page 404)
        └── contenuSecteurs.js    le contenu éditorial (titres, intros, choix de graphique)
```

**Idée directrice à expliquer au jury :** séparation nette entre *données*
(`data/`), *contenu éditorial* (`contenuSecteurs.js`), *logique*
(`composants/`, `utils/`) et *style* (`design.css`). Changer un texte ou une
donnée ne touche jamais un composant.

## 3. Le routing (`App.jsx`)

`main.jsx` enveloppe l'appli dans `<BrowserRouter>` ; `App.jsx` choisit la page :

- `/` → `PageAccueil` (titre + 3 cartes secteur + 3 KPI de contexte national)
- `/secteur/:id` → `PageSecteur` — `:id` est un **paramètre d'URL**. Trois URL
  (`/secteur/automobile`, `/secteur/ble`, `/secteur/energie`), **un seul
  composant**.
- `/territoires` → `PageTerritoires`
- `/sources` → `PageSources`
- `*` (toute autre adresse) → `PageIntrouvable`, une vraie page 404 qui dit ce
  qui s'est passé et propose un lien vers l'accueil. On ne redirige pas
  silencieusement : une adresse fausse doit se voir.

Astuce à montrer : `PageSecteur` pose `data-secteur="ble"` sur sa racine. En CSS,
`[data-secteur="ble"]` redéfinit la variable `--accent` — et TOUS les éléments
prennent la couleur du secteur **sans une ligne de JavaScript**.

## 4. Comment marche un graphique SVG

Ouvrir `CourbeTrajectoire.jsx` (ou `BarresAnnuelles.jsx`) et dérouler :

1. **Le repère.** `viewBox="0 0 720 400"` : un système de coordonnées FIXE. Le
   navigateur étire ensuite le dessin à 100 % de la largeur → responsive gratuit.
   Les marges (constante `VUE` dans `utils/graphique.js`) réservent la place des
   axes.
2. **Les échelles.** `xPour(annee)` et `yPour(valeur)` font une simple règle de
   trois. En SVG le y=0 est en HAUT, d'où le `VUE.y1 −`. `calculeEchelle()`
   choisit des bornes « rondes » (0, 2, 4…) pour que la grille tombe juste.
3. **La courbe.** Un `<path>` avec un attribut `d` du type `M44,300 L91,280…`
   (`M` = poser le crayon, `L` = tracer). Les barres sont de simples `<rect>`
   qui partent TOUJOURS de zéro.
4. **Le survol.** Un écouteur `onMouseMove` : on convertit la position de la
   souris en coordonnées du repère, on cherche l'année la plus proche, on affiche
   une infobulle HTML (`Infobulle.jsx`).
5. **Accessibilité.** Chaque graphique a un bouton « Données » qui affiche le
   MÊME contenu en tableau (`TableauDonnees`), et un export CSV (séparateur `;`,
   virgule décimale). L'infobulle n'est jamais le seul moyen de lire une valeur.

Les **événements** ne sont PAS dessinés sur le graphique : ils sont listés en
texte simple juste en dessous (`ListeEvenements.jsx`, filtre les événements qui
tombent dans la période de la série).

## 5. La lecture automatique (2 phrases) — `utils/analyse.js`

La fiche demande « l'automatisation d'analyses et de synthèses ». La fonction
`phrasesDeLaSerie(serie)` lit les points d'une série et renvoie **2 phrases** :

1. **l'évolution globale** de la première à la dernière valeur : en pourcentage,
   ou « multiplié par N » si le rapport ≥ 2, ou un message honnête si le départ
   est à zéro (on ne peut pas diviser par zéro) ;
2. **le maximum et le minimum** avec leurs années.

**LA phrase à retenir pour l'oral :** ces phrases sont **calculées**, jamais
écrites à la main ni générées par un modèle de langage. Ce sont des fonctions
déterministes : même donnée = même phrase → c'est vérifiable et testable (voir
`tests/analyse.test.mjs`). Calculs utilisés : min, max, pourcentage. Rien de plus.
Le bloc s'affiche sous la mention « Analyse générée automatiquement à partir des
données ».

## 6. Le prolongement de tendance — `projetteDeuxAns(points)` (`analyse.js`) et `prevision.js`

Il y a **deux chemins**, et il faut savoir les distinguer à l'oral.

1. **La projection maison**, `projetteDeuxAns` dans `analyse.js` : la tendance
   est **la moyenne des variations des 3 dernières années**, appliquée aux
   2 années suivantes, en pointillés. Volontairement basique — « j'ai prolongé
   la tendance ». Pas de modèle statistique, **pas d'intervalle**. Une valeur
   projetée négative est ramenée à 0. Le graphique affiche alors « Projection
   simple (prolongement de la tendance des 3 dernières années sur 2 ans) ».
2. **La porte des prévisions livrées**, `prevision.js` : elle attend d'un modèle
   une valeur, une borne basse, une borne haute et un nom de modèle. **Rien n'a
   été livré à ce jour.** `src/data/predictions.json` contient un jeu de
   **démonstration** écrit à la main le 21/07/2026, portant `modele:
   "démonstration"` — ce qui déclenche un bandeau sur le graphique. La bande
   dessinée autour des points suit une **règle arbitraire** et **n'a aucune
   interprétation probabiliste** : c'est pourquoi la page l'appelle « bande »
   et jamais « bande de confiance ».

**Une seule série est prolongée aujourd'hui** : les exportations de voitures,
de 2026 à 2028. Le blé ne l'est pas (sa dispersion atteint 45,6 % de sa
moyenne : il n'y a pas de tendance à prolonger) et l'énergie non plus (son
dernier relevé date de 2023). Ces choix sont posés dans
`src/pages/contenuSecteurs.js`, champ `projection`.

Les années projetées sont **exclues** de la vue « Données » et de l'export
CSV : on ne télécharge que de l'observé.

## 7. La page Territoires (`/territoires`)

Les pages secteur racontent des trajectoires **nationales**. La page Territoires
apporte la dimension **spatiale** : un graphique en **barres horizontales**, une
barre par région, pour la **population légale** de chaque région (données réelles
HCP, RGPH 2024, dans `valeurs-regionales.json` + les noms dans `regions-noms.json`).
Les barres sont faites en HTML/CSS (`BarresRegions.jsx`), avec la même bascule
Graphique / Données et le même export CSV que les autres graphiques. Les
indicateurs économiques régionaux s'afficheront de la même façon dès leur collecte.

## 8. Ce que couvre chaque objectif de la fiche

| Objectif de la fiche | Où c'est visible | Portée réelle |
|---|---|---|
| Analyse & visualisation d'indicateurs | KPI + graphiques des pages secteur, contexte national de l'accueil | complète sur les 3 secteurs |
| Exploitation de données ouvertes | Banque Mondiale, Office des Changes, HCP, collecte interne — page **Sources** | complète |
| Tableaux de bord interactifs | Pages secteur : survol, bascule Graphique/Données, CSV, sommaire d'ancres | complète, sans filtre ni sélecteur de période |
| Automatisation d'analyses et de synthèses | **Lecture automatique** (2 phrases calculées, `analyse.js`) | couvert par un calcul déterministe : **aucun modèle de langage** |
| Fonctionnalités **IA** et d'aide à la décision | Prolongement de tendance, variations annuelles, événements datés | **partielle** : la mise en évidence seulement, sans recommandation ni alerte, et sans intelligence artificielle |
| Indicateurs prospectifs et territoriaux | Prolongement à 2 ans ; page **Territoires** (population par région) | prospectif couvert ; territorial couvert par une seule donnée démographique, en attente d'indicateurs économiques régionaux |

C'est le même bilan que le tableau n° 13 du rapport : **cinq des six objectifs
sont couverts, dont trois avec une réserve** ; le cinquième ne l'est que
partiellement, son volet « intelligence artificielle » ne l'étant pas.

## 9. Ajouter ou remplacer des données

Les 26 séries affichées viennent de sources publiques : 12 des douanes
marocaines livrées par le binôme data, 14 de la Banque Mondiale (détail série
par série dans `DONNEES-PROVENANCE.md`). Deux briques restent à recevoir — les
prévisions issues d'un modèle et les indicateurs régionaux — et se déposent en
CSV dans `donnees-binome/`, où `npm run convertir` les intègre sans toucher au
code. Pour tout autre remplacement, il suffit de
régénérer les fichiers `src/data/*.json` en respectant leur forme actuelle : tout
le code passe par `utils/donnees.js`, donc les pages, graphiques, tableaux et
exports CSV se mettent à jour tout seuls. Si un nouvel indicateur doit être
AFFICHÉ comme graphique principal d'un secteur, on l'indique dans
`src/pages/contenuSecteurs.js` (un fichier de contenu, pas de code).

## 10. Les tests (`npm test`)

Neuf fichiers, tous simples et rapides (`node:test`). **75 tests en 24 groupes,
tous passants** : la commande affiche `1..24  # tests 75  # suites 24  # pass 75
# fail 0`. Le détail commenté est dans `TESTS.md`.

| Fichier | Groupes | Tests | Ce qu'il protège |
|---|--:|--:|---|
| `tests/analyse.test.mjs` | 5 | 11 | la synthèse en 2 phrases, y compris le sens d'une série qui part de zéro |
| `tests/distribution.test.mjs` | 4 | 14 | médiane, écart-type, dispersion |
| `tests/donnees.test.mjs` | 3 | 7 | la couche d'accès aux JSON (recherche, valeurs, années, sources) |
| `tests/donnees-integrite.test.mjs` | 1 | 3 | le recoupement des douze valeurs régionales |
| `tests/echange.test.mjs` | 1 | 5 | le format d'échange avec l'équipe data |
| `tests/formatage.test.mjs` | 4 | 9 | le formatage « à la française » (1 240,5 et pas 1,240.5) et le refus du zéro fictif |
| `tests/graphique.test.mjs` | 3 | 14 | l'échelle verticale, l'axe des années, le repère de dessin |
| `tests/prevision.test.mjs` | 1 | 5 | le contrat des prévisions livrées |
| `tests/qualite.test.mjs` | 2 | 7 | la couverture d'une série et le comptage des trous |

⚠ La commande est **`npm test`**, jamais `node --test tests/` : sans le
`--import` du hook ci-dessous, six fichiers échouent aussitôt
(`ERR_IMPORT_ASSERTION_TYPE_MISSING`).

Les tests lisent les vrais JSON grâce au petit hook `tests/support/json-hook.mjs`
(il ajoute l'attribut `{ type: 'json' }` que Node réclame, sans modifier le code
de l'application).

## 11. La mise en ligne, et pourquoi la configuration liste les adresses

Deux commandes suffisent (`npm run build`, puis un déploiement Vercel) et la
configuration tient dans `vercel.json`. Elle mérite une explication, parce
qu'elle ne ressemble pas à celle qu'on trouve partout.

Une application à page unique n'a **qu'un seul fichier HTML**. Ouvrir
directement `/sources` dans la barre d'adresse renverrait donc une erreur :
aucun fichier de ce nom n'existe sur le serveur. D'où la règle de réécriture,
qui dit à l'hébergeur « sers `index.html`, l'application se chargera de lire
l'adresse ».

La formule habituelle réécrit **toutes** les adresses (`/(.*)`). Elle
fonctionne, et elle a un défaut qu'on ne voit pas à l'écran : une adresse
inventée comme `/nimportequoi` reçoit alors le code **HTTP 200 « tout va
bien »**, et l'application affiche par-dessus son écran « Cette page n'existe
pas ». L'humain lit la bonne chose ; la machine — moteur de recherche,
vérificateur de liens, outil de surveillance — lit exactement l'inverse, et
la page est indexable.

`vercel.json` ne réécrit donc que les **six adresses que l'application sait
servir**. Les trois secteurs sont nommés un par un, sinon `/secteur/nimportequoi`
passerait encore. Tout le reste ne correspond à rien et tombe sur
`public/404.html`, servi avec le vrai code 404.

| Adresse demandée | Code HTTP | Ce qui s'affiche |
|---|---|---|
| `/`, `/territoires`, `/sources` | 200 | l'application |
| `/secteur/automobile`, `/secteur/ble`, `/secteur/energie` | 200 | l'application |
| `/secteur/inexistant`, `/nimportequoi` | **404** | `404.html` |

`src/pages/PageIntrouvable.jsx` reste utile et n'est pas remplacé : il traite
le cas d'un lien mort cliqué **à l'intérieur** du site, où le serveur n'est
jamais consulté. `404.html`, lui, traite le cas d'une adresse tapée ou collée.
Le premier est du ressort de l'application, le second de l'hébergeur.

C'est la même règle que pour les données : **une adresse qui n'existe pas est
un trou, et on ne comble pas un trou en silence.**
