import { formateNombre, uniteCourte, formateVariation, espaceUnite } from '../utils/formatage'

/* Carte KPI : un libellé, un gros chiffre + unité, et la variation par rapport
   à l'année précédente (verte si hausse, rouge si baisse).
   Composant purement visuel : il reçoit tout en props, ne calcule rien.
   uniteVariation : « % » pour une variation relative (KPI des secteurs),
   « pt » pour un écart en points de pourcentage (contexte national). */
function CarteKPI({ libelle, valeur, unite, annee, variation, uniteVariation = '%' }) {
  return (
    <article className="carte-kpi">
      <p className="carte-kpi__libelle">
        {libelle} · {annee}
      </p>
      {/* L'espace entre le nombre et l'unité est INSÉCABLE (voir formatage.js) :
          fine devant « % », espace-mot devant « Md DH ». Une espace ordinaire
          laissait « 82,9 » finir une ligne et « % » commencer la suivante. */}
      <p className="carte-kpi__valeur">
        {formateNombre(valeur)}
        {espaceUnite(uniteCourte(unite))}
        <small>{uniteCourte(unite)}</small>
      </p>
      {variation != null && (
        <p className="carte-kpi__variation">
          <span className={variation >= 0 ? 'hausse' : 'baisse'}>
            {variation >= 0 ? '↑' : '↓'} {formateVariation(variation)}
            {espaceUnite(uniteVariation)}
            {uniteVariation}
          </span>{' '}
          vs {annee - 1}
        </p>
      )}
    </article>
  )
}

export default CarteKPI
