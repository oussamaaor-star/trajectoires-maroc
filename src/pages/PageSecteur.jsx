import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import NavHaut from '../composants/NavHaut'
import PiedPage from '../composants/PiedPage'
import MenuAncres from '../composants/MenuAncres'
import CarteKPI from '../composants/CarteKPI'
import GraphiqueSerie from '../composants/GraphiqueSerie'
import LectureAutomatique from '../composants/LectureAutomatique'
import {
  secteurParId,
  seriesDuSecteur,
  evenementsDuSecteur,
  periodeDesSeries,
  serieParId,
} from '../utils/donnees'
import { CHAPITRES, CONTENU_SECTEURS, idSeriePhare } from './contenuSecteurs'
import PageIntrouvable from './PageIntrouvable.jsx'

/* ============================================================================
   PageSecteur — le gabarit UNIQUE des trois pages secteur.
   L'URL /secteur/:id fournit l'id (automobile | ble | energie) ; on en déduit
   le secteur, ses séries, ses événements et son contenu éditorial.
   data-secteur posé sur la racine : tout le CSS bascule sur l'accent du
   secteur (nav, hero, cartes, graphiques) sans une ligne de style en plus.
   ============================================================================ */
function PageSecteur() {
  const { id } = useParams()
  const secteur = secteurParId(id)

  /* Titre de l'onglet — déclaré AVANT le garde-fou (règle des hooks : un hook
     ne doit jamais être appelé conditionnellement). */
  useEffect(() => {
    if (secteur) document.title = `${secteur.nom} — Trajectoires Maroc`
    if (secteur) {
      document.querySelector("meta[name='description']")
        .setAttribute('content', `${secteur.nom} au Maroc : séries publiques, événements datés et sources déclarées.`)
    }
  }, [secteur])

  /* id inconnu dans l'URL (/secteur/nimportequoi) : la ROUTE existe, c'est le
     paramètre qui est faux. On affiche la même page d'erreur qu'une adresse
     inconnue plutôt que de renvoyer à l'accueil en silence. */
  if (!secteur) return <PageIntrouvable />

  const contenu = CONTENU_SECTEURS[id]
  const seriesSecteur = seriesDuSecteur(id)
  const evenements = evenementsDuSecteur(id)
  const seriePhare = serieParId(idSeriePhare(id))
  const [chapVue, chapTrajectoire] = CHAPITRES

  return (
    <div data-secteur={id}>
      <NavHaut />

      <header className="hero">
        <div className="conteneur">
          <p className="hero__surtitre">Secteur</p>
          <h1>{secteur.nom}</h1>
          <p className="hero__description">{secteur.resume}</p>
          {/* CE QUE COUVRE LA PLAGE, ET DE QUOI. « Données 1990–2025 » se lisait
              deux écrans au-dessus d'un graphique sous-titré « observé 1998–2025 » :
              le lecteur y voyait une contradiction. Il n'y en avait pas — la plage
              est celle de TOUTES les séries du secteur, dont la plus ancienne
              (part de l'industrie dans le PIB) remonte à 1990. Le badge le dit
              maintenant lui-même, en annonçant leur nombre. */}
          <span className="badge">
            {seriesSecteur.length} séries · {periodeDesSeries(seriesSecteur)}
          </span>
        </div>
      </header>

      <MenuAncres chapitres={CHAPITRES} />

      <main className="conteneur" id="contenu" tabIndex={-1}>
        {/* 01 — les KPI du secteur */}
        <section className="section-chapitre" id={chapVue.id}>
          <h2>
            <span className="section-chapitre__numero">01</span> {chapVue.titre}
          </h2>
          <p className="section-chapitre__intro">{contenu.introVue}</p>
          <div className="grille-kpi">
            {secteur.kpis.map((kpi) => (
              <CarteKPI
                key={kpi.label}
                libelle={kpi.label}
                valeur={kpi.valeur}
                unite={kpi.unite}
                annee={kpi.annee}
                variation={kpi.variation}
                /* « pt » pour les séries déjà en pourcentage, « % » pour les
                   autres : une part qui passe de 17 % à 11,8 % perd 5,2 POINTS,
                   pas 30,6 %. Le champ est calculé avec la valeur, dans
                   secteurs.json — les deux ne peuvent pas se contredire. */
                uniteVariation={kpi.uniteVariation ?? '%'}
              />
            ))}
          </div>
        </section>

        {/* 02 — le graphique principal, sa liste d'événements et sa lecture auto */}
        <section className="section-chapitre" id={chapTrajectoire.id}>
          <h2>
            <span className="section-chapitre__numero">02</span> {chapTrajectoire.titre}
          </h2>
          <p className="section-chapitre__intro">{contenu.introTrajectoire}</p>
          <GraphiqueSerie config={contenu.trajectoire} evenements={evenements} />
          <LectureAutomatique serie={seriePhare} />
        </section>
      </main>

      <PiedPage />
    </div>
  )
}

export default PageSecteur
