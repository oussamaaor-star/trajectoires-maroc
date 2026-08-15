import { tableauQualite, syntheseQualite } from '../utils/qualite'
import { toutesLesSeries } from '../utils/donnees'
import { formateNombre } from '../utils/formatage'

/* ============================================================================
   TableauQualite — LE RELEVÉ DES TROUS
   ----------------------------------------------------------------------------
   La plateforme affirme partout qu'elle ne comble jamais une valeur manquante.
   Ce tableau est la preuve : il compte les trous, série par série, et il est
   calculé au chargement à partir des données — pas saisi à la main. Le jour où
   une série s'allonge ou se troue, le tableau suit tout seul.

   Une ligne par série : sa période, ses relevés, sa couverture, et les années
   qui manquent, nommées. « 6 trous » ne se vérifie pas ; « 2016 à 2021 » se
   vérifie en ouvrant le fichier.
   ============================================================================ */
function TableauQualite() {
  const lignes = tableauQualite(toutesLesSeries)
  const synthese = syntheseQualite(toutesLesSeries)

  /* Les années manquantes, écrites en PLAGES quand elles se suivent :
     « 2016-2021, 2023 » se lit, « 2016, 2017, 2018, 2019, 2020, 2021, 2023 »
     se déchiffre. */
  const enPlages = (annees) => {
    if (annees.length === 0) return '—'
    const plages = []
    let debut = annees[0]
    let precedente = annees[0]
    for (const annee of annees.slice(1)) {
      if (annee === precedente + 1) {
        precedente = annee
        continue
      }
      plages.push(debut === precedente ? `${debut}` : `${debut}-${precedente}`)
      debut = annee
      precedente = annee
    }
    plages.push(debut === precedente ? `${debut}` : `${debut}-${precedente}`)
    return plages.join(', ')
  }

  return (
    <section className="section-chapitre">
      <h2>Ce que les données couvrent vraiment</h2>
      <p className="section-chapitre__intro">
        Cette plateforme ne comble jamais une valeur manquante : une année non
        publiée reste un trou, sur le graphique comme dans le fichier. La
        contrepartie, c'est de les compter. Le relevé ci-dessous est calculé à
        partir des séries elles-mêmes, il change avec elles.
      </p>

      {/* Les quatre chiffres qui résument le jeu de données. */}
      <ul className="qualite-synthese">
        <li>
          <strong>{synthese.series}</strong> séries suivies
        </li>
        <li>
          <strong>{formateNombre(synthese.releves)}</strong> valeurs publiées
        </li>
        <li>
          <strong>{formateNombre(synthese.couverture)}&#8239;%</strong> des années couvertes
        </li>
        <li>
          <strong>{synthese.completes}</strong> séries sans aucun trou
        </li>
      </ul>

      <div className="defilement-tableau">
        <table className="tableau-donnees">
          <caption className="sr-only">
            Couverture de chaque série : période, nombre de relevés, part des années
            documentées et années manquantes.
          </caption>
          <thead>
            <tr>
              <th scope="col">Série</th>
              <th scope="col">Période</th>
              <th scope="col" className="num">Relevés</th>
              <th scope="col" className="num">Couverture</th>
              <th scope="col">Années manquantes</th>
            </tr>
          </thead>
          <tbody>
            {lignes.map((ligne) => (
              <tr key={ligne.id}>
                <td>{ligne.nom}</td>
                {/* dir="ltr" : une plage d'années garde son ordre de lecture */}
                <td dir="ltr">
                  {ligne.debut}-{ligne.fin}
                </td>
                <td className="num">
                  {ligne.releves} / {ligne.etendue}
                </td>
                <td className="num">{formateNombre(ligne.couverture)}&#8239;%</td>
                <td dir="ltr">{enPlages(ligne.manquantes)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mention-prevision">
        La couverture rapporte le nombre de relevés au nombre d'années
        possibles entre la première et la dernière — et non au nombre de
        relevés lui-même, qui donnerait 100&#8239;% partout.
      </p>
    </section>
  )
}

export default TableauQualite
