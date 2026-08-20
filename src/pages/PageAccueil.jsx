import { useEffect } from 'react'
import NavHaut from '../composants/NavHaut'
import PiedPage from '../composants/PiedPage'
import CarteSecteur from '../composants/CarteSecteur'
import CarteKPI from '../composants/CarteKPI'
import { tousLesSecteurs, serieParId, dernierPoint, evenementsDuSecteur } from '../utils/donnees'
import { idSeriePhare } from './contenuSecteurs'

/* Les 3 indicateurs de cadrage national (séries « contexte » de series.json). */
const IDS_CONTEXTE = ['croissance_pib', 'inflation', 'chomage']

/* Les événements datés du secteur « contexte ».
   Ils n'étaient affichés NULLE PART : les événements se lisent sous le
   graphique d'une page secteur, et « contexte » n'a pas de page — c'est un
   cadrage national, pas un secteur suivi. Un événement sur quinze restait
   donc dans le fichier sans jamais atteindre l'écran. Sa place est ici,
   sous les trois repères qu'il éclaire, et non ailleurs. */
const EVENEMENTS_CONTEXTE = evenementsDuSecteur('contexte')

/* Page d'accueil : un titre, les 3 cartes secteur cliquables (chacune avec son
   chiffre phare et sa mini-courbe), puis 3 KPI de contexte macroéconomique. */
function PageAccueil() {
  useEffect(() => {
    document.title = 'Trajectoires économiques du Maroc'
    document.querySelector("meta[name='description']")
      .setAttribute('content', "Trois filières marocaines suivies dans la durée — automobile, blé, énergie — à partir de séries publiques, avec leurs sources et leurs trous.")
  }, [])

  return (
    <div>
      <NavHaut />

      <header className="hero">
        <div className="conteneur">
          <p className="hero__surtitre">DIGIUP · plateforme de démonstration</p>
          <h1>Trajectoires économiques du Maroc</h1>
          <p className="hero__description">
            Trois secteurs, trois décennies de données publiques : l’essor de
            l’automobile, la vulnérabilité du blé et la dépendance énergétique,
            racontés par des séries chiffrées et leurs sources.
          </p>
        </div>
      </header>

      <main className="conteneur" id="contenu" tabIndex={-1}>
        <section className="section-chapitre">
          <h2>Trois secteurs, trois trajectoires</h2>
          <div className="grille-cartes">
            {tousLesSecteurs.map((secteur) => (
              <CarteSecteur
                key={secteur.id}
                secteur={secteur}
                serieSparkline={serieParId(idSeriePhare(secteur.id))}
              />
            ))}
          </div>
        </section>

        <section className="section-chapitre">
          <h2>Contexte national</h2>
          <p className="section-chapitre__intro">
            Trois repères macroéconomiques pour situer les trajectoires
            sectorielles (dernière année disponible, écart en points par
            rapport à l’année précédente).
          </p>
          <div className="grille-kpi">
            {IDS_CONTEXTE.map((idSerie) => {
              const serie = serieParId(idSerie)
              const dernier = dernierPoint(serie)
              const precedent = serie.points[serie.points.length - 2]
              /* écart en POINTS de pourcentage (4,2 % − 3,4 % = +0,8 pt) */
              const ecart = Number((dernier.valeur - precedent.valeur).toFixed(1))
              return (
                <CarteKPI
                  key={idSerie}
                  libelle={serie.nom}
                  valeur={dernier.valeur}
                  unite={serie.unite}
                  annee={dernier.annee}
                  variation={ecart}
                  uniteVariation="pt"
                />
              )
            })}
          </div>

          {EVENEMENTS_CONTEXTE.length > 0 && (
            <>
              <p className="legende-evenements__mention">
                Repère daté de la même période :
              </p>
              <ul className="legende-evenements legende-evenements--hors-periode">
                {EVENEMENTS_CONTEXTE.map((evenement) => (
                  <li key={`${evenement.annee}-${evenement.libelle}`}>
                    <strong>{evenement.annee}</strong> {evenement.libelle}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </main>

      <PiedPage />
    </div>
  )
}

export default PageAccueil
