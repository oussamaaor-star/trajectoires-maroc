/* ============================================================================
   analyse.js — LE MOTEUR DE SYNTHÈSE AUTOMATIQUE (version simple)
   ----------------------------------------------------------------------------
   POURQUOI CE FICHIER
   La fiche de stage demande « l'automatisation d'analyses et de synthèses ».
   Ici, deux petites fonctions LISENT une série de chiffres et en tirent
   automatiquement du texte et une projection. Rien n'est écrit à la main :
   chaque nombre vient d'un calcul sur les points de la série. Aucun modèle de
   langage, aucun hasard — les mêmes données donnent toujours le même résultat,
   ce qui rend le tout vérifiable et testable.

   Calculs utilisés : minimum, maximum, pourcentage, moyenne. Rien de plus.
   ============================================================================ */
import { formate, formateNombre } from './formatage.js'

/* Arrondi à 1 décimale : évite d'afficher « 0,30000000000000004 ». */
function arrondi1(valeur) {
  return Math.round(valeur * 10) / 10
}

/* Une série déjà exprimée en POURCENTAGE ne se raconte pas comme une série en
   tonnes. Dire qu'une part passée de 14,3 % à 11,8 % « a diminué de 17,5 % »,
   c'est un pourcentage de pourcentage : le lecteur comprend que les
   importations de carburants ont chuté d'un sixième, alors que c'est leur
   PART qui a perdu 2,5 points. La règle est donc : pour ces séries, on parle
   en POINTS, jamais en pour cent. */
function estPourcentage(serie) {
  return String(serie?.unite ?? '').trim().startsWith('%')
}

/* --- Phrase 1 : l'évolution de la première à la dernière valeur -------------
   Quatre cas :
   - série en POURCENTAGE : écart en points (voir estPourcentage ci-dessus) ;
   - départ à zéro (ou négatif) : on ne peut pas calculer de pourcentage
     (division par zéro), on le dit honnêtement ;
   - rapport ≥ 2 : ça se lit mieux en « multiplié par N » ;
   - sinon : une simple variation en pourcentage. */
function phraseEvolution(serie) {
  const premier = serie.points[0]
  const dernier = serie.points[serie.points.length - 1]
  const depart = `${formate(premier.valeur, serie.unite)} en ${premier.annee}`
  const arrivee = `${formate(dernier.valeur, serie.unite)} en ${dernier.annee}`

  /* Les séries en pourcentage passent avant tout le reste : ni rapport ni
     variation relative n'ont de sens sur une part. */
  if (estPourcentage(serie)) {
    const points = arrondi1(dernier.valeur - premier.valeur)
    const sensPoints = points >= 0 ? 'gagné' : 'perdu'
    const mot = Math.abs(points) >= 2 ? 'points' : 'point'
    /* « la valeur » et non « la part » : trois de ces séries sont des TAUX
       (croissance, inflation, chômage), pas des parts d'un tout. « La part
       d'inflation a perdu 6,1 points » ne veut rien dire. */
    return `De ${depart} à ${arrivee}, la valeur a ${sensPoints} ${formateNombre(Math.abs(points))} ${mot} sur la période.`
  }

  if (premier.valeur <= 0) {
    return `De ${depart} à ${arrivee} : forte progression depuis un niveau très faible (aucun pourcentage n'est calculable à partir de zéro).`
  }

  const rapport = dernier.valeur / premier.valeur
  if (rapport >= 2) {
    /* EFFET DE BASE. Quand la série démarre presque à zéro, le rapport devient
       spectaculaire sans rien apprendre : les exportations de voitures partent
       de 0,007 milliard de dirhams en 1998, donc « ×8 444,7 » en 2025. Le
       chiffre est exact, mais il mesure surtout la petitesse du point de
       départ. On le dit dans la phrase, plutôt que de laisser croire à une
       performance de cet ordre. */
    const maximum = Math.max(...serie.points.map((p) => p.valeur))
    const effetDeBase = premier.valeur < maximum * 0.05
    const mention = effetDeBase ? ' — un rapport amplifié par le très faible niveau de départ' : ''
    return `De ${depart} à ${arrivee}, la valeur a été multipliée par ${formateNombre(arrondi1(rapport))}${mention}.`
  }

  const pourcentage = arrondi1((rapport - 1) * 100)
  const sens = pourcentage >= 0 ? 'augmenté' : 'diminué'
  return `De ${depart} à ${arrivee}, la valeur a ${sens} de ${formateNombre(Math.abs(pourcentage))} % sur la période.`
}

/* --- Phrase 2 : le maximum et le minimum, avec leur année ------------------- */
function phraseExtremes(serie) {
  let max = serie.points[0]
  let min = serie.points[0]
  for (const p of serie.points) {
    if (p.valeur > max.valeur) max = p
    if (p.valeur < min.valeur) min = p
  }
  return `Le maximum est atteint en ${max.annee} (${formate(max.valeur, serie.unite)}) et le minimum en ${min.annee} (${formate(min.valeur, serie.unite)}).`
}

/* LA fonction publique : 2 phrases pour une série.
   Renvoie [] si la série a moins de 2 points (pas d'évolution à raconter). */
export function phrasesDeLaSerie(serie) {
  if (!serie || !Array.isArray(serie.points) || serie.points.length < 2) return []
  return [phraseEvolution(serie), phraseExtremes(serie)]
}

/* --- La projection simple (indicateur prospectif) --------------------------
   On prolonge la série de 2 ans en suivant sa tendance récente. La tendance
   est la MOYENNE des variations des 3 dernières années : on applique cette
   variation moyenne aux 2 années suivantes. C'est volontairement basique
   (« j'ai prolongé la tendance »), sans modèle statistique ni intervalle.
   Une valeur projetée négative est ramenée à 0 (une production, une part…
   ne descend pas sous zéro). Renvoie [] s'il n'y a pas assez d'historique. */
export function projetteDeuxAns(points) {
  if (!Array.isArray(points) || points.length < 4) return []
  const n = points.length
  const variation1 = points[n - 1].valeur - points[n - 2].valeur
  const variation2 = points[n - 2].valeur - points[n - 3].valeur
  const variation3 = points[n - 3].valeur - points[n - 4].valeur
  const tendance = (variation1 + variation2 + variation3) / 3

  const derniere = points[n - 1]
  const projete = (k) => ({
    annee: derniere.annee + k,
    valeur: Math.max(0, Number((derniere.valeur + tendance * k).toFixed(2))),
  })
  return [projete(1), projete(2)]
}
