/* ============================================================================
   formatage.test.mjs — protège l'affichage des CHIFFRES
   ----------------------------------------------------------------------------
   Tout nombre visible sur le site passe par src/utils/formatage.js. Si ce
   module régresse, c'est TOUT le site qui affiche « 1240.5 » au lieu de
   « 1 240,5 ». Ces tests figent la convention typographique française.
   ============================================================================ */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { formate, formateNombre, formateVariation, uniteCourte } from '../src/utils/formatage.js'

/* ⚠️ En français, Intl.NumberFormat sépare les milliers avec une ESPACE FINE
   INSÉCABLE (U+202F), pas une espace ordinaire. On la nomme pour que les
   assertions restent lisibles. */
const ESPACE_FINE = '\u202f'

describe('formateNombre — convention française', () => {
  it('sépare les milliers avec une espace fine (jamais une virgule)', () => {
    assert.equal(formateNombre(1240), `1${ESPACE_FINE}240`)
    assert.ok(!formateNombre(1240).includes(','), 'aucune virgule pour les milliers')
  })

  it('écrit les décimales avec une virgule, gère zéro et le signe négatif', () => {
    assert.equal(formateNombre(6.39), '6,39')
    assert.equal(formateNombre(0), '0')
    assert.equal(formateNombre(-4.5), '-4,5')
  })
})

describe('uniteCourte — abréviation des unités', () => {
  it('abrège les unités longues et ramène les pourcentages à « % »', () => {
    assert.equal(uniteCourte('milliards USD'), 'Md USD')
    assert.equal(uniteCourte('millions de tonnes'), 'Mt')
    assert.equal(uniteCourte('% du PIB'), '%')
    assert.equal(uniteCourte("% de l'énergie utilisée"), '%')
  })

  it('laisse passer telle quelle une unité inconnue', () => {
    assert.equal(uniteCourte('barils par jour'), 'barils par jour')
  })
})

describe('formate & formateVariation', () => {
  it('assemble le nombre français et l’unité abrégée', () => {
    assert.equal(formate(6.39, 'milliards USD'), '6,39 Md USD')
    assert.equal(formate(93.6, "% de l'énergie utilisée"), '93,6 %')
  })

  it('ajoute un « + » aux hausses, rien aux baisses ni au zéro', () => {
    assert.equal(formateVariation(22.2), '+22,2')
    assert.equal(formateVariation(-6), '-6')
    assert.equal(formateVariation(0), '0')
  })
})
