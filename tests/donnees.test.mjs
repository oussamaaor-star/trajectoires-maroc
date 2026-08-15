/* ============================================================================
   donnees.test.mjs — protège la COUCHE D'ACCÈS AUX DONNÉES
   ----------------------------------------------------------------------------
   src/utils/donnees.js est la seule porte d'entrée vers les fichiers JSON.
   Toutes les pages en dépendent : une régression ici vide un graphique ou
   fausse un chiffre — silencieusement. D'où ces tests.
   ============================================================================ */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import {
  anneesDesSeries,
  dernierPoint,
  evenementsDuSecteur,
  periodeDesSeries,
  secteurParId,
  serieParId,
  seriesDuSecteur,
  urlDeLaSource,
  valeurPour,
} from '../src/utils/donnees.js'

/* Petite fabrique de séries de test : chiffres ronds, vérifiables de tête et
   indépendants du dataset réel. */
function serie(id, points) {
  return {
    id,
    nom: `Série ${id}`,
    secteur: 'automobile',
    unite: 'milliards USD',
    source: 'UN Comtrade',
    points: points.map(([annee, valeur]) => ({ annee, valeur })),
  }
}

describe('Recherche dans le dataset', () => {
  it('retrouve une série et un secteur par leur identifiant (undefined sinon)', () => {
    assert.equal(serieParId('exports_voitures')?.id, 'exports_voitures')
    assert.equal(serieParId('serie_qui_nexiste_pas'), undefined)
    assert.equal(secteurParId('automobile')?.id, 'automobile')
    assert.equal(secteurParId('inconnu'), undefined)
  })

  it('ne renvoie que les séries du secteur demandé', () => {
    const seriesEnergie = seriesDuSecteur('energie')
    assert.ok(seriesEnergie.length > 0)
    assert.ok(seriesEnergie.every((s) => s.secteur === 'energie'))
    assert.deepEqual(seriesDuSecteur('petrochimie'), [])
  })

  it('ne renvoie que les événements du secteur demandé', () => {
    const evts = evenementsDuSecteur('ble')
    assert.ok(evts.length > 0)
    assert.ok(evts.every((e) => e.secteur === 'ble'))
  })
})

describe('Lecture des points d’une série', () => {
  it('donne le dernier point et la valeur d’une année (null si absente)', () => {
    const s = serie('a', [[2020, 10], [2021, 20], [2022, 30]])
    assert.deepEqual(dernierPoint(s), { annee: 2022, valeur: 30 })
    assert.equal(valeurPour(s, 2021), 20)
    assert.equal(valeurPour(s, 1999), null)
  })

  it('distingue une valeur nulle d’une valeur absente (piège du zéro)', () => {
    /* Zéro est « falsy » : une écriture naïve renverrait null pour une vraie
       mesure à 0, effaçant le point du graphique. */
    assert.equal(valeurPour(serie('a', [[2020, 0]]), 2020), 0)
  })
})

describe('Années, période et sources', () => {
  it('fait l’union triée des années et affiche la période « début–fin »', () => {
    const a = serie('a', [[2002, 1], [2000, 1]])
    const b = serie('b', [[2001, 1], [2002, 1]])
    assert.deepEqual(anneesDesSeries([a, b]), [2000, 2001, 2002])
    assert.equal(periodeDesSeries([serie('c', [[1990, 1], [2025, 1]])]), '1990–2025')
  })

  it('donne l’URL des fournisseurs connus, undefined sinon', () => {
    assert.equal(urlDeLaSource('Banque Mondiale'), 'https://data.worldbank.org')
    assert.equal(urlDeLaSource('Office des Changes'), 'https://www.oc.gov.ma')
    assert.equal(urlDeLaSource('Institut inconnu'), undefined)
  })
})
