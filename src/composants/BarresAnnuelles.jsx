import { useRef, useState } from 'react'
import { VUE, calculeEchelle } from '../utils/graphique'
import { formate, formateNombre } from '../utils/formatage'
import { valeurPour, dernierPoint } from '../utils/donnees'
import GrilleAxes from './GrilleAxes'
import Infobulle from './Infobulle'

/* ============================================================================
   BarresAnnuelles — histogramme SVG « fait main », même repère que la courbe.
   Utilisé quand la grandeur est une magnitude annuelle très volatile
   (production céréalière) : chaque année se lit alors comme une quantité,
   pas comme une tendance. Règle d'or : les barres partent TOUJOURS de zéro.
   projection : 0 à 2 années futures, dessinées en barres creuses pointillées.
   ============================================================================ */
function BarresAnnuelles({ serie, projection = [] }) {
  const figure = useRef(null)
  const [survol, setSurvol] = useState(null) // { annee, xSouris, ySouris, largeur }

  const points = serie.points // années consécutives (1990, 1991, …)
  const anneeMin = points[0].annee

  /* Les années projetées occupent leurs propres bandes, à la suite des réelles. */
  const anneesAffichees = [...points.map((p) => p.annee), ...projection.map((p) => p.annee)]
  const echelle = calculeEchelle(
    [...points.map((p) => p.valeur), ...projection.map((p) => p.valeur)],
    true, // depuis zéro
  )

  const pas = (VUE.x1 - VUE.x0) / anneesAffichees.length // largeur d'une bande
  const largeurBarre = Math.min(24, pas - 3) // ≤ 24px, écart ≥ 3px
  const xPour = (annee) => VUE.x0 + (annee - anneeMin) * pas + pas / 2
  const yPour = (valeur) => VUE.y1 - ((valeur - echelle.min) / (echelle.max - echelle.min)) * (VUE.y1 - VUE.y0)

  /* Survol : on retrouve la bande sous le curseur par un simple calcul d'indice */
  function gereSouris(evt) {
    const cadre = figure.current.getBoundingClientRect()
    const xVue = ((evt.clientX - cadre.left) / cadre.width) * VUE.largeur
    const indice = Math.round((xVue - VUE.x0 - pas / 2) / pas)
    const annee = anneesAffichees[Math.max(0, Math.min(anneesAffichees.length - 1, indice))]
    setSurvol({
      annee,
      xSouris: evt.clientX - cadre.left,
      ySouris: evt.clientY - cadre.top,
      largeur: cadre.width,
      /* Le bord bas VISIBLE de la fenêtre, dans le repère de la figure :
         sans lui, l’infobulle passait sous la ligne de flottaison dès que
         le graphique arrivait en bas de l’écran. Voir Infobulle.jsx. */
      hauteur: window.innerHeight - cadre.top,
    })
  }

  /* Infobulle : valeur observée, ou valeur projetée annoncée comme telle. */
  function lignesInfobulle(annee) {
    const valeur = valeurPour(serie, annee)
    if (valeur != null) return [formate(valeur, serie.unite)]
    const prevu = projection.find((p) => p.annee === annee)
    return prevu ? [`Projection : ${formate(prevu.valeur, serie.unite)}`] : []
  }

  /* Valeurs mises en avant : le pic et la dernière année — jamais toutes. */
  const pic = points.reduce((max, p) => (p.valeur > max.valeur ? p : max))
  const dernier = dernierPoint(serie)

  return (
    <div className="figure-graphique" ref={figure} onMouseMove={gereSouris} onMouseLeave={() => setSurvol(null)}>
      <svg viewBox={`0 0 ${VUE.largeur} ${VUE.hauteur}`} role="img" aria-label={`Graphique : ${serie.nom}`}>
        <GrilleAxes echelle={echelle} xPour={xPour} yPour={yPour} annees={anneesAffichees} />

        {points.map((p) => (
          <rect
            key={p.annee}
            className="barre-serie"
            x={xPour(p.annee) - largeurBarre / 2}
            y={yPour(p.valeur)}
            width={largeurBarre}
            height={VUE.y1 - yPour(p.valeur)}
            /* la barre survolée fonce (l'infobulle et la vue Données donnent la valeur) */
            style={survol && survol.annee === p.annee ? { fill: 'var(--accent-sombre)' } : undefined}
          />
        ))}

        {/* barres projetées : creuses, cerclées de pointillés, partant de zéro */}
        {projection.map((p) => (
          <rect
            key={p.annee}
            className="barre-serie barre-serie--prevision"
            x={xPour(p.annee) - largeurBarre / 2}
            y={yPour(p.valeur)}
            width={largeurBarre}
            height={VUE.y1 - yPour(p.valeur)}
          />
        ))}

        {/* étiquette du pic (centrée au-dessus) et de la dernière barre (à droite) */}
        <text className="etiquette-valeur" x={xPour(pic.annee)} y={yPour(pic.valeur) - 8} textAnchor="middle">
          {formateNombre(pic.valeur)}
        </text>
        {dernier.annee !== pic.annee && (
          <text
            className="etiquette-valeur"
            x={xPour(dernier.annee) + largeurBarre / 2 + 5}
            y={yPour(dernier.valeur) - 2}
          >
            {formateNombre(dernier.valeur)}
          </text>
        )}
      </svg>

      {survol && <Infobulle survol={survol} lignes={lignesInfobulle(survol.annee)} />}
    </div>
  )
}

export default BarresAnnuelles
