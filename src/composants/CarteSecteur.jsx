import { Link } from 'react-router-dom'
import MiniSparkline from './MiniSparkline'
import { formateNombre, uniteCourte, espaceUnite } from '../utils/formatage'

/* Carte cliquable d'un secteur (accueil + « Continuer l'exploration »).
   L'attribut data-secteur posé sur la carte suffit à la colorer : le CSS
   bascule --accent et tout suit (liseré, chiffre, lien, sparkline).
   Le « chiffre phare » est par convention le PREMIER KPI du secteur. */
function CarteSecteur({ secteur, serieSparkline }) {
  const kpi = secteur.kpis[0]

  return (
    <Link to={`/secteur/${secteur.id}`} className="carte-secteur" data-secteur={secteur.id}>
      <h3>{secteur.nom}</h3>
      {/* Le résumé COURT, écrit pour la carte. Le champ `resume`, lui, fait
          trois à quatre cents caractères et sert au hero de la page secteur.
          La carte l'affichait aussi, rogné à trois lignes par le CSS : douze
          lignes de texte étaient donc coupées en pleine phrase (mesuré : 259 px
          de contenu ramenés à 71 px), et la coupure se lisait comme un bug.
          Une phrase écrite pour tenir vaut mieux qu'un paragraphe tronqué. */}
      <p className="carte-secteur__resume">{secteur.resumeCourt}</p>
      {serieSparkline && <MiniSparkline points={serieSparkline.points} />}
      <div className="carte-secteur__chiffre">
        {formateNombre(kpi.valeur)}
        {espaceUnite(uniteCourte(kpi.unite))}
        {uniteCourte(kpi.unite)}
        <small>
          {kpi.label} ({kpi.annee})
        </small>
      </div>
      <span className="carte-secteur__lien">Voir la trajectoire →</span>
    </Link>
  )
}

export default CarteSecteur
