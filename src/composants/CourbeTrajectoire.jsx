import { useRef, useState } from 'react'
import { VUE, calculeEchelle } from '../utils/graphique'
import { formate } from '../utils/formatage'
import { valeurPour, dernierPoint } from '../utils/donnees'
import GrilleAxes from './GrilleAxes'
import Infobulle from './Infobulle'

/* ============================================================================
   CourbeTrajectoire — graphique en courbes « fait main » en SVG.
   Principe : un repère fixe de 720 × 400 (viewBox) ; deux fonctions
   xPour / yPour convertissent (année, valeur) → (x, y) ; la courbe est un
   <path> qui relie les points (« M x,y L x,y … »).
   Survol : un seul écouteur de souris sur la figure ; on retrouve l'année la
   plus proche du curseur, on dessine une ligne verticale + un point, et une
   infobulle HTML suit la souris.
   projection : 0 à 2 points futurs, tracés en pointillés pour prolonger la
   courbe (voir utils/analyse.js). Tableau vide = rien de plus qu'avant.
   ============================================================================ */
function CourbeTrajectoire({ serie, etiquette, projection = [] }) {
  const figure = useRef(null) // la <div> qui contient le SVG (pour mesurer)
  const [survol, setSurvol] = useState(null) // { annee, xSouris, ySouris, largeur }

  /* Échelles : les années ET valeurs projetées entrent dans le calcul, sinon
     le prolongement pointillé sortirait du cadre. */
  /* Les bornes entrent dans l’échelle au même titre que les valeurs :
     sans elles, le haut de la bande de confiance sortirait du cadre.
     Une projection sans bornes a `basse` = `haute` = `valeur`, donc
     cette ligne ne change rien pour elle. */
  const valeurs = [
    ...serie.points.map((p) => p.valeur),
    ...projection.flatMap((p) => [p.valeur, p.basse ?? p.valeur, p.haute ?? p.valeur]),
  ]
  const annees = [...serie.points.map((p) => p.annee), ...projection.map((p) => p.annee)]
  const anneeMin = Math.min(...annees)
  const anneeMax = Math.max(...annees)
  const echelle = calculeEchelle(valeurs)

  const xPour = (annee) => VUE.x0 + ((annee - anneeMin) / (anneeMax - anneeMin || 1)) * (VUE.x1 - VUE.x0)
  const yPour = (valeur) => VUE.y1 - ((valeur - echelle.min) / (echelle.max - echelle.min)) * (VUE.y1 - VUE.y0)

  /* Le « d » d'un <path> : M(ove) vers le premier point, puis L(igne) à chaque suivant */
  const chemin = (points) =>
    points.map((p, i) => `${i === 0 ? 'M' : 'L'}${xPour(p.annee).toFixed(1)},${yPour(p.valeur).toFixed(1)}`).join(' ')

  const dernier = dernierPoint(serie)
  /* Le trait pointillé relie le dernier point réel aux points projetés. */
  const cheminProjection = projection.length > 0 ? chemin([dernier, ...projection]) : ''

  /* LA BANDE DE CONFIANCE, quand le modèle en fournit une.
     Un polygone fermé : on monte par les bornes HAUTES, on redescend par
     les bornes BASSES. Il part du dernier point réel, où l’incertitude
     est nulle par définition — la bande s’ouvre donc en biseau depuis
     la courbe observée, au lieu de commencer par une marche.
     Une prévision sans bornes donne un polygone d’épaisseur nulle :
     invisible, et c’est exactement ce qu’on veut — on n’invente pas une
     incertitude qui n’a pas été livrée. */
  const aDesBornes = projection.some((p) => p.basse != null && p.haute !== p.basse)
  const cheminBande = aDesBornes
    ? [
        `M${xPour(dernier.annee).toFixed(1)},${yPour(dernier.valeur).toFixed(1)}`,
        ...projection.map((p) => `L${xPour(p.annee).toFixed(1)},${yPour(p.haute).toFixed(1)}`),
        ...[...projection].reverse().map((p) => `L${xPour(p.annee).toFixed(1)},${yPour(p.basse).toFixed(1)}`),
        'Z',
      ].join(' ')
    : ''

  /* Années que le curseur peut « accrocher » : les réelles + les projetées. */
  const anneesSurvolables = [...serie.points.map((p) => p.annee), ...projection.map((p) => p.annee)]
  const valeurSurvol = survol
    ? valeurPour(serie, survol.annee) ?? projection.find((p) => p.annee === survol.annee)?.valeur ?? null
    : null

  /* --- Survol ------------------------------------------------------------- */
  function gereSouris(evt) {
    const cadre = figure.current.getBoundingClientRect()
    /* position de la souris convertie dans le repère du viewBox (largeur 720) */
    const xVue = ((evt.clientX - cadre.left) / cadre.width) * VUE.largeur
    /* on retient l'année dont le x est le plus proche du curseur */
    const plusProche = anneesSurvolables.reduce((meilleure, annee) =>
      Math.abs(xPour(annee) - xVue) < Math.abs(xPour(meilleure) - xVue) ? annee : meilleure,
    )
    setSurvol({
      annee: plusProche,
      xSouris: evt.clientX - cadre.left,
      ySouris: evt.clientY - cadre.top,
      largeur: cadre.width,
      /* Le bord bas VISIBLE de la fenêtre, dans le repère de la figure :
         sans lui, l’infobulle passait sous la ligne de flottaison dès que
         le graphique arrivait en bas de l’écran. Voir Infobulle.jsx. */
      hauteur: window.innerHeight - cadre.top,
    })
  }

  /* Contenu de l'infobulle : valeur observée, ou valeur projetée annoncée
     comme telle (une valeur calculée ne doit pas se lire comme une observation). */
  function lignesInfobulle(annee) {
    const valeur = valeurPour(serie, annee)
    if (valeur != null) return [formate(valeur, serie.unite)]
    const prevu = projection.find((p) => p.annee === annee)
    return prevu ? [`Projection : ${formate(prevu.valeur, serie.unite)}`] : []
  }

  return (
    <div className="figure-graphique" ref={figure} onMouseMove={gereSouris} onMouseLeave={() => setSurvol(null)}>
      <svg viewBox={`0 0 ${VUE.largeur} ${VUE.hauteur}`} role="img" aria-label={`Graphique : ${serie.nom}`}>
        <GrilleAxes echelle={echelle} xPour={xPour} yPour={yPour} annees={anneesSurvolables} />

        {/* nappe très légère sous la courbe — seulement si l'échelle part de zéro
            (sinon l'aire suggérerait une quantité qui n'existe pas) */}
        {echelle.min === 0 && (
          <path
            className="aire-serie"
            d={`${chemin(serie.points)} L${xPour(dernier.annee).toFixed(1)},${VUE.y1} L${xPour(serie.points[0].annee).toFixed(1)},${VUE.y1} Z`}
          />
        )}
        <path className="ligne-serie" d={chemin(serie.points)} />

        {/* la bande de confiance passe SOUS le trait : dessinée avant lui */}
        {cheminBande && <path className="bande-prevision" d={cheminBande} />}

        {/* prolongement projeté : même couleur, en pointillés, points creux */}
        {projection.length > 0 && (
          <>
            <path className="ligne-serie ligne-serie--projection" d={cheminProjection} />
            {projection.map((p) => (
              <circle key={p.annee} className="point-donnee point-prevision" cx={xPour(p.annee)} cy={yPour(p.valeur)} r="4" />
            ))}
          </>
        )}

        {/* survol : ligne verticale + point agrandi */}
        {survol && (
          <g>
            <g className="axe"><line x1={xPour(survol.annee)} x2={xPour(survol.annee)} y1={VUE.y0} y2={VUE.y1} /></g>
            {valeurSurvol != null && (
              <circle className="point-donnee actif" cx={xPour(survol.annee)} cy={yPour(valeurSurvol)} r="5.5" />
            )}
          </g>
        )}

        {/* Bout de ligne : le point, son nom et sa valeur.
            L'étiquette est ancrée sur le DERNIER POINT RÉEL, pas sur le bord
            droit du cadre. Depuis que l'axe s'étend jusqu'aux années projetées,
            une étiquette collée au bord se retrouvait à hauteur du dernier
            point prévu tout en affichant la valeur observée : elle semblait
            étiqueter la prévision. Sans projection, le dernier point réel EST
            au bord — l'affichage ne change donc pas. */}
        <circle className="point-donnee" cx={xPour(dernier.annee)} cy={yPour(dernier.valeur)} r="4" />
        {etiquette && (
          <text className="etiquette-serie" x={xPour(dernier.annee) + 10} y={yPour(dernier.valeur) - 3}>
            {etiquette}
          </text>
        )}
        <text
          className="etiquette-valeur"
          x={xPour(dernier.annee) + 10}
          y={yPour(dernier.valeur) + (etiquette ? 12 : 4)}
        >
          {formate(dernier.valeur, serie.unite)}
        </text>
      </svg>

      {survol && <Infobulle survol={survol} lignes={lignesInfobulle(survol.annee)} />}
    </div>
  )
}

export default CourbeTrajectoire
