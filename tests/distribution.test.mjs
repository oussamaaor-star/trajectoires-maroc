/* ============================================================================
   distribution.test.mjs — protège le RELEVÉ DE DISTRIBUTION
   ----------------------------------------------------------------------------
   Ce tableau affiche sept chiffres par série. Un seul faux, et il devient pire
   qu'absent : un tableau de statistiques a l'autorité de l'exactitude, et
   personne ne recalcule une médiane à la main devant un écran.

   LES TROIS ERREURS À EMPÊCHER, ET ELLES SONT CLASSIQUES
   1. La médiane d'un effectif PAIR. La tentation est de prendre la valeur du
      milieu ; il y en a deux, et la médiane est leur moyenne.
   2. L'écart-type d'ÉCHANTILLON à la place de celui de POPULATION. Diviser par
      N − 1 au lieu de N donne un chiffre plus grand, plausible, et faux au
      regard de ce que la plateforme affirme mesurer.
   3. La DISPERSION sur une moyenne nulle. Diviser par zéro donne l'infini, et
      l'infini s'affiche.
   ============================================================================ */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import {
  mediane,
  ecartType,
  distributionDeLaSerie,
  tableauDistribution,
  laPlusDispersee,
} from '../src/utils/distribution.js'
import { toutesLesSeries } from '../src/utils/donnees.js'

function serie(valeurs, debut = 2000) {
  return {
    id: 'test',
    nom: 'Test',
    unite: 'milliards DH',
    points: valeurs.map((v, i) => ({ annee: debut + i, valeur: v })),
  }
}

describe('Médiane', () => {
  it('prend la valeur centrale quand l’effectif est impair', () => {
    assert.equal(mediane([1, 2, 3, 4, 5]), 3)
  })

  it('fait la moyenne des deux valeurs centrales quand l’effectif est pair', () => {
    /* L'erreur à empêcher : renvoyer 2 ou 3 au lieu de 2,5. */
    assert.equal(mediane([1, 2, 3, 4]), 2.5)
  })

  it('renvoie null sur une liste vide', () => {
    assert.equal(mediane([]), null)
  })
})

describe('Écart-type', () => {
  it('est celui d’une POPULATION : la somme des carrés est divisée par N', () => {
    /* 2, 4, 4, 4, 5, 5, 7, 9 : moyenne 5, écarts −3,−1,−1,−1,0,0,2,4.
       Somme des carrés = 9+1+1+1+0+0+4+16 = 32. Population : 32/8 = 4, σ = 2.
       Échantillon (÷7) donnerait 2,138 — c'est cette valeur qui ne doit PAS
       sortir. */
    assert.equal(ecartType([2, 4, 4, 4, 5, 5, 7, 9], 5), 2)
  })

  it('vaut zéro quand toutes les valeurs sont identiques', () => {
    assert.equal(ecartType([7, 7, 7], 7), 0)
  })
})

