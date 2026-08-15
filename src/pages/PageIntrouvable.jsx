import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import NavHaut from '../composants/NavHaut'
import PiedPage from '../composants/PiedPage'

/* ============================================================================
   PageIntrouvable — l'adresse demandée n'existe pas, et on le dit.
   ----------------------------------------------------------------------------
   POURQUOI CETTE PAGE EXISTE
   Jusqu'ici, toute adresse inconnue renvoyait SILENCIEUSEMENT vers l'accueil
   (`<Navigate to="/" replace />`). Le visiteur qui se trompait d'une lettre
   voyait la page d'accueil sans comprendre pourquoi, et pouvait croire que le
   lien qu'on lui avait donné était faux. Le rapport de stage cite des adresses
   précises : une faute de frappe ne doit pas laisser penser que la plateforme
   a perdu la page.

   Le principe est le même que pour les données : on ne comble pas un trou en
   silence. Une adresse qui n'existe pas est un trou ; on l'annonce, et on
   propose la sortie.
   ============================================================================ */
function PageIntrouvable() {
  useEffect(() => {
    document.title = 'Page introuvable — Trajectoires Maroc'
  }, [])

  return (
    <div>
      <NavHaut />

      <header className="hero">
        <div className="conteneur">
          <p className="hero__surtitre">Erreur</p>
          <h1>Cette page n’existe pas</h1>
          <p className="hero__description">
            L’adresse demandée ne correspond à aucune page de la plateforme.
            Elle a peut-être été mal recopiée.
          </p>
        </div>
      </header>

      <main className="conteneur">
        <section className="section-chapitre">
          <h2>Où aller</h2>
          <p className="section-chapitre__intro">
            La plateforme compte six pages. Les voici toutes :
          </p>
          <ul className="liste-secours">
            <li>
              <Link to="/">Accueil</Link> — les trois secteurs suivis
            </li>
            <li>
              <Link to="/secteur/automobile">Industrie automobile &amp; aéronautique</Link>
            </li>
            <li>
              <Link to="/secteur/ble">Agriculture — blé &amp; céréales</Link>
            </li>
            <li>
              <Link to="/secteur/energie">Énergie — pétrole &amp; gaz</Link>
            </li>
            <li>
              <Link to="/territoires">Territoires</Link> — les douze régions
            </li>
            <li>
              <Link to="/sources">Sources</Link> — d’où viennent les chiffres
            </li>
          </ul>
        </section>
      </main>

      <PiedPage />
    </div>
  )
}

export default PageIntrouvable
