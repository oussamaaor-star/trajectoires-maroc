import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import PageAccueil from './pages/PageAccueil.jsx'
import PageSecteur from './pages/PageSecteur.jsx'
import PageTerritoires from './pages/PageTerritoires.jsx'
import PageSources from './pages/PageSources.jsx'
import PageIntrouvable from './pages/PageIntrouvable.jsx'

/* Petit composant technique : à chaque changement de page, on remonte en haut
   (sinon le navigateur garde la position de défilement de la page précédente). */
function RemonteEnHaut() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

/* La table de routage de l'application : 5 pages.
   Les 3 secteurs partagent le MÊME gabarit PageSecteur — c'est le paramètre
   d'URL « :id » (automobile | ble | energie) qui choisit le contenu.

   Toute adresse inconnue mène à PageIntrouvable, qui le DIT. Elle renvoyait
   auparavant vers l'accueil sans un mot : le visiteur qui se trompait d'une
   lettre voyait la page d'accueil sans comprendre, et pouvait croire que le
   lien qu'on lui avait donné était faux. On ne comble pas un trou en silence,
   pas plus une adresse qu'une donnée. */
function App() {
  return (
    <>
      <RemonteEnHaut />
      <Routes>
        <Route path="/" element={<PageAccueil />} />
        <Route path="/secteur/:id" element={<PageSecteur />} />
        <Route path="/territoires" element={<PageTerritoires />} />
        <Route path="/sources" element={<PageSources />} />
        <Route path="*" element={<PageIntrouvable />} />
      </Routes>
    </>
  )
}

export default App
