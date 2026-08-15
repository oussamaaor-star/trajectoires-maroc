# DESIGN-SPEC — Trajectoires économiques du Maroc

Spec de design pour l'agent développeur. Tout le CSS est dans `src/styles/design.css`
(à importer une fois dans `main.jsx`). Esthétique visée : **institution statistique
moderne** (référence : Our World in Data, Data México) — fond clair, gros chiffres,
grille stricte, zéro gadget.

## 1. Palette (validée)

### Couleurs de séries (graphiques)

| Rôle | Variable | Hex | Texte associé (≥ 4.5:1) | Fond doux |
|---|---|---|---|---|
| Automobile / aéronautique | `--couleur-auto` | `#2b6cb0` | `#155a9c` | `#e9f1f8` |
| Blé / agriculture | `--couleur-ble` | `#6b7d1d` | `#495a10` | `#f1f4e3` |
| Énergie pétrole & gaz | `--couleur-energie` | `#c2500e` | `#9c3f08` | `#faece1` |
| Marque / série « ensemble » | `--couleur-marque` | `#00826b` | `#00614f` | `#e1f2ed` |

**Validation** (script `validate_palette.js` du skill dataviz, surface `#ffffff`,
mode light, ordre d'adjacence `ble, auto, energie, marque`) :

```
[PASS] Lightness band       all 4 inside L 0.43–0.77
[PASS] Chroma floor         all 4 >= 0.1
[PASS] CVD separation       worst adjacent #00826b↔#c2500e ΔE 11.1 (protan)  (cible ≥ 8)
[PASS] Normal-vision floor  worst adjacent ΔE 22.7                            (cible ≥ 15)
[PASS] Contrast vs surface  all 4 >= 3:1
→ ALL CHECKS PASS
```

Conséquence pratique : dans un graphique multi-séries, **empiler / juxtaposer dans
l'ordre blé → auto → énergie → marque** (c'est l'ordre validé pour le daltonisme).
Un vrai gris ne peut pas être une série (il échoue le plancher de chroma) : la
4e série est donc le teal de marque.

### Neutres et sémantiques

- Encre `#1a2b3c` (14.4:1) · secondaire `#5a6472` (6:1) · douce `#6b7480` (4.7:1 — sources, axes)
- Fond page `#f6f7f4` · surface cartes `#ffffff` · bordure `#e3e6e2`
- Hausse `#0c7a3f` (5.4:1) · baisse `#b2382f` (6:1)
- Séries de contexte (gris) `#8a929c` — la série « héros » est en couleur, le reste en gris

### Mécanisme d'accent

Poser `data-secteur="automobile" | "ble" | "energie"` sur la racine de la page :
les variables `--accent`, `--accent-sombre`, `--accent-doux` basculent, et tous les
composants (nav active, hero, cartes, menu d'ancres, lignes de graphique) suivent.
Sans attribut → teal de marque (accueil, page Sources).

**Règle d'or : le texte ne porte JAMAIS la couleur d'une série** (lisibilité).
La couleur vient d'une pastille `.cle-serie` à côté du texte, ou du trait lui-même.
Pour du texte coloré (titres de section, liens), utiliser uniquement `--accent-sombre`.

## 2. Typographie

Police : Inter Variable (`@fontsource-variable/inter`), fallback system-ui.

| Usage | Taille | Graisse | Notes |
|---|---|---|---|
| h1 (titre page) | 38px (28 mobile) | 750 | letter-spacing −0.02em |
| h2 (chapitre) | 24px | 700 | filet dessous, numéro accentué |
| h3 | 18px | 600 | |
| Valeur KPI | 36px (30 mobile) | 700 | **chiffres proportionnels** (voir §5) |
| Corps | 16px / 1.6 | 400 | paragraphes limités à 68ch |
| Libellés, badges, légendes | 13px | 500–600 | |
| Sources sous graphique | 12.5px | 400 | gris `--encre-douce` |
| Axes SVG | 12px | 400 | `tabular-nums` |

`tabular-nums` **uniquement** là où des chiffres s'alignent verticalement :
cellules de tableau, graduations d'axe, infobulle, variation KPI. Pas sur le gros
chiffre KPI (règle du skill dataviz : à cette taille les chiffres tabulaires
paraissent trop écartés — l'anti-pattern est documenté).

## 3. Wireframe — Accueil

```
[.nav-haut]  Marque « Trajectoires Maroc »   | Accueil* | Automobile | Blé | Énergie | Sources
[.hero]      surtitre « PLATEFORME DE DONNÉES » + h1 + description (teal doux → fond)
[.conteneur]
  [.grille-kpi]        3–4 .carte-kpi transversales (PIB, exports, population…)
  h2 « Trois secteurs, trois trajectoires »
  [.grille-cartes]     3 .carte-secteur (chacune avec son data-secteur) :
                       liseré 4px couleur, h3, 2 lignes de texte,
                       chiffre clé + « Voir la trajectoire → »
  [.conteneur-graphique]  1 graphique de synthèse multi-séries (les 3 secteurs
                          indexés base 100 — jamais de double axe)
[.pied-page] marque · mention stage DIGIUP · lien Sources
```

## 4. Wireframe — Page secteur (ex. automobile)

Racine de page : `<div data-secteur="automobile">`.

```
[.nav-haut]     lien du secteur en .actif (fond doux bleu)
[.hero]         surtitre « SECTEUR » + h1 + description + 1 .badge (ex. « Données 2010–2024 »)
[.menu-ancres]  sticky sous la nav : 01 Panorama · 02 Production · 03 Exports · 04 Emploi · 05 Perspectives
[.conteneur]
  [.section-chapitre #panorama]   h2 (numéro 01 en --accent-sombre) + intro
      [.grille-kpi]               3–4 .carte-kpi du secteur
  [.section-chapitre #production] h2 + intro
      [.conteneur-graphique]      graphique principal (série héros en couleur secteur)
  … un .conteneur-graphique (ou .grille-graphiques ×2) par chapitre …
  [.section-chapitre #perspectives] projection avec .zone-projection
[.pied-page]
```

Ordre strict, un chapitre = un `id` d'ancre. `scroll-margin-top` est déjà géré en CSS.

## 5. Règles des graphiques (composants SVG React)

- **Dimensions** : `viewBox="0 0 720 400"`, largeur 100 % (responsive via viewBox).
  Marges internes : haut 20, droite 110 (place des étiquettes directes), bas 36, gauche 44.
- **Lignes** 2px bouts ronds (`.ligne-serie`), points r=4 avec anneau blanc 2px
  (`.point-donnee`), aires à 8 % d'opacité (`.aire-serie`).
- **Grille** : 4–5 lignes horizontales pleines très claires (`.grille-y`), valeurs
  d'axe rondes (0 / 100 / 200…). Jamais de grille en pointillés, jamais de cadre.
- **Étiquettes directes** au bout des lignes (`.etiquette-serie`, texte encre +
  pastille `.cle-serie`). Dès 2 séries, ajouter aussi la `.legende` au-dessus.
  Valeurs ponctuelles (`.etiquette-valeur`) : sélectives — dernier point, pic,
  jamais sur tous les points.
- **Multi-séries** : série « héros » en couleur, contexte en gris `.ligne-contexte` ;
  2e série colorée via `style={{ '--couleur-serie': 'var(--couleur-marque)' }}`.
- **Interdits** : double axe Y (indexer base 100 à la place), barres qui ne partent
  pas de zéro, camembert pour comparer des valeurs proches, couleur seule comme info.
- **Projection** : bande `.zone-projection` + libellé « PROJECTION » + segment de
  ligne en `.ligne-serie--projection` (pointillés) à partir de la dernière année réelle.
- **Événements** : `.annotation-evenement` (trait vertical pointillé + étiquette
  courte « 2020 · Covid-19 »).
- **Barres** : ≤ 24px d'épaisseur, écart ≥ 2px entre barres qui se touchent ;
  extrémité arrondie 4px côté valeur si simple à coder (sinon rectangle net, acceptable).
- **Chaque graphique** vit dans `.conteneur-graphique` : entête (titre 17px +
  sous-titre unité/période + boutons `.bouton--petit` « Graphique | Données | CSV »),
  figure, puis source. La vue « Données » affiche `.tableau-donnees` avec les mêmes
  valeurs : c'est l'équivalent accessible obligatoire de chaque graphique.
- **Source** obligatoire sous chaque graphique : `Source : Office des changes (2024) — lien`.
- **Infobulle** `.infobulle` : div HTML absolue au-dessus du SVG, jamais le seul
  moyen de lire une valeur.

## 6. Ton des libellés

- Phrases courtes, factuelles, sans superlatif : « Les exportations automobiles ont
  triplé entre 2014 et 2024 », pas « une croissance explosive ».
- Toujours l'unité et la période : « 141 Mds MAD (2024) », « +12 % vs 2023 ».
- Chiffres arrondis à 2–3 chiffres significatifs dans les KPI (le tableau garde la précision).
- Titres de graphique = le constat (« Le blé importé dépasse la production locale »),
  sous-titre = la mesure (« Millions de tonnes, 2010–2024 »).
- Français, majuscule uniquement en début de libellé (pas de Title Case).

## 7. Classes disponibles (résumé)

`.conteneur` · `.grille-cartes` · `.grille-kpi` · `.grille-graphiques` ·
`.nav-haut` (+ `__marque`, `__liens`, `a.actif`) · `.hero` (+ `__surtitre`, `__description`) ·
`.carte-secteur` (+ `__chiffre`, `__lien`) · `.carte-kpi` (+ `__libelle`, `__valeur`,
`__variation` avec `.hausse`/`.baisse`) · `.section-chapitre` (+ `__numero`, `__intro`) ·
`.menu-ancres` · `.conteneur-graphique` (+ `__entete`, `__titre`, `__sous-titre`,
`__actions`, `__source`) · `.legende` / `.cle-serie` · `.badge` · `.bouton`
(+ `--discret`, `--petit`, `.actif`) · `.tableau-donnees` (+ `.num`) · `.pied-page` ·
SVG : `.grille-y`, `.axe`, `.etiquette-axe`, `.ligne-serie` (+ `--projection`),
`.ligne-contexte`, `.aire-serie`, `.point-donnee`, `.barre-serie`, `.etiquette-serie`,
`.etiquette-valeur`, `.annotation-evenement`, `.zone-projection` (+ `-libelle`), `.infobulle`.
