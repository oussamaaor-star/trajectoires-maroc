/* ============================================================================
   integrite-donnees.test.mjs — protège les TOTAUX PUBLIÉS

   DONNEES-PROVENANCE.md affirme que le recoupement des populations régionales
   avec le total national du HCP « n'est pas seulement documenté, il est
   automatisé ». Ce fichier est ce qui rend la phrase vraie : il n'existait pas
   quand elle a été écrite.

   Ce que ces tests protègent : les douze valeurs régionales sont recopiées à
   la main depuis le décret de population légale. Une faute de frappe sur un
   chiffre ne se voit pas — la barre reste plausible, la page reste jolie, et
   le total est faux. Le recoupement, lui, la voit.
   ============================================================================ */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import valeursRegionales from '../src/data/valeurs-regionales.json' with { type: 'json' }
import regionsNoms from '../src/data/regions-noms.json' with { type: 'json' }

/* Population légale du Maroc au 1er septembre 2024, telle que publiée par le
   HCP (décret n° 2.24.1009). C'est le chiffre extérieur : il ne doit jamais
   être recalculé à partir des données du projet, sinon le test ne compare
   plus rien. */
const TOTAL_NATIONAL_HCP = 36828330

describe('Recoupement des données régionales', () => {
  const indicateur = valeursRegionales[0]

  it('retrouve le total national publié par le HCP', () => {
    const somme = Object.values(indicateur.valeurs)
      .filter((v) => v != null)
      .reduce((a, b) => a + b, 0)
    assert.equal(somme, TOTAL_NATIONAL_HCP)
  })

  it('couvre les douze régions, sans code inconnu ni doublon', () => {
    const codesConnus = new Set(Object.keys(regionsNoms))
    const codesPortes = Object.keys(indicateur.valeurs)
    assert.equal(codesPortes.length, 12)
    assert.equal(new Set(codesPortes).size, 12)
    for (const code of codesPortes) {
      assert.ok(codesConnus.has(code), `code régional inconnu : ${code}`)
    }
  })

  it('déclare sa source et son année', () => {
    assert.match(indicateur.source, /HCP/)
    assert.equal(indicateur.annee, 2024)
  })
})
