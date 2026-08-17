import { NavLink } from 'react-router-dom'

/* Classe du lien actif : NavLink nous dit si le lien correspond à l'URL
   courante, le CSS (.actif) le colore alors avec l'accent du secteur. */
function classeLien({ isActive }) {
  return isActive ? 'actif' : undefined
}

/* LE SAUT VERS LE CONTENU, FAIT À LA MAIN — et pas laissé au navigateur.

   Un lien `href="#contenu"` vers une cible qui porte `tabindex="-1"` DEVRAIT
   suffire : la spécification demande au navigateur de défiler ET de poser le
   focus sur la cible. Mesuré en production (WebKit), il défile mais laisse le
   focus sur `<body>` : la tabulation suivante repart alors du haut de la page,
   c'est-à-dire que le lien n'a servi à rien pour celui qui en avait besoin.

   On ne discute pas avec le navigateur : trois lignes déplacent le focus
   explicitement, et le résultat ne dépend plus du moteur. `preventDefault`
   évite au passage d'écrire « #contenu » dans la barre d'adresse. */
function vaAuContenu(evenement) {
  const cible = document.getElementById('contenu')
  if (!cible) return // la page n'a pas encore monté son <main> : on laisse faire le lien
  evenement.preventDefault()
  cible.focus()
  cible.scrollIntoView({ block: 'start' })
}

/* Barre de navigation sticky, identique sur toutes les pages.
   La couleur du lien actif suit automatiquement le data-secteur de la page. */
function NavHaut() {
  return (
    <header className="nav-haut">
      {/* LE LIEN D'ÉVITEMENT — premier élément focusable du document.
          Sans lui, quelqu'un qui navigue au clavier retraverse les six liens
          de la barre sur CHAQUE page avant d'atteindre le contenu.

          Trois conditions, et il faut les trois — la version de l'autre
          plateforme les rate toutes les trois et le lien y est inutilisable :
          1. il est le premier dans l'ordre du DOM, donc la première
             tabulation le donne (aucun tabindex ailleurs pour le doubler) ;
          2. la règle :focus le REMET à l'écran (voir design.css) : un lien
             qu'on ne voit pas quand on l'atteint ne sert à personne ;
          3. sa cible <main id="contenu"> porte tabIndex={-1}, sinon le
             navigateur défile mais ne DÉPLACE PAS le focus, et la tabulation
             suivante repart du haut de la page. */}
      <a className="saut-contenu" href="#contenu" onClick={vaAuContenu}>
        Aller au contenu
      </a>

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
