/* ============================================================================
   qualite.test.mjs — protège le RELEVÉ DES TROUS
   ----------------------------------------------------------------------------
   Le tableau de couverture affirme, chiffres à l'appui, que la plateforme ne
   comble jamais une valeur manquante. Si le calcul se trompe, l'affirmation
   devient une décoration : le tableau montrerait 100 % partout et personne ne
   verrait la différence.

   L'ERREUR À EMPÊCHER, ET ELLE EST FACILE À FAIRE
   Diviser le nombre de relevés par lui-même donne 100 % pour toute série.
   La couverture doit se calculer sur l'ÉTENDUE — le nombre d'années entre la
   première et la dernière. Le premier test ci-dessous ne teste rien d'autre
   que cela, sur une série fabriquée dont on connaît la réponse de tête.
   ============================================================================ */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { qualiteDeLaSerie, tableauQualite, syntheseQualite } from '../src/utils/qualite.js'
import { toutesLesSeries } from '../src/utils/donnees.js'

function serie(annees) {
  return {
    id: 'test',
    nom: 'Test',
    unite: 'milliards DH',
    points: annees.map((a) => ({ annee: a, valeur: 1 })),
  }
}

describe('Couverture d’une série', () => {
  it('compte les années manquantes, pas seulement les relevés', () => {
    /* 2000 → 2004, c'est 5 années possibles. Trois relevés : 2001 et 2003
       manquent, la couverture est de 3/5 = 60 %. */
    const q = qualiteDeLaSerie(serie([2000, 2002, 2004]))
    assert.equal(q.debut, 2000)
    assert.equal(q.fin, 2004)
    assert.equal(q.etendue, 5)
    assert.equal(q.releves, 3)
    assert.deepEqual(q.manquantes, [2001, 2003])
    assert.equal(q.couverture, 60)
  })

  it('donne 100 % à une série sans trou', () => {
    const q = qualiteDeLaSerie(serie([2010, 2011, 2012]))
    assert.equal(q.couverture, 100)
    assert.deepEqual(q.manquantes, [])
  })

  it('ne compte pas une valeur non numérique comme un relevé', () => {
    const q = qualiteDeLaSerie({
      id: 'x',
      nom: 'X',
      points: [
        { annee: 2000, valeur: 1 },
        { annee: 2001, valeur: null },
        { annee: 2002, valeur: 3 },
      ],
    })
    assert.equal(q.releves, 2)
    assert.deepEqual(q.manquantes, [2001], 'une valeur nulle est un trou, pas un relevé')
  })

  it('survit à une série vide sans lever', () => {
    const q = qualiteDeLaSerie({ id: 'vide', nom: 'Vide', points: [] })
    assert.equal(q.releves, 0)
    assert.equal(q.couverture, 0)
  })
})

describe('Synthèse sur les vraies données', () => {
  it('additionne les relevés et les années possibles, pas les pourcentages', () => {
    /* La couverture globale n'est PAS la moyenne des couvertures : une série
       courte et parfaite ne doit pas peser autant qu'une série longue et
       trouée. On vérifie donc la cohérence interne du calcul. */
    const lignes = tableauQualite(toutesLesSeries)
    const s = syntheseQualite(toutesLesSeries)
    const releves = lignes.reduce((t, l) => t + l.releves, 0)
    const possibles = lignes.reduce((t, l) => t + l.etendue, 0)
    assert.equal(s.releves, releves)
    assert.equal(s.manquantes, possibles - releves)
    assert.equal(s.couverture, Math.round((releves / possibles) * 1000) / 10)
  })

  it('compte comme « sans trou » exactement les séries sans année manquante', () => {
    const lignes = tableauQualite(toutesLesSeries)
    const s = syntheseQualite(toutesLesSeries)
    assert.equal(s.completes, lignes.filter((l) => l.manquantes.length === 0).length)
    assert.ok(s.completes <= s.series)
  })

  it('la couverture reste un pourcentage plausible', () => {
    const s = syntheseQualite(toutesLesSeries)
    assert.ok(s.couverture > 0 && s.couverture <= 100, `couverture aberrante : ${s.couverture}`)
    assert.ok(s.series > 0 && s.releves > 0)
  })
})
