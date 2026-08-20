import ConteneurGraphique from './ConteneurGraphique'
import CourbeTrajectoire from './CourbeTrajectoire'
import BarresAnnuelles from './BarresAnnuelles'
import ListeEvenements from './ListeEvenements'
import { serieParId } from '../utils/donnees'
import { projetteDeuxAns } from '../utils/analyse'
import { previsionPourSerie, estDemonstration } from '../utils/prevision'

/* Traduit une entrée de configuration éditoriale (contenuSecteurs.js) en
   graphique complet : le conteneur (titre, bascule Graphique/Tableau, CSV,
   source) + la courbe ou les barres, la liste des événements sous le
   graphique, et — si config.projection — une projection simple sur 2 ans. */
function GraphiqueSerie({ config, evenements = [] }) {
  const serie = serieParId(config.serieId)

  /* DEUX SOURCES POSSIBLES POUR LA PARTIE PROJETÉE, DANS CET ORDRE.
     1. La prévision LIVRÉE par l'équipe data (src/data/predictions.json) :
        valeur, borne basse, borne haute et nom du modèle. C'est elle qui
        prime dès qu'elle existe pour cette série.
     2. À défaut, la projection maison de utils/analyse.js : le prolongement
        de la tendance des trois dernières années. Elle n'a pas d'intervalle
        et le graphique le dit.
     Le format d'échange a été arrêté AVANT la livraison, précisément pour
     que ni l'affichage ni le modèle n'attende l'autre : le jour où le
     fichier arrive, aucune ligne de ce composant ne change. */
  const prevision = previsionPourSerie(serie)
  const projection = prevision
    ? prevision.points
    : config.projection
      ? projetteDeuxAns(serie.points)
      : []

  return (
    <ConteneurGraphique
      titre={config.titre}
      sousTitre={config.sousTitre}
      series={[serie]}
      idFichier={config.serieId}
    >
      {config.type === 'barres' ? (
        <BarresAnnuelles serie={serie} projection={projection} />
      ) : (
        <CourbeTrajectoire serie={serie} etiquette={config.etiquette} projection={projection} />
      )}

      {/* Les événements du secteur, en texte simple, sous le graphique. */}
      <ListeEvenements evenements={evenements} serie={serie} />

      {/* CE QUE LA PARTIE POINTILLÉE EST VRAIMENT — dit sous chaque graphique.
          Une courbe qui se prolonge sans rien préciser laisse croire à une
          prévision validée. Trois cas, trois phrases différentes. */}
      {prevision && estDemonstration(prevision) && (
        <p className="mention-prevision mention-prevision--demonstration">
          <strong>Prévisions de démonstration</strong> — en attente du modèle de l’équipe data.
          Les valeurs prévues ci-dessus ne sortent d’aucun modèle statistique : elles servent
          uniquement à montrer comment la plateforme les affichera, bande comprise.
        </p>
      )}
      {prevision && !estDemonstration(prevision) && (
        <p className="mention-prevision">
          Prévision livrée par l’équipe data — modèle : {prevision.modele}. La zone colorée est
          l’intervalle entre la borne basse et la borne haute.
        </p>
      )}
      {!prevision && projection.length > 0 && (
        <p className="mention-prevision">
          Projection simple (prolongement de la tendance des 3 dernières années sur 2 ans, en pointillés).
          Sans modèle statistique, donc sans intervalle de confiance.
        </p>
      )}
    </ConteneurGraphique>
  )
}

export default GraphiqueSerie
