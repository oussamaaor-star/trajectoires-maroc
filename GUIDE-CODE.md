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
    │   └── regions-noms.json       codes région MA-01…MA-12 → noms
    │
    ├── utils/                  ← fonctions pures, sans React
    │   ├── formatage.js            formate(valeur, unite) : « 6,39 Md USD »
    │   ├── donnees.js              la « couche d'accès » aux JSON
    │   ├── analyse.js              synthèse auto (2 phrases) + projection simple
    │   └── graphique.js            géométrie SVG partagée (repère 720×400, échelles)
    │
    ├── composants/             ← briques réutilisables
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
    │   └── BarresRegions.jsx       barres horizontales par région (page Territoires)
    │
    └── pages/                  ← une page = une route
        ├── PageAccueil.jsx       /
        ├── PageSecteur.jsx       /secteur/:id  (gabarit UNIQUE des 3 secteurs)
        ├── PageTerritoires.jsx   /territoires
        ├── PageSources.jsx       /sources
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
- `*` (tout le reste) → retour à l'accueil.

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

## 6. La projection simple — `projetteDeuxAns(points)` dans `analyse.js`

Sur le graphique principal de chaque secteur, on **prolonge la tendance de 2 ans**
en pointillés. La tendance = **la moyenne des variations des 3 dernières années**,
appliquée aux 2 années suivantes. C'est volontairement basique (« j'ai prolongé
la tendance ») : pas de modèle statistique, pas de bande de confiance. Une valeur
projetée négative est ramenée à 0. Le graphique affiche la mention « Projection
simple (prolongement de la tendance) ». Couvre l'objectif « indicateurs
prospectifs / aide à la décision ».

## 7. La page Territoires (`/territoires`)

Les pages secteur racontent des trajectoires **nationales**. La page Territoires
apporte la dimension **spatiale** : un graphique en **barres horizontales**, une
barre par région, pour la **population légale** de chaque région (données réelles
HCP, RGPH 2024, dans `valeurs-regionales.json` + les noms dans `regions-noms.json`).
Les barres sont faites en HTML/CSS (`BarresRegions.jsx`), avec la même bascule
Graphique / Données et le même export CSV que les autres graphiques. Les
indicateurs économiques régionaux s'afficheront de la même façon dès leur collecte.

## 8. Ce que couvre chaque objectif de la fiche

| Objectif de la fiche | Où c'est visible |
|---|---|
| Analyse & visualisation d'indicateurs | KPI + graphiques des pages secteur, contexte national de l'accueil |
| Exploitation de données ouvertes | Données Banque Mondiale / UN Comtrade / HCP, page **Sources** |
| Tableaux de bord interactifs | Pages secteur : survol, bascule Graphique/Tableau, CSV |
| Automatisation d'analyses et de synthèses | **Lecture automatique** (2 phrases calculées, `analyse.js`) |
| IA / aide à la décision, indicateurs prospectifs | **Projection simple** sur 2 ans |
| Indicateurs territoriaux | Page **Territoires** (population par région) |

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

Trois fichiers, tous simples et rapides (`node:test`) :

| Fichier | Ce qu'il protège |
|---|---|
| `tests/formatage.test.mjs` | le formatage des nombres « à la française » (1 240,5 et pas 1,240.5) |
| `tests/donnees.test.mjs` | la couche d'accès aux JSON (recherche, valeurs, années, sources) |
| `tests/analyse.test.mjs` | la synthèse en 2 phrases ET la projection simple |

Les tests lisent les vrais JSON grâce au petit hook `tests/support/json-hook.mjs`
(il ajoute l'attribut `{ type: 'json' }` que Node réclame, sans modifier le code
de l'application).
