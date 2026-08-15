/* ============================================================================
   qualite.js — COMPTER LES TROUS DES DONNÉES
   ----------------------------------------------------------------------------
   POURQUOI CE FICHIER EXISTE
   La plateforme répète qu'elle ne comble jamais une valeur manquante : une
   année non publiée reste un trou, sur le graphique comme dans le fichier.
   C'est facile à écrire. Ces fonctions le DÉMONTRENT, en comptant les trous
   série par série — et le relevé est calculé à partir des données elles-mêmes,
   donc il change avec elles. Personne ne peut le laisser vieillir.

   LA RÈGLE QUI COMPTE, ET QUI EST FACILE À RATER
   La couverture se mesure sur l'ÉTENDUE, pas sur le nombre de points. Une
   série qui va de 1998 à 2024 couvre 27 années possibles ; si elle n'a que
   10 relevés, sa couverture est de 37 %, pas de 100 %. Diviser les points par
   eux-mêmes donnerait toujours 100 % — l'erreur donne un tableau rassurant et
   parfaitement inutile.
   ============================================================================ */

/* Les points exploitables d'une série, triés par année. Une valeur non
   numérique n'est pas une donnée : elle ne compte pas comme un relevé. */
function pointsValides(serie) {
  if (!serie || !Array.isArray(serie.points)) return []
  return serie.points
    .filter((p) => p != null && Number.isFinite(p.annee) && Number.isFinite(p.valeur))
    .slice()
    .sort((a, b) => a.annee - b.annee)
}

/* Le relevé d'UNE série : sa période, ses relevés, ses années manquantes.
   `manquantes` est la LISTE des années absentes, pas seulement leur nombre :
   c'est elle qui permet d'écrire « 2016 à 2021 » sous le tableau plutôt qu'un
   « 6 trous » que personne ne peut vérifier. */
export function qualiteDeLaSerie(serie) {
  const points = pointsValides(serie)
  if (points.length === 0) {
    return { id: serie?.id ?? '', nom: serie?.nom ?? '', debut: null, fin: null, releves: 0, etendue: 0, manquantes: [], couverture: 0 }
  }

  const debut = points[0].annee
  const fin = points[points.length - 1].annee
  const etendue = fin - debut + 1
  const presentes = new Set(points.map((p) => p.annee))

  const manquantes = []
  for (let annee = debut; annee <= fin; annee += 1) {
    if (!presentes.has(annee)) manquantes.push(annee)
  }

  return {
    id: serie.id,
    nom: serie.nom,
    unite: serie.unite,
    source: serie.source,
    debut,
    fin,
    releves: points.length,
    etendue,
    manquantes,
    couverture: Math.round((points.length / etendue) * 1000) / 10,
  }
}

/* Le tableau complet, dans l'ordre des séries reçues (donc celui du fichier) :
   deux exécutions donnent le même tableau. */
export function tableauQualite(listeSeries) {
  return (listeSeries ?? []).map(qualiteDeLaSerie)
}

/* Les quatre chiffres du bandeau de synthèse.
   `couverture` est globale : le total des relevés rapporté au total des années
   possibles. Ce n'est PAS la moyenne des couvertures — une série courte et
   parfaite ne doit pas peser autant qu'une série longue et trouée. */
export function syntheseQualite(listeSeries) {
  const lignes = tableauQualite(listeSeries)
  const releves = lignes.reduce((total, l) => total + l.releves, 0)
  const possibles = lignes.reduce((total, l) => total + l.etendue, 0)
  return {
    series: lignes.length,
    releves,
    manquantes: possibles - releves,
    completes: lignes.filter((l) => l.manquantes.length === 0).length,
    couverture: possibles === 0 ? 0 : Math.round((releves / possibles) * 1000) / 10,
    anneeDebut: Math.min(...lignes.filter((l) => l.debut != null).map((l) => l.debut)),
    anneeFin: Math.max(...lignes.filter((l) => l.fin != null).map((l) => l.fin)),
  }
}
