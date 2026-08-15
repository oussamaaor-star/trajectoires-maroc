/* Repères d'événements affichés SOUS le graphique, uniquement sur mobile.
   Pourquoi : sur un téléphone, le graphique est deux fois plus étroit, donc
   les étiquettes dessinées dans le SVG deviennent illisibles et se
   chevauchent. On garde alors les traits pointillés sur la figure (le
   « quand ») et on déplace les libellés ici (le « quoi »).
   L'affichage est piloté par le CSS : .legende-evenements est masquée
   au-dessus de 720px de large. */
function ListeEvenements({ evenements, serie }) {
  if (!evenements || evenements.length === 0) return null

  /* On ne garde que les événements compris dans la période de la série,
     exactement comme le fait la version dessinée sur le graphique. */
  const annees = serie.points.map((p) => p.annee)
  const anneeMin = Math.min(...annees)
  const anneeMax = Math.max(...annees)
  const visibles = evenements.filter((e) => e.annee >= anneeMin && e.annee <= anneeMax)

  if (visibles.length === 0) return null

  return (
    <ul className="legende-evenements">
      {visibles.map((evenement) => (
        <li key={`${evenement.annee}-${evenement.libelle}`}>
          <strong>{evenement.annee}</strong> {evenement.libelle}
        </li>
      ))}
    </ul>
  )
}

export default ListeEvenements
