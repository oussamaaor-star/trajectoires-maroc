/* Infobulle des graphiques : une petite div HTML posée AU-DESSUS du SVG
   (position absolue dans .figure-graphique). Elle suit la souris et affiche
   l'année et la ou les valeurs formatées.
   Elle n'est jamais le seul accès aux chiffres : la vue « Données » les liste.

   survol : { annee, xSouris, ySouris, largeur } — position de la souris en
   pixels dans la figure, et largeur de la figure pour gérer le bord droit. */
/* Hauteur prudente d'une bulle (année + deux lignes) : sert UNIQUEMENT à
   décider du rabat vers le haut, jamais à dimensionner quoi que ce soit. */
const HAUTEUR_ESTIMEE = 96

function Infobulle({ survol, lignes }) {
  /* Près du bord droit, l'infobulle passe à gauche du curseur pour ne pas
     sortir de l'écran. */
  const versLaGauche = survol.xSouris > survol.largeur * 0.6

  /* Et près du bord BAS, elle passe au-dessus. Un lecteur qui découvre la
     page en descendant s'arrête souvent quand la figure atteint le bas de
     l'écran : la bulle passait alors sous la ligne de flottaison, et le
     chiffre survolé devenait illisible.
     `hauteur` est le bord bas VISIBLE de la fenêtre, exprimé dans le repère
     de la figure. Le paramètre reste facultatif : une figure qui ne le passe
     pas garde exactement l'ancien comportement. */
  const versLeHaut = survol.hauteur != null && survol.ySouris + HAUTEUR_ESTIMEE > survol.hauteur

  const rabats = [
    versLaGauche ? 'translateX(calc(-100% - 28px))' : null,
    versLeHaut ? 'translateY(calc(-100% - 28px))' : null,
  ].filter(Boolean)

  return (
    <div
      className="infobulle"
      style={{
        left: survol.xSouris + 14,
        top: survol.ySouris + 12,
        transform: rabats.length ? rabats.join(' ') : undefined,
      }}
    >
      <strong>{survol.annee}</strong>
      {lignes.map((ligne) => (
        <div key={ligne}>{ligne}</div>
      ))}
    </div>
  )
}

export default Infobulle
