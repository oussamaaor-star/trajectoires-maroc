/* ============================================================================
   donnees.js — la « couche d'accès aux données »
   Les pages et composants ne lisent JAMAIS les fichiers JSON directement :
   ils passent par ces petites fonctions. Le jour où le binôme data livre le
   dataset officiel, seuls les fichiers src/data/*.json changent — pas le code.
   ============================================================================ */
import secteurs from '../data/secteurs.json'
import series from '../data/series.json'
import evenements from '../data/evenements.json'
import sources from '../data/sources.json'

export const tousLesSecteurs = secteurs
export const toutesLesSources = sources
export const toutesLesSeries = series
export const tousLesEvenements = evenements

/* Un secteur par son id (« automobile », « ble », « energie »).
   Renvoie undefined si l'id n'existe pas — la page redirige alors. */
export function secteurParId(id) {
  return secteurs.find((s) => s.id === id)
}

/* Une série temporelle par son id (ex. « exports_voitures »). */
export function serieParId(id) {
  return series.find((s) => s.id === id)
}

/* Toutes les séries d'un secteur (« contexte » = les séries nationales). */
export function seriesDuSecteur(idSecteur) {
  return series.filter((s) => s.secteur === idSecteur)
}

/* Les événements marquants d'un secteur (année + libellé). */
export function evenementsDuSecteur(idSecteur) {
  return evenements.filter((e) => e.secteur === idSecteur)
}

/* Dernier point connu d'une série : { annee, valeur }. */
export function dernierPoint(serie) {
  return serie.points[serie.points.length - 1]
}

/* Valeur d'une série pour une année donnée (null si l'année manque :
   toutes les séries ne couvrent pas la même période). */
export function valeurPour(serie, annee) {
  const point = serie.points.find((p) => p.annee === annee)
  return point ? point.valeur : null
}

/* Union triée des années couvertes par plusieurs séries
   (sert aux tableaux de données et à l'export CSV). */
export function anneesDesSeries(listeSeries) {
  const toutes = new Set()
  listeSeries.forEach((s) => s.points.forEach((p) => toutes.add(p.annee)))
  return [...toutes].sort((a, b) => a - b)
}

/* Période couverte par un groupe de séries : « 1990–2025 » (badge du hero). */
export function periodeDesSeries(listeSeries) {
  const annees = anneesDesSeries(listeSeries)
  return `${annees[0]}–${annees[annees.length - 1]}`
}

/* Sites officiels des fournisseurs de données (lien sous chaque graphique). */
const URLS_SOURCES = {
  'Banque Mondiale': 'https://data.worldbank.org',
  'Office des Changes': 'https://www.oc.gov.ma',
}

export function urlDeLaSource(nomSource) {
  return URLS_SOURCES[nomSource]
}
