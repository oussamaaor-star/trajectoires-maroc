/* Les repères d'événements affichés SOUS le graphique, en texte simple.

   POURQUOI DEUX GROUPES.
   La liste ne gardait que les événements compris entre la première et la
   dernière année de la série, et jetait les autres SANS RIEN DIRE. Un seul
   des quinze événements datés tombait dans ce cas — « 2030 · Objectif : plus
   de 52 % de puissance renouvelable » —, mais il n'était affiché nulle part :
   le fichier en annonçait quinze, la plateforme en montrait quatorze, et rien
   ne signalait l'écart. C'est exactement ce que le projet refuse de faire
   avec une donnée manquante ; il n'y a pas de raison de le faire avec un
   événement.

   On ne le remonte pas pour autant sur l'axe : 2030 est une CIBLE ANNONCÉE,
   pas une mesure, et la série d'énergie s'arrête en 2023. L'inscrire dans la
   période observée reviendrait à mélanger une intention et un relevé. Il est
   donc affiché à part, sous une mention qui dit ce qu'il est. Le compte de
   quinze redevient vrai, et aucune valeur n'est inventée.

   La règle est écrite au général, pas pour ce cas : tout événement antérieur
   à la première année ou postérieur à la dernière passe dans le second
   groupe. */
function ListeEvenements({ evenements, serie }) {
  if (!evenements || evenements.length === 0) return null

  const annees = serie.points.map((p) => p.annee)
  const anneeMin = Math.min(...annees)
  const anneeMax = Math.max(...annees)

  const dansLaPeriode = evenements.filter((e) => e.annee >= anneeMin && e.annee <= anneeMax)
  const horsPeriode = evenements.filter((e) => e.annee < anneeMin || e.annee > anneeMax)

  if (dansLaPeriode.length === 0 && horsPeriode.length === 0) return null

  const ligne = (evenement) => (
    <li key={`${evenement.annee}-${evenement.libelle}`}>
      <strong>{evenement.annee}</strong> {evenement.libelle}
    </li>
  )

  return (
    <>
      {dansLaPeriode.length > 0 && (
        <ul className="legende-evenements">{dansLaPeriode.map(ligne)}</ul>
      )}

      {horsPeriode.length > 0 && (
        <>
          <p className="legende-evenements__mention">
            Hors de la période observée ({anneeMin}–{anneeMax}) — donc absent du graphique :
          </p>
          <ul className="legende-evenements legende-evenements--hors-periode">
            {horsPeriode.map(ligne)}
          </ul>
        </>
      )}
    </>
  )
}

export default ListeEvenements
