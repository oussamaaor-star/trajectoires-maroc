import { useEffect, useState } from 'react'

/* Sommaire sticky des pages secteur (sous la barre de navigation).
   Le chapitre « actif » est recalculé au défilement : c'est le DERNIER
   chapitre dont le haut est passé au-dessus du repère (~150 px, la hauteur
   des deux barres sticky). Technique volontairement simple : un écouteur
   de scroll + getBoundingClientRect, pas de bibliothèque. */
function MenuAncres({ chapitres }) {
  const [actif, setActif] = useState(chapitres[0].id)

  useEffect(() => {
    function surDefilement() {
      let courant = chapitres[0].id
      for (const chapitre of chapitres) {
        const element = document.getElementById(chapitre.id)
        if (element && element.getBoundingClientRect().top < 150) courant = chapitre.id
      }
      setActif(courant)
    }
    window.addEventListener('scroll', surDefilement, { passive: true })
    surDefilement() // position initiale (ex. arrivée directe sur une ancre)
    return () => window.removeEventListener('scroll', surDefilement)
  }, [chapitres])

  return (
    <nav className="menu-ancres" aria-label="Sommaire de la page">
      <div className="conteneur">
        <ul>
          {chapitres.map((chapitre, i) => (
            <li key={chapitre.id}>
              <a href={`#${chapitre.id}`} className={actif === chapitre.id ? 'actif' : undefined}>
                {String(i + 1).padStart(2, '0')} {chapitre.titre}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

export default MenuAncres
