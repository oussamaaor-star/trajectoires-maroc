# Provenance des données de la plateforme

> **Statut au 15/08/2026.** Les 26 séries affichées viennent toutes de sources
> publiques vérifiables : **12 séries douanières** livrées par le binôme data le
> 02/08/2026 (Office des Changes) et **14 séries** relevées à la Banque Mondiale
> le 20/07/2026, auxquelles s'ajoute la population par région du HCP (RGPH 2024).
> Aucune valeur n'est inventée, aucun trou n'est comblé.
>
> **Une seule exception, et elle est signalée dans l'interface :** le fichier
> `src/data/predictions.json` ne sort d'aucun modèle (voir la section dédiée
> plus bas). Les indicateurs économiques **régionaux** restent également à
> livrer — la page Territoires affiche pour l'instant une donnée démographique.

## Fichiers

| Fichier | Contenu |
|---|---|
| `src/data/secteurs.json` | Config des 3 secteurs (nom, résumé, 4-5 KPI chacun) |
| `src/data/series.json` | 26 séries temporelles (23 sectorielles + 3 de contexte) |
| `src/data/evenements.json` | 15 événements listés en texte sous les graphiques |
| `src/data/sources.json` | Sources, indicateurs couverts, limites |
| `src/data/valeurs-regionales.json` | Valeurs par région (population, page Territoires) |
| `src/data/regions-noms.json` | Codes région MA-01…MA-12 → noms |

## Provenance série par série

### Réel — API Banque Mondiale (collecte du 20/07/2026, pays MAR)

| Série | Code indicateur | Période | Remarque |
|---|---|---|---|
| Production céréalière | AG.PRD.CREL.MT | 1990-2024 | convertie en millions de tonnes |
| Rendement céréalier | AG.YLD.CREL.KG | 1990-2024 | kg/ha, arrondi à l'unité |
| Terres arables | AG.LND.ARBL.HA | 1990-2023 | convertie en millions d'hectares |
| Part imports alimentaires | TM.VAL.FOOD.ZS.UN | 1993-2024 | % des imports de marchandises |
| Dépendance énergétique | EG.IMP.CONS.ZS | 1990-2023 | imports nets en % de l'énergie utilisée |
| Conso énergie/habitant | EG.USE.PCAP.KG.OE | 1990-2023 | kg équivalent pétrole |
| Part renouvelables | EG.FEC.RNEW.ZS | 1990-2021 | ⚠️ s'arrête en 2021 |
| Part imports carburants | TM.VAL.FUEL.ZS.UN | 1993-2024 | % des imports de marchandises |
| Part exports manufacturés | TX.VAL.MANF.ZS.UN | 1993-2024 | % des exports de marchandises |

### Réel — API Banque Mondiale via le fichier interne `data/clean/indicateurs_long.csv`

| Série | Code | Période retenue |
|---|---|---|
| Poids de l'industrie dans le PIB | NV.IND.TOTL.ZS | 1990-2025 |
| Poids de l'agriculture dans le PIB | NV.AGR.TOTL.ZS | 1990-2025 |
| Croissance du PIB (contexte) | NY.GDP.MKTP.KD.ZG | 1990-2025 |
| Inflation (contexte) | FP.CPI.TOTL.ZG | 1990-2025 |
| Chômage (contexte) | SL.UEM.TOTL.ZS | 1991-2025 |

### Réel — Office des Changes, livré par le binôme data le 02/08/2026

Douze séries de commerce extérieur, **en remplacement** des trois séries UN
Comtrade utilisées jusqu'au 02/08 (exports de voitures, exports aéronautiques,
imports de gaz, en Md USD 2010-2023). Les douanes marocaines couvrent une
période trois fois plus longue et une nomenclature plus fine.

| Série | Période | Unité |
|---|---|---|
| Exportations de voitures de tourisme | 1998-2025 | milliards DH |
| Exportations de pièces automobiles | 1998-2025 | milliards DH |
| Importations de pièces automobiles | 1998-2025 | milliards DH |
| Exportations aéronautiques | 1998-2025 | milliards DH |
| Solde net de la filière automobile | 1998-2025 | milliards DH |
| Importations de blé | 1998-2025 | milliards DH |
| Importations d'orge | 1998-2025 | milliards DH |
| Importations d'autres céréales | 1998-2025 | milliards DH |
| Importations de gaz de pétrole | 1998-2025 | milliards DH |
| Importations de pétrole brut | 1998-2024 | milliards DH |
| Importations de produits pétroliers raffinés | 1998-2025 | milliards DH |
| Importations de houilles | 1998-2025 | milliards DH |

