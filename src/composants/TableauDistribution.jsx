import { tableauDistribution, laPlusDispersee } from '../utils/distribution'
import { toutesLesSeries } from '../utils/donnees'
import { formateNombre } from '../utils/formatage'

/* ============================================================================
   TableauDistribution — LA FORME DES SÉRIES
   ----------------------------------------------------------------------------
   Le tableau juste au-dessus dit ce qui MANQUE. Celui-ci décrit ce qui est là :
   entre quelles valeurs la série évolue, autour de quoi elle se tient, et de
   combien elle s'en écarte.

   Il a été ajouté après l'analyse de la plateforme tunisienne de référence, qui
   publie ce relevé pour chacune de ses variables. C'est le seul emprunt direct
   qui lui soit fait, et il est postérieur à la conception de cette plateforme.

   LA COLONNE QU'IL FAUT SAVOIR LIRE
   La dispersion est le rapport de l'écart-type à la moyenne. Sur une série qui
   monte fortement, elle mesure la CROISSANCE et non l'instabilité : les
   exportations automobiles, parties de presque rien, arrivent en tête sans être
   volatiles pour autant. La mise en garde sous le tableau le dit, parce qu'un
   pourcentage affiché sans sa clé de lecture sera lu de travers.
   ============================================================================ */
function TableauDistribution() {
  const lignes = tableauDistribution(toutesLesSeries)
  const haut = laPlusDispersee(toutesLesSeries)

  /* Un nombre absent s'écrit avec un tiret, jamais avec un zéro : zéro est une
     valeur, l'absence n'en est pas une. C'est la même règle que sur les
     graphiques, où un trou reste un trou. */
  const nombre = (v) => (v == null ? '—' : formateNombre(v))

  return (
    <section className="section-chapitre">
      <h2>Comment les valeurs se répartissent</h2>
      <p className="section-chapitre__intro">
        Le relevé précédent compte les années absentes. Celui-ci décrit les
        valeurs présentes : leurs extrêmes avec l’année où ils tombent, la
        valeur centrale, et l’écart moyen à la moyenne. Il est calculé à partir
        des séries elles-mêmes, au chargement de la page.
      </p>

      <div className="defilement-tableau">
        <table className="tableau-donnees">
          <caption className="sr-only">
            Distribution de chaque série : minimum et maximum avec leur année,
            moyenne, médiane, écart-type et dispersion relative.
          </caption>
          <thead>
            <tr>
              <th scope="col">Série</th>
              <th scope="col" className="num">Minimum</th>
              <th scope="col" className="num">Médiane</th>
              <th scope="col" className="num">Moyenne</th>
              <th scope="col" className="num">Maximum</th>
              <th scope="col" className="num">Écart-type</th>
              <th scope="col" className="num">Dispersion</th>
            </tr>
          </thead>
          <tbody>
            {lignes.map((ligne) => (
              <tr key={ligne.id}>
                <td>
                  {ligne.nom}
                  <span className="tableau-donnees__unite"> ({ligne.unite})</span>
                </td>
                <td className="num">
                  {nombre(ligne.min)}
                  {/* dir="ltr" : une année garde son ordre de lecture */}
                  <span className="tableau-donnees__annee" dir="ltr"> {ligne.minAnnee}</span>
                </td>
                <td className="num">{nombre(ligne.mediane)}</td>
                <td className="num">{nombre(ligne.moyenne)}</td>
                <td className="num">
                  {nombre(ligne.max)}
                  <span className="tableau-donnees__annee" dir="ltr"> {ligne.maxAnnee}</span>
                </td>
                <td className="num">{nombre(ligne.ecartType)}</td>
                <td className="num">
                  {ligne.dispersion == null ? '—' : `${formateNombre(ligne.dispersion)} %`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mention-prevision">
        L’écart-type est celui d’une population : ces séries ne sont pas un
        échantillon, elles sont l’intégralité de ce que la source a publié sur
        la période. La <strong>dispersion</strong> rapporte cet écart-type à la
        moyenne, ce qui permet de comparer des séries d’unités différentes.
        Elle se lit avec une précaution : sur une série en forte croissance,
        elle traduit cette croissance et non une instabilité
        {haut && (
          <>
            {' '}— ainsi «&#8239;{haut.nom}&#8239;», en tête avec{' '}
            {formateNombre(haut.dispersion)}&#8239;%, parce qu’elle part de{' '}
            {formateNombre(haut.min)} pour atteindre {formateNombre(haut.max)}
          </>
        )}
        . C’est entre séries de même allure qu’elle est parlante : la production
        céréalière atteint 45,6&#8239;% <em>sans tendance</em>, et c’est pour
        cette raison qu’aucune projection n’est tracée sur cette série.
      </p>
    </section>
  )
}

export default TableauDistribution
