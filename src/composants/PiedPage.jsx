import { Link } from 'react-router-dom'

/* Pied de page commun : marque, mention du stage, lien vers les sources. */
function PiedPage() {
  return (
    <footer className="pied-page">
      <div className="conteneur">
        <p className="pied-page__marque">Trajectoires Maroc</p>
        {/* Ce pied s'affiche sur TOUTES les pages : il annonçait encore des
            « données d'exemple » alors que les séries douanières ont été
            livrées. Une phrase fausse répétée six fois reste une phrase
            fausse. */}
        <p>
          Stage DIGIUP 2026 — plateforme de démonstration. Données publiques :
          Office des Changes, Banque Mondiale, HCP —{' '}
          <Link to="/sources">voir les sources et ce qui reste à livrer</Link>.
        </p>
      </div>
    </footer>
  )
}

export default PiedPage