**Ce qui a été fait au fichier reçu** (un tableau croisé mensuel, janvier 1998 à
mars 2026) : agrégation des mois en totaux annuels, et **exclusion de 2026**,
incomplète (3 mois sur 12) — la laisser aurait dessiné un effondrement qui
n'existe pas. Le « solde net de la filière automobile » (exportations de voitures
et de pièces, moins importations de pièces) est un **calcul de la plateforme**,
pas une publication de l'Office des Changes.

⚠️ Valeurs en dirhams **courants** : une progression sur 28 ans mélange effet
prix et effet volume. Le début de série est très bas (0,007 Md DH d'exportations
de voitures en 1998), ce qui rend tout rapport de croissance spectaculaire mais
peu informatif — le moteur d'analyse le signale de lui-même.

### Ce qui n’a pas été fait — le fond de carte

La page Territoires **n’affiche pas de carte**. Les douze régions y sont
représentées par des barres horizontales, triées par valeur décroissante
(`src/composants/BarresRegions.jsx`).

Un fond de carte avait été envisagé, à partir du découpage geoBoundaries
gbOpen MAR ADM1 sous licence ODbL. Il n’a pas été intégré : le seul indicateur
régional disponible est la population, une donnée de cadrage et non un
indicateur économique, et une carte du Maroc coloriée par population aurait
surtout appris au lecteur où vivent les Marocains. Les barres disent la même
chose sans en promettre davantage.

### Réel — Population par région : HCP, RGPH 2024 (relevé le 21/07/2026)

Seule donnée régionale chiffrée présente aujourd'hui dans
`src/data/valeurs-regionales.json`.