describe('Description d’une série', () => {
  it('donne les extremums AVEC leur année', () => {
    /* Sans l'année, un minimum ne se vérifie pas sur le graphique d'à côté. */
    const d = distributionDeLaSerie(serie([5, 1, 9, 3], 2010))
    assert.equal(d.min, 1)
    assert.equal(d.minAnnee, 2011)
    assert.equal(d.max, 9)
    assert.equal(d.maxAnnee, 2012)
  })

  it('calcule moyenne, médiane et dispersion sur un cas vérifiable de tête', () => {
    /* 2, 4, 4, 4, 5, 5, 7, 9 : moyenne 5, σ = 2, dispersion = 2/5 = 40 %.
       Médiane d'un effectif pair : (4 + 5) / 2 = 4,5. */
    const d = distributionDeLaSerie(serie([2, 4, 4, 4, 5, 5, 7, 9]))
    assert.equal(d.releves, 8)
    assert.equal(d.moyenne, 5)
    assert.equal(d.mediane, 4.5)
    assert.equal(d.ecartType, 2)
    assert.equal(d.dispersion, 40)
  })

  it('ignore les valeurs non numériques au lieu de les compter pour zéro', () => {
    /* Une valeur absente comptée comme 0 tirerait la moyenne vers le bas et
       gonflerait la dispersion : le tableau accuserait une série d'être
       instable alors qu'il lui manque une année. */
    const s = serie([10, 10, 10])
    s.points.push({ annee: 2003, valeur: null })
    s.points.push({ annee: 2004, valeur: 'n/d' })
    const d = distributionDeLaSerie(s)
    assert.equal(d.releves, 3)
    assert.equal(d.moyenne, 10)
    assert.equal(d.ecartType, 0)
  })

  it('laisse la dispersion vide plutôt que d’afficher l’infini', () => {
    /* Moyenne nulle : le rapport σ/moyenne n'existe pas. La colonne reste
       vide ; elle ne montre pas « Infinity ». */
    const d = distributionDeLaSerie(serie([-5, 0, 5]))
    assert.equal(d.moyenne, 0)
    assert.equal(d.dispersion, null)
  })

  it('ne casse pas sur une série sans aucun point', () => {
    const d = distributionDeLaSerie({ id: 'vide', nom: 'Vide', points: [] })
    assert.equal(d.releves, 0)
    assert.equal(d.moyenne, null)
    assert.equal(d.dispersion, null)
  })
})

describe('Le tableau sur les données réelles', () => {
  it('décrit toutes les séries de la plateforme, sans trou', () => {
    const lignes = tableauDistribution(toutesLesSeries)
    assert.equal(lignes.length, toutesLesSeries.length)
    for (const l of lignes) {
      assert.ok(l.releves > 0, `série sans relevé : ${l.nom}`)
      assert.ok(Number.isFinite(l.moyenne), `moyenne non calculée : ${l.nom}`)
      assert.ok(Number.isFinite(l.ecartType), `écart-type non calculé : ${l.nom}`)
      assert.ok(l.ecartType >= 0, `écart-type négatif : ${l.nom}`)
    }
  })

  it('encadre toujours la médiane par le minimum et le maximum', () => {
    /* Contrôle de cohérence interne : si cet ordre se rompt, c'est qu'un tri
       ou un extremum est faux. */
    for (const l of tableauDistribution(toutesLesSeries)) {
      assert.ok(l.min <= l.mediane, `médiane sous le minimum : ${l.nom}`)
      assert.ok(l.mediane <= l.max, `médiane au-dessus du maximum : ${l.nom}`)
      assert.ok(l.min <= l.moyenne && l.moyenne <= l.max, `moyenne hors bornes : ${l.nom}`)
    }
  })

  it('retrouve les 45,6 % de la production céréalière', () => {
    /* Ce chiffre est écrit dans le rapport et sur la page blé, où il justifie
       le refus de projeter la série. Le test le rattache aux données : si une
       campagne s'ajoute et que le chiffre bouge, ce test tombe et le texte
       doit être corrigé au lieu de vieillir en silence. */
    const ble = tableauDistribution(toutesLesSeries).find((l) => l.id === 'prod_cereales')
    assert.equal(ble.dispersion, 45.6)
  })

  it('place une série en forte croissance en tête de la dispersion', () => {
    /* Ce test protège une NUANCE, pas un chiffre. La dispersion la plus haute
       n'appartient pas à la série la plus instable mais à une série qui part
       de presque rien et monte : l'écart à la moyenne y mesure la croissance.
       C'est la raison de la mise en garde imprimée sous le tableau. Si un jour
       une série stationnaire passait en tête, cette mise en garde n'aurait
       plus lieu d'être et il faudrait la retirer. */
    const haut = laPlusDispersee(toutesLesSeries)
    assert.ok(haut.dispersion > 100, `dispersion attendue au-dessus de 100 % : ${haut.dispersion}`)
    assert.ok(haut.max / Math.max(haut.min, 0.001) > 50, 'la tête de liste doit être une série qui monte fortement')
  })
})
