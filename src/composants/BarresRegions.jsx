import { useState } from 'react'
import { formateNombre } from '../utils/formatage'

/* ============================================================================
   BarresRegions — un graphique en BARRES HORIZONTALES, une barre par région.
   C'est la dimension TERRITORIALE de la plateforme : au lieu du temps, l'axe
   est l'espace (les 12 régions). Chaque barre a une largeur proportionnelle à
   la valeur, avec le chiffre affiché à droite. Comme les autres graphiques :
   une bascule Graphique / Données et un export CSV.
   Barres en HTML/CSS (pas en SVG) : c'est plus simple à lire, et ça reste
   lisible sur mobile sans réglage.
   ============================================================================ */
function BarresRegions({ indicateur, regions }) {
  const [vue, setVue] = useState('graphique')

  /* La plus grande valeur donne l'échelle : la barre la plus longue = 100 %. */
  const maximum = Math.max(...regions.map((r) => r.valeur ?? 0))

  function telechargeCsv() {
    const nombreFr = (valeur) => (valeur == null ? '' : String(valeur).replace('.', ','))
    const entete = ['code', 'region', `valeur (${indicateur.unite})`]
    const lignes = regions.map((r) => [r.code, r.nom, nombreFr(r.valeur)].join(';'))
    const texte = [entete.join(';'), ...lignes].join('\n')

    const blob = new Blob(['﻿' + texte], { type: 'text/csv;charset=utf-8' })
    const lien = document.createElement('a')
    lien.href = URL.createObjectURL(blob)
    lien.download = `regions_${indicateur.id}.csv`
    lien.click()
    URL.revokeObjectURL(lien.href)
  }

  function classeBouton(nomVue) {
    return `bouton bouton--discret bouton--petit${vue === nomVue ? ' actif' : ''}`
  }

  return (
    <section className="conteneur-graphique">
      <div className="conteneur-graphique__entete">
        <div>
          <h3 className="conteneur-graphique__titre">{indicateur.nom}</h3>
          <p className="conteneur-graphique__sous-titre">
            {indicateur.unite} · {indicateur.annee} · 12 régions
          </p>
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
        <ul className="barres-regions">
          {regions.map((region) => (
            <li key={region.code} className="barre-region">
              <span className="barre-region__nom">{region.nom}</span>
              <span className="barre-region__piste">
                <span
                  className="barre-region__remplissage"
                  style={{ width: `${maximum > 0 ? (region.valeur / maximum) * 100 : 0}%` }}
                />
              </span>
              <span className="barre-region__valeur">{formateNombre(region.valeur)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="defilement-tableau defilement-tableau--etroit">
          <table className="tableau-donnees">
            {/* Même principe que dans TableauDonnees : la légende dit ce que
                contient le tableau, et elle est construite à partir de
                l'indicateur affiché plutôt qu'écrite à la main. */}
            <caption className="sr-only">
              {indicateur.nom} par région ({indicateur.unite}) — les douze
              régions du Maroc, de la plus élevée à la plus faible.
            </caption>
            <thead>
              <tr>
                <th scope="col">Région</th>
                <th scope="col" className="num">{indicateur.unite}</th>
              </tr>
            </thead>
            <tbody>
              {regions.map((region) => (
                <tr key={region.code}>
                  <td>{region.nom}</td>
                  <td className="num">{formateNombre(region.valeur)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="conteneur-graphique__source">Source : {indicateur.source}</p>
    </section>
  )
}

export default BarresRegions
