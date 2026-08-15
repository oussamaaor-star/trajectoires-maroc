/* Mini-courbe décorative des cartes secteur : pas d'axes, pas de textes,
   juste la FORME de la trajectoire (les vrais chiffres sont sur la page
   du secteur). aria-hidden : les lecteurs d'écran l'ignorent. */

/* Dimensions du petit repère (le SVG s'étire ensuite à la largeur de la carte) */
const LARGEUR = 240
const HAUTEUR = 56
const MARGE = 5

function MiniSparkline({ points }) {
  const valeurs = points.map((p) => p.valeur)
  const min = Math.min(...valeurs)
  const plage = Math.max(...valeurs) - min || 1 // garde-fou : série plate

  /* i-ème point → position x ; valeur → position y (le haut du SVG est y=0) */
  const x = (i) => MARGE + (i / (points.length - 1)) * (LARGEUR - 2 * MARGE)
  const y = (v) => HAUTEUR - MARGE - ((v - min) / plage) * (HAUTEUR - 2 * MARGE)

  const chemin = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.valeur).toFixed(1)}`)
    .join(' ')
  const dernier = points[points.length - 1]

  return (
    <svg viewBox={`0 0 ${LARGEUR} ${HAUTEUR}`} aria-hidden="true">
      <path className="ligne-serie" d={chemin} />
      <circle
        className="point-donnee"
        cx={x(points.length - 1)}
        cy={y(dernier.valeur)}
        r="4"
      />
    </svg>
  )
}

export default MiniSparkline
