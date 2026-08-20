/* ============================================================================
   formatage.test.mjs — protège l'affichage des CHIFFRES
   ----------------------------------------------------------------------------
   Tout nombre visible sur le site passe par src/utils/formatage.js. Si ce
   module régresse, c'est TOUT le site qui affiche « 1240.5 » au lieu de
   « 1 240,5 ». Ces tests figent la convention typographique française.
   ============================================================================ */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import {
  ESPACE_FINE,
  ESPACE_MOT,
  formate,
  formateNombre,
  formateVariation,
  uniteCourte,
} from '../src/utils/formatage.js'

/* ⚠️ PIÈGE MAJEUR : ni Intl.NumberFormat ni formate() ne séparent avec une
   espace ordinaire (U+0020). Les milliers et le « % » prennent une ESPACE
   FINE INSÉCABLE (U+202F), les unités écrites en lettres une espace
   insécable ordinaire (U+00A0). Un test écrit avec une espace normale
   échouerait sans qu'on comprenne pourquoi — les trois caractères sont
   visuellement identiques.
   Les deux constantes sont IMPORTÉES du module testé, jamais recopiées :
   ce fichier en gardait sa propre copie, et une assertion pouvait donc
   rester verte en décrivant une typographie que le site ne produit plus. */

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
    assert.equal(formate(6.39, 'milliards USD'), `6,39${ESPACE_MOT}Md USD`)
    assert.equal(formate(93.6, "% de l'énergie utilisée"), `93,6${ESPACE_FINE}%`)
  })

  it('ajoute un « + » aux hausses, rien aux baisses ni au zéro', () => {
    assert.equal(formateVariation(22.2), '+22,2')
    assert.equal(formateVariation(-6), '-6')
    assert.equal(formateVariation(0), '0')
  })
})

describe('Une valeur absente n’est jamais un zéro', () => {
  /* C'est la règle que la plateforme affiche partout : « une année non publiée
     reste un trou ». Elle était tenue dans l'export CSV et cassée à l'écran —
     formateNombre(null) renvoyait « 0 ». Ces trois tests l'empêchent de se
     recasser, et le troisième est le plus important : il vérifie qu'un VRAI
     zéro reste bien un zéro. Une garde trop large serait aussi fausse que
     l'absence de garde. */
  it('affiche un tiret pour une valeur nulle ou manquante', () => {
    assert.equal(formateNombre(null), '—')
    assert.equal(formateNombre(undefined), '—')
    assert.equal(formateNombre(NaN), '—')
  })

  it('n’avale pas un zéro véritable', () => {
    assert.equal(formateNombre(0), '0')
  })

  it('formate encore les nombres réels à la française', () => {
    assert.equal(formateNombre(7688967), '7 688 967')
  })
})
