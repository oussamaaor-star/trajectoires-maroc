import { NavLink } from 'react-router-dom'

/* Classe du lien actif : NavLink nous dit si le lien correspond à l'URL
   courante, le CSS (.actif) le colore alors avec l'accent du secteur. */
function classeLien({ isActive }) {
  return isActive ? 'actif' : undefined
}

/* Barre de navigation sticky, identique sur toutes les pages.
   La couleur du lien actif suit automatiquement le data-secteur de la page. */
function NavHaut() {
  return (
    <header className="nav-haut">
      <div className="conteneur">
        <NavLink to="/" className="nav-haut__marque">
          Trajectoires <span>Maroc</span>
        </NavLink>
        <nav aria-label="Navigation principale">
          <ul className="nav-haut__liens">
            <li><NavLink to="/" end className={classeLien}>Accueil</NavLink></li>
            <li><NavLink to="/secteur/automobile" className={classeLien}>Automobile</NavLink></li>
            <li><NavLink to="/secteur/ble" className={classeLien}>Blé</NavLink></li>
            <li><NavLink to="/secteur/energie" className={classeLien}>Énergie</NavLink></li>
            <li><NavLink to="/territoires" className={classeLien}>Territoires</NavLink></li>
            <li><NavLink to="/sources" className={classeLien}>Sources</NavLink></li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default NavHaut
