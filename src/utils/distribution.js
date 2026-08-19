/* ============================================================================
   distribution.js — DÉCRIRE LA FORME D'UNE SÉRIE
   ----------------------------------------------------------------------------
   POURQUOI CE FICHIER EXISTE
   `qualite.js` répond à « combien de valeurs manquent ». Il ne dit rien de
   celles qui sont là. Deux séries peuvent avoir la même couverture et ne rien
   avoir en commun : l'une monte régulièrement, l'autre saute du simple au
   sextuple d'une année sur l'autre. C'est cette différence que le présent
   fichier mesure.

   Il a été ajouté après l'analyse de la plateforme de référence, qui publie ce
   relevé pour chacune de ses variables et dont la nôtre ne donnait que la
   moitié : la couverture, mais pas la distribution.

   LA COLONNE QUI JUSTIFIE UNE DÉCISION DE LA PLATEFORME
   La dernière colonne, la DISPERSION, est le rapport de l'écart-type à la
   moyenne, en pourcentage — le coefficient de variation. C'est le chiffre qui
   fonde le refus de projeter la production céréalière : une série dont les
   valeurs s'écartent de près de la moitié de leur moyenne, sans tendance, n'a
   pas de prolongement défendable. Ce refus était jusqu'ici justifié dans le
   texte ; il est désormais lisible sur toutes les séries à la fois.

   DEUX CHOIX DE CALCUL, ET IL FAUT POUVOIR LES DÉFENDRE
   1. L'écart-type est celui d'une POPULATION : la somme des carrés des écarts
      est divisée par N, pas par N − 1. Une série publiée n'est pas un
      échantillon tiré au sort dans un ensemble plus grand — c'est l'intégralité
      de ce que la source a publié sur la période. Diviser par N − 1 corrigerait
      un biais d'échantillonnage qui n'existe pas ici. L'écart entre les deux
      formules est réel mais faible sur nos effectifs (sur trente-cinq
      campagnes, 45,6 % contre 46,2 %).
   2. La médiane d'un effectif pair est la moyenne des deux valeurs centrales.
      C'est la convention usuelle ; elle est rappelée ici parce que l'autre
      convention existe (prendre la valeur inférieure) et donnerait un chiffre
      différent sur les séries de longueur paire, qui sont la majorité des
      nôtres.

   CE QUE CE FICHIER NE PRÉTEND PAS FAIRE
   La dispersion ne se compare pas d'une série en forte croissance à une série
   stationnaire. Sur les exportations automobiles, qui passent de 0,007 à 68
   milliards, elle mesure la CROISSANCE, pas l'instabilité. La page le dit sous
   le tableau, faute de quoi le chiffre serait lu de travers.
   ============================================================================ */

/* Les valeurs exploitables d'une série, triées par année. Une valeur non
   numérique n'est pas une donnée : elle ne rentre dans aucun calcul. Même
   filtre que dans `qualite.js` — les deux tableaux doivent parler des mêmes
   points, sans quoi un relevé compterait 28 valeurs et l'autre 27. */
function pointsValides(serie) {
  if (!serie || !Array.isArray(serie.points)) return []
  return serie.points
    .filter((p) => p != null && Number.isFinite(p.annee) && Number.isFinite(p.valeur))
    .slice()
    .sort((a, b) => a.annee - b.annee)
}

/* La médiane d'une liste de nombres DÉJÀ TRIÉE.
   Effectif impair : la valeur du milieu. Effectif pair : la moyenne des deux
   valeurs centrales. */
export function mediane(valeursTriees) {
  const n = valeursTriees.length
  if (n === 0) return null
  const milieu = Math.floor(n / 2)
  if (n % 2 === 1) return valeursTriees[milieu]
  return (valeursTriees[milieu - 1] + valeursTriees[milieu]) / 2
}

/* L'écart-type de population : racine de la moyenne des carrés des écarts à la
   moyenne. Voir l'en-tête pour la raison du diviseur N. */
export function ecartType(valeurs, moyenne) {
  const n = valeurs.length
  if (n === 0) return null
  const sommeDesCarres = valeurs.reduce((total, v) => total + (v - moyenne) ** 2, 0)
  return Math.sqrt(sommeDesCarres / n)
}

/* Arrondi d'affichage : trois décimales significatives suffisent pour toutes
   nos unités, du milliard de dirhams au kilogramme par hectare. On arrondit au
   dernier moment, jamais dans les calculs intermédiaires — arrondir avant de
   calculer l'écart-type fausserait le résultat. */
function arrondi(v, decimales = 3) {
  if (v == null || !Number.isFinite(v)) return null
  const f = 10 ** decimales
  return Math.round(v * f) / f
}

/* La description d'UNE série.
   `minAnnee` et `maxAnnee` accompagnent l'extremum : un minimum sans son année
   ne se vérifie pas sur le graphique d'à côté, et c'est cette vérification qui
   fait la valeur du tableau. */
export function distributionDeLaSerie(serie) {
  const points = pointsValides(serie)
  const vide = {
    id: serie?.id ?? '',
    nom: serie?.nom ?? '',
    unite: serie?.unite ?? '',
    releves: 0,
    min: null,
    minAnnee: null,
    max: null,
    maxAnnee: null,
    moyenne: null,
    mediane: null,
    ecartType: null,
    dispersion: null,
  }
  if (points.length === 0) return vide

  const valeurs = points.map((p) => p.valeur)
  const triees = valeurs.slice().sort((a, b) => a - b)
  const somme = valeurs.reduce((total, v) => total + v, 0)
  const moyenne = somme / valeurs.length
  const sigma = ecartType(valeurs, moyenne)

  const pointMin = points.reduce((bas, p) => (p.valeur < bas.valeur ? p : bas), points[0])
  const pointMax = points.reduce((haut, p) => (p.valeur > haut.valeur ? p : haut), points[0])

  /* La dispersion n'a de sens que si la moyenne est franchement non nulle :
     diviser par une moyenne proche de zéro produit un pourcentage énorme qui
     ne décrit rien. Dans ce cas la colonne reste vide plutôt que de mentir. */
  const dispersion = Math.abs(moyenne) < 1e-9 ? null : (sigma / Math.abs(moyenne)) * 100

  return {
    id: serie.id,
    nom: serie.nom,
    unite: serie.unite,
    source: serie.source,
    releves: points.length,
    min: arrondi(pointMin.valeur),
    minAnnee: pointMin.annee,
    max: arrondi(pointMax.valeur),
    maxAnnee: pointMax.annee,
    moyenne: arrondi(moyenne),
    mediane: arrondi(mediane(triees)),
    ecartType: arrondi(sigma),
    dispersion: dispersion == null ? null : arrondi(dispersion, 1),
  }
}

/* Le tableau complet, dans l'ordre des séries reçues : deux exécutions donnent
   le même tableau. */
export function tableauDistribution(listeSeries) {
  return (listeSeries ?? []).map(distributionDeLaSerie)
}

/* La série la plus dispersée du lot, celle que la page cite en exemple.
   Écrite ici plutôt que dans le composant : c'est un calcul, et les calculs ne
   vivent pas dans l'affichage. Renvoie `null` si aucune série n'a de
   dispersion calculable. */
export function laPlusDispersee(listeSeries) {
  const avecDispersion = tableauDistribution(listeSeries).filter((l) => l.dispersion != null)
  if (avecDispersion.length === 0) return null
  return avecDispersion.reduce((haut, l) => (l.dispersion > haut.dispersion ? l : haut))
}
