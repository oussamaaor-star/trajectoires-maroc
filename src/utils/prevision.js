/* ============================================================================
   prevision.js — les PRÉVISIONS livrées par le binôme data
   ----------------------------------------------------------------------------
   POURQUOI CE FICHIER EXISTE
   La plateforme sait déjà prolonger une série toute seule : `projetteDeuxAns`
   (analyse.js) suit la moyenne des trois dernières variations. C'est simple,
   c'est honnête, et c'est écrit sur le graphique — mais ce n'est pas un modèle
   statistique, et cela ne donne aucun intervalle.

   Le binôme data, lui, produit de vraies prévisions : une valeur, une borne
   basse, une borne haute et un nom de modèle. Ce fichier est la porte par
   laquelle elles entrent. Tant qu'il n'y a pas de fichier — ou pas de
   prévision pour la série affichée — ces fonctions renvoient `null` et la
   plateforme se comporte exactement comme avant.

   FORMAT ATTENDU (src/data/predictions.json, produit par outils/convertir-csv.mjs) :
     [ { "id": "exports_voitures",
         "modele": "Prophet",
         "points": [ { "annee": 2026, "valeur": 62.4, "basse": 58.1, "haute": 66.7 } ] } ]

   Le champ `id` est celui d'une série de series.json : c'est ce qui rattache
   une prévision à sa courbe.
   ============================================================================ */

/* Le fichier est FACULTATIF. Un `import predictions from '../data/predictions.json'`
   ferait échouer la compilation le jour où il n'est pas là. import.meta.glob
   (fourni par Vite) le cherche au moment du build : s'il n'existe pas, on
   récupère un objet vide, sans erreur ni message. */
const fichiers = import.meta.glob('../data/predictions.json', { eager: true })
const contenu = Object.values(fichiers)[0]?.default
const PREVISIONS = Array.isArray(contenu) ? contenu : []

/* Un point utilisable a au minimum une année et une valeur numériques. Le
   reste (cellule vide dans le CSV d'origine, fichier à moitié rempli) est
   écarté sans bruit : mieux vaut ne rien tracer qu'un point faux. */
function pointValide(point) {
  return point != null && Number.isFinite(point.annee) && Number.isFinite(point.valeur)
}

/* Les bornes sont FACULTATIVES. Si elles manquent, on retombe sur la valeur
   centrale : la bande de confiance a alors une épaisseur nulle. On ne fabrique
   JAMAIS un intervalle qui n'a pas été livré — ce serait inventer une
   incertitude, c'est-à-dire inventer une information. */
function normalisePoint(point) {
  const basse = Number.isFinite(point.basse) ? Math.min(point.basse, point.valeur) : point.valeur
  const haute = Number.isFinite(point.haute) ? Math.max(point.haute, point.valeur) : point.valeur
  return { annee: point.annee, valeur: point.valeur, basse, haute }
}

/* LA fonction d'entrée : la prévision d'une série, ou null s'il n'y en a pas.
   On ne garde que les années POSTÉRIEURES au dernier point réel — une
   prévision qui recouvrirait des années déjà observées se superposerait à la
   courbe et brouillerait la lecture. */
export function previsionPourSerie(serie) {
  if (!serie || !Array.isArray(serie.points) || serie.points.length === 0) return null

  const trouvee = PREVISIONS.find((p) => p != null && p.id === serie.id)
  if (!trouvee || !Array.isArray(trouvee.points)) return null

  const derniereAnneeReelle = serie.points[serie.points.length - 1].annee
  const points = trouvee.points
    .filter(pointValide)
    .map(normalisePoint)
    .filter((p) => p.annee > derniereAnneeReelle)
    .sort((a, b) => a.annee - b.annee)

  if (points.length === 0) return null
  return { id: trouvee.id, modele: String(trouvee.modele ?? '').trim(), points }
}

/* Avertissement ou simple mention ?
   Le jeu de démonstration porte `"modele": "démonstration"`. Un modèle vide
   est traité pareil : ce n'est pas davantage un vrai modèle, et afficher
   « Modèle :  » n'aurait aucun sens. Le jour où le binôme livre
   `"modele": "Prophet"`, l'avertissement disparaît tout seul — aucune
   bascule à faire à la main. */
export function estDemonstration(prevision) {
  const modele = String(prevision?.modele ?? '').toLowerCase()
  return modele === '' || modele === 'démonstration' || modele === 'demonstration'
}

/* Toutes les valeurs prévues, BORNES COMPRISES. Sert à étendre l'échelle
   verticale du graphique : sans elles, le haut de la bande sortirait du
   cadre. */
export function valeursPrevues(prevision) {
  return prevision.points.flatMap((p) => [p.valeur, p.basse, p.haute])
}
