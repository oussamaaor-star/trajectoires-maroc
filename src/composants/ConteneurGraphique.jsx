import { useState } from 'react'
import TableauDonnees from './TableauDonnees'
import { anneesDesSeries, valeurPour, urlDeLaSource, dernierPoint } from '../utils/donnees'

/* La « carte » qui englobe le graphique : titre-constat, sous-titre (unité +
   période), bascule Graphique | Données, export CSV, la figure, puis la source.
   La vue Données (tableau) montre les mêmes valeurs que le graphique : c'est
   son équivalent accessible (l'infobulle n'est jamais le seul moyen de lire
   une valeur). */
function ConteneurGraphique({ titre, sousTitre, series, idFichier, children }) {
  /* Une seule information d'état : la vue affichée (graphique ou tableau). */
  const [vue, setVue] = useState('graphique')

  /* Export CSV « fait main » : on fabrique le texte ligne par ligne, on le met
     dans un Blob (un fichier en mémoire), et on simule un clic sur un lien de
     téléchargement. Conventions françaises : séparateur « ; », virgule
     décimale ; le BOM en tête permet à Excel de lire les accents. */
  function telechargeCsv() {
    const nombreFr = (valeur) => (valeur == null ? '' : String(valeur).replace('.', ','))
    const entete = ['annee', ...series.map((s) => `${s.nom} (${s.unite})`)]
    const annees = anneesDesSeries(series)
    const lignes = annees.map((annee) =>
      [annee, ...series.map((s) => nombreFr(valeurPour(s, annee)))].join(';'),
    )
    const texte = [entete.join(';'), ...lignes].join('\n')

    const blob = new Blob(['﻿' + texte], { type: 'text/csv;charset=utf-8' })
    const lien = document.createElement('a')
    lien.href = URL.createObjectURL(blob)
    lien.download = `${idFichier}.csv`
    lien.click()
    URL.revokeObjectURL(lien.href)
  }

  function classeBouton(nomVue) {
    return `bouton bouton--discret bouton--petit${vue === nomVue ? ' actif' : ''}`
  }

  /* La source affichée est celle de la série principale (la première). */
  const principale = series[0]
  const urlSource = urlDeLaSource(principale.source)
  const dernier = dernierPoint(principale)

  return (
    <section className="conteneur-graphique">
      <div className="conteneur-graphique__entete">
        <div>
          <h3 className="conteneur-graphique__titre">{titre}</h3>
          <p className="conteneur-graphique__sous-titre">{sousTitre}</p>
        </div>
        <div className="conteneur-graphique__actions">
          <div className="groupe-boutons">
            <button type="button" className={classeBouton('graphique')} onClick={() => setVue('graphique')}>
              Graphique
            </button>
            <button type="button" className={classeBouton('donnees')} onClick={() => setVue('donnees')}>
              Données
            </button>
            <button type="button" className="bouton bouton--discret bouton--petit" onClick={telechargeCsv}>
              ⬇ CSV
            </button>
          </div>
        </div>
      </div>

      {vue === 'graphique' ? (
        children
      ) : (
        <div className="defilement-tableau">
          <TableauDonnees series={series} />
        </div>
      )}

      <p className="conteneur-graphique__source">
        Source :{' '}
        {urlSource ? (
          <a href={urlSource} target="_blank" rel="noreferrer">
            {principale.source}
          </a>
        ) : (
          principale.source
        )}{' '}
        ({dernier.annee})
      </p>
    </section>
  )
}

export default ConteneurGraphique
