/* ============================================================================
   graphique.js — géométrie partagée des graphiques SVG
   Tous les graphiques dessinent dans le MÊME repère : un viewBox de 720 × 400
   avec des marges fixes (règle du designer). Le SVG s'étire ensuite à 100 %
   de la largeur disponible, les proportions restent identiques.
   ============================================================================ */

/* Le repère (DESIGN-SPEC §5) : marges haut 20, droite 110 (place réservée aux
   étiquettes au bout des lignes), bas 36 (années), gauche 76 (valeurs).
   La marge gauche a été élargie de 44 à 76 : sur mobile, le SVG est réduit de
   moitié, donc on y agrandit les textes (voir design.css) — et « 2 500 » ne
   tenait plus dans 44 unités, il débordait hors du cadre et était rogné. */
export const VUE = {
  largeur: 720,
  hauteur: 400,
  x0: 76, //  bord gauche de la zone de tracé
  x1: 720 - 110, // bord droit (610)
  y0: 20, //  bord haut
  y1: 400 - 36, // bord bas = ligne de l'axe X (364)
}

/* Choisit une échelle verticale « propre » : un pas rond (1 / 2 / 2,5 / 5
   × une puissance de 10) qui donne au plus 5 intervalles → les valeurs de la
   grille tombent juste (0, 2, 4… et jamais 0, 1,37, 2,74…).
   depuisZero = true force le zéro dans l'échelle (obligatoire pour les barres). */
export function calculeEchelle(valeurs, depuisZero = false) {
  let min = Math.min(...valeurs)
  let max = Math.max(...valeurs)
  if (depuisZero) min = Math.min(0, min)
  if (min === max) max = min + 1 // garde-fou : série plate

  /* pas idéal pour ~4 intervalles, arrondi au « pas rond » le plus proche */
  const brut = (max - min) / 4
  const puissance = 10 ** Math.floor(Math.log10(brut))
  const candidats = [1, 2, 2.5, 5, 10].map((m) => m * puissance)

  let pas = candidats[candidats.length - 1]
  let debut = 0
  let fin = 0
  for (const candidat of candidats) {
    debut = Math.floor(min / candidat) * candidat
    fin = Math.ceil(max / candidat) * candidat
    if ((fin - debut) / candidat <= 5) {
      pas = candidat
      break
    }
  }

  /* graduations : debut, debut+pas, … , fin — nettoyées des erreurs
     d'arrondi binaire (0.30000000000000004 → 0.3) */
  const graduations = []
  for (let v = debut; v <= fin + pas / 1000; v += pas) {
    graduations.push(Number(v.toFixed(10)))
  }
  return { min: graduations[0], max: graduations[graduations.length - 1], graduations }
}

/* Graduations de l'axe X : les années « rondes » (multiples de 5), plus la
   dernière année si elle est assez loin de la dernière graduation.
   L'écart minimal est de 3 ans : à 2 ans, « 2025 » et « 2027 » se touchaient
   sur les séries longues (35 ans de production céréalière + 3 années
   prévues : chaque année n'y occupe que 14 unités du repère). */
export function anneesAxe(annees) {
  if (annees.length === 0) return []

  const graduations = annees.filter((a) => a % 5 === 0)
  const premiere = annees[0]
  const derniere = annees[annees.length - 1]

  /* Garde-fou : sur une période très courte (ex. 2021-2023), aucune année
     n'est un multiple de 5 et l'axe resterait SANS AUCUNE année affichée.
     On retombe alors sur les deux bornes de la période. */
  if (graduations.length === 0) {
    return premiere === derniere ? [premiere] : [premiere, derniere]
  }

  if (derniere % 5 !== 0 && derniere - graduations[graduations.length - 1] >= 3) {
    graduations.push(derniere)
  }
  return graduations
}
