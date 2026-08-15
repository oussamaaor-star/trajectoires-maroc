import { phrasesDeLaSerie } from '../utils/analyse'

/* ============================================================================
   LectureAutomatique — le bloc « Lecture automatique ».
   Il affiche les 2 phrases générées par utils/analyse.js à partir de la série
   principale du secteur. Ce composant n'écrit AUCUN texte de son propre chef :
   il montre ce que la fonction pure lui renvoie. Un texte faux se corrige donc
   dans analyse.js (et se verrouille par un test), jamais dans le JSX.
   ============================================================================ */
function LectureAutomatique({ serie }) {
  const phrases = phrasesDeLaSerie(serie)
  if (phrases.length === 0) return null

  return (
    <section className="lecture-auto">
      <h3 className="lecture-auto__titre">Lecture automatique</h3>
      <p className="lecture-auto__mention">
        Analyse générée automatiquement à partir des données (aucun texte écrit à la main).
      </p>
      <p>{phrases.join(' ')}</p>
    </section>
  )
}

export default LectureAutomatique
