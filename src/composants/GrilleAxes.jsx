import { VUE, anneesAxe } from '../utils/graphique'
import { formateNombre } from '../utils/formatage'

/* Grille horizontale + axes, partagés par la courbe et les barres.
   Règles du designer : 4-5 lignes pleines très claires, valeurs rondes,
   une seule ligne de base pour l'axe X, jamais de cadre autour du graphique.
   Reçoit les fonctions de conversion xPour / yPour du graphique parent :
   c'est lui qui sait transformer (année, valeur) en coordonnées SVG. */
function GrilleAxes({ echelle, xPour, yPour, annees }) {
  return (
    <g>
      {/* lignes horizontales (sauf celle du bas : c'est la ligne de l'axe X) */}
      <g className="grille-y">
        {echelle.graduations
          .filter((graduation) => graduation !== echelle.min)
          .map((graduation) => (
            <line key={graduation} x1={VUE.x0} x2={VUE.x1} y1={yPour(graduation)} y2={yPour(graduation)} />
          ))}
      </g>

      {/* valeurs de la grille, alignées à droite dans la marge gauche */}
      {echelle.graduations.map((graduation) => (
        <text
          key={graduation}
          className="etiquette-axe"
          x={VUE.x0 - 8}
          y={yPour(graduation) + 4}
          textAnchor="end"
        >
          {formateNombre(graduation)}
        </text>
      ))}

      {/* ligne de base de l'axe X, puis les années (multiples de 5) */}
      <g className="axe">
        <line x1={VUE.x0} x2={VUE.x1} y1={VUE.y1} y2={VUE.y1} />
      </g>
      {/* Les années HORS GRILLE (hors multiples de 5 : la dernière,
          ajoutée par anneesAxe quand elle s’éloigne assez) portent une
          classe à part. Elles sont masquées sous 720 px, où l’axe passe de
          12 à 22 px : « 2025 » et « 2028 » s’y chevauchaient et se lisaient
          « 20252028 ». Le choix se fait en CSS parce que le problème est
          une affaire de TAILLE DE TEXTE, pas de données. */}
      {anneesAxe(annees).map((annee) => (
        <text
          key={annee}
          className={`etiquette-axe${annee % 5 === 0 ? '' : ' etiquette-axe--hors-grille'}`}
          x={xPour(annee)}
          y={VUE.y1 + 22}
          textAnchor="middle"
        >
          {annee}
        </text>
      ))}
    </g>
  )
}

export default GrilleAxes
