import { anneesDesSeries, valeurPour } from '../utils/donnees'
import { formateNombre, uniteCourte } from '../utils/formatage'

/* Tableau de données : l'équivalent accessible de chaque graphique (l'infobulle
   n'est jamais le seul moyen de lire une valeur). Une ligne par année (les plus
   récentes en premier), une colonne par série. « — » quand une série ne couvre
   pas l'année. */
function TableauDonnees({ series }) {
  const annees = anneesDesSeries(series).slice().reverse() // récentes d'abord

  return (
    <table className="tableau-donnees">
      <thead>
        <tr>
          <th scope="col">Année</th>
          {series.map((serie) => (
            <th key={serie.id} scope="col" className="num">
              {serie.nom} ({uniteCourte(serie.unite)})
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {annees.map((annee) => (
          <tr key={annee}>
            <td>{annee}</td>
            {series.map((serie) => {
              const valeur = valeurPour(serie, annee)
              return (
                <td key={serie.id} className="num">
                  {valeur == null ? '—' : formateNombre(valeur)}
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default TableauDonnees