| Élément | Détail |
|---|---|
| Indicateur | Population légale au 1er septembre 2024, par région |
| Source | **HCP — RGPH 2024**, décret n° 2.24.1009 |
| Pages consultées | [Publication du 07/11/2024](https://www.hcp.ma/Population-legale-du-Royaume-du-Maroc-repartie-par-regions-provinces-et-prefectures-et-communes-selon-les-resultats-du_a3974.html) et le [fichier Excel officiel du 22/11/2024](https://www.hcp.ma/downloads/RGPH-2024_t22752.html) |
| Contrôle | Les deux publications donnent les mêmes 12 valeurs ; leur **somme égale exactement** le total national publié (**36 828 330 habitants**) |

Ce contrôle n'est pas seulement documenté, il est **automatisé** : le test
« retrouve le total national publié par le HCP » (`tests/donnees-integrite.test.mjs`)
échoue si un seul chiffre est altéré.

> ⚠️ **C'est une donnée STRUCTURELLE, pas économique.** Elle est affichée pour que
> la page Territoires fonctionne sur des chiffres réels et vérifiables en
> attendant les indicateurs sectoriels du binôme data. Le site le dit
> lui-même : un encart au-dessus des barres (champ `note` du fichier de
> données) le précise, et il
> disparaîtra tout seul quand l'indicateur affiché sera économique.

**Ce qui a été volontairement écarté : les superficies régionales.** Aucun tableau
officiel unique ne les publie ; les valeurs trouvées viennent de documents
hétérogènes, deux d'entre elles ne sont pas du HCP, et Dakhla-Oued Ed-Dahab
présente une divergence de ~12 000 km² entre sources officielles. En cas de doute
sur une valeur, on ne la met pas.

## Ce qui est approximatif ou à connaître

- **Arrondis** : milliards USD et millions de tonnes/hectares à 2 décimales,
  pourcentages à 1 décimale, kg à l'unité. Les valeurs exactes sont dans les
  fichiers bruts du scratchpad de collecte et re-téléchargeables via les API.
- **KPI « variation »** : variation **relative** en % par rapport à l'année
  précédente, calculée sur les valeurs arrondies (ex. production céréalière
  2024 : −43,0 % vs 2023). `null` si l'année précédente manque.
- **Années récentes** : les valeurs 2024-2025 de la Banque Mondiale sont des
  estimations susceptibles d'être révisées.
- **Série écartée** : la part des énergies fossiles (EG.USE.COMM.FO.ZS) a été
  téléchargée mais **non retenue** — la série contient des zéros aberrants après
  2015 (interruption de la série côté Banque Mondiale).
- **Série écartée** : TX.VAL.TRAN.ZS.WT (services de transport en % des exports
  de services) a été téléchargée mais non retenue : elle mesure les *services*
  de transport, pas les exportations de véhicules — hors sujet pour le secteur
  automobile.
- **Événements** (`evenements.json`) : dates factuelles connues (Renault Tanger
  2012, PSA Kénitra 2019, accord Boeing 2016, fermeture Samir 2015, Noor I 2016,
  fermeture GME octobre 2021, sécheresses 1995/2016/2020/2022/2024, guerre en
  Ukraine 2022). Les chiffres cités dans les détails (ex. « 1,8 million de
  tonnes en 1995 ») viennent des séries Banque Mondiale ci-dessus. L'entrée
  « Objectif 52 % renouvelable » porte l'année **2030** : c'est une cible
  officielle, pas une donnée observée.
- **Résumés de secteurs** : rédigés à partir des données ci-dessus ; le chiffre
  « plus de 90 % » de dépendance énergétique correspond à EG.IMP.CONS.ZS
  (93,6 % en 2023).

## ⚠️ `src/data/predictions.json` — prévisions INVENTÉES (jeu de démonstration)

**Ce fichier est le seul du projet dont les chiffres ne viennent d'aucune
source.** Il a été écrit à la main le 21/07/2026 pour développer et tester
l'affichage des prévisions **avant** que le binôme data ne livre ses modèles.

- **Une seule série est couverte aujourd’hui**, `exports_voitures` (2026-2028) ;
  elle porte le champ `"modele": "démonstration"`. La série énergétique a été
  retirée du fichier : son dernier relevé date de 2023, et le prolongement
  portait donc sur des années déjà écoulées.
- Ce champ est ce qui déclenche, sur le site, le bandeau rouge/coloré
  « **Prévisions de démonstration — en attente des modèles de l'équipe data** »
  au-dessus du graphique concerné. La vue « Données » et l'export CSV, eux,
  **excluent** ces années : on ne télécharge que de l'observé. Rien n'est
  affiché sans avertissement, et rien n'est exporté sans avoir été observé.
- Le jour où le binôme livre un vrai fichier (champ `modele` renseigné :
  `Prophet`, `ARIMA`…), le bandeau disparaît **tout seul** et laisse place à
  une mention discrète « Modèle : Prophet ». Aucune ligne de code à modifier.

**Comment ces valeurs ont été fabriquées** (pour pouvoir l'expliquer, pas pour
les défendre) : simple prolongement plausible de la dernière valeur observée,
avec un intervalle qui s'élargit d'année en année. Aucun calcul statistique,
aucun ajustement, aucune validation.

| Série | Dernier point réel | Prolongement écrit à la main |
|---|---|---|
| Exportations de voitures | 59,11 Md DH (2025) | 61,11 / 63,11 / 65,10 (2026-2028), intervalle qui s'élargit de ±3,7 à ±11,7 |

*(Une ligne « Dépendance énergétique » figurait ici jusqu'au 20/08/2026. Elle a
été retirée avec la série elle-même : prolonger jusqu'en 2026 une série dont le
dernier relevé date de 2023 revenait à dessiner en pointillés des années déjà
écoulées.)*

**À faire dès la livraison du binôme :** déposer `predictions.csv` dans
`donnees-binome/` puis lancer `npm run convertir`, qui régénère intégralement ce
fichier — et supprimer cette section. Aucune ligne de code à modifier : le
bandeau d'avertissement disparaît de lui-même dès que la colonne `modele` porte
un nom réel.

## Ce qui reste à livrer

Deux briques manquent, et la plateforme est prête à les recevoir : les fichiers
se déposent dans `donnees-binome/`, `npm run convertir` les intègre, rien d'autre
n'est à toucher. Le format exact et un exemple de chaque fichier sont dans
`donnees-binome/LISEZMOI.md`.

| Brique | Fichier attendu | Ce qui est affiché en attendant |
|---|---|---|
| Prévisions issues d'un modèle | `predictions.csv` | un prolongement écrit à la main, annoncé comme tel partout où il apparaît |
| Indicateurs économiques régionaux | `regions.csv` | la population du RGPH 2024, donnée structurelle et non économique |

La conversion refuse d'écrire quoi que ce soit tant qu'une erreur subsiste dans
un fichier, et les données remplacées sont copiées dans `src/data/.sauvegarde/`
avant d'être écrasées.
