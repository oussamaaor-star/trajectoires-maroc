/* ============================================================================
   graphique.test.mjs — protège L'ÉCHELLE ET L'AXE DES ANNÉES
   ----------------------------------------------------------------------------
   C'est le calcul le plus visible de la plateforme, et le seul dont une erreur
   ne se voit pas : une échelle mal choisie ne casse rien, elle DÉFORME. La
   courbe reste jolie, l'écran reste propre, et la pente racontée n'est pas la
   bonne. Aucun message d'erreur n'accompagnera jamais ce genre de faute.

   LES QUATRE ERREURS À EMPÊCHER
   1. Des graduations non rondes. Si l'échelle sort 0, 17, 34, 51, 68, la
      grille devient illisible : le lecteur ne peut plus situer une valeur à
      l'œil entre deux traits.
   2. Une échelle qui n'ENGLOBE pas les données. Si `min` est au-dessus de la
      plus petite valeur, un point sort du cadre — et il sort en silence.
   3. Le zéro forcé qui ne l'est pas. Les barres se lisent par leur hauteur :
      une barre dont l'axe part de 80 ment sur son rapport à sa voisine.
   4. Un axe des années SANS AUCUNE année, sur une période trop courte pour
      contenir un multiple de cinq.
   ============================================================================ */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { VUE, calculeEchelle, anneesAxe } from '../src/utils/graphique.js'
import { toutesLesSeries } from '../src/utils/donnees.js'

/* Un pas est « rond » s'il vaut 1, 2, 2,5 ou 5 fois une puissance de dix. */
function pasEstRond(pas) {
  const puissance = 10 ** Math.floor(Math.log10(pas))
  const mantisse = Number((pas / puissance).toFixed(10))
  return [1, 2, 2.5, 5, 10].includes(mantisse)
}

describe('Échelle verticale', () => {
  it('choisit des graduations rondes plutôt que les valeurs brutes', () => {
    /* 0,007 → 68 : le partage naïf en quatre donnerait 0 / 17 / 34 / 51 / 68.
       L'échelle doit préférer un pas rond, quitte à dépasser un peu le
       maximum. C'est le cas exact des exportations automobiles. */
    const e = calculeEchelle([0.007, 12, 45, 67.998])
    assert.ok(pasEstRond(e.graduations[1] - e.graduations[0]),
      `pas non rond : ${e.graduations.join(', ')}`)
    assert.equal(e.graduations[0], 0)
    assert.equal(e.max, 80)
  })

  it('englobe toujours les données, sans jamais laisser un point dehors', () => {
    for (const valeurs of [[1, 2, 3], [-7.2, 0, 12.4], [0.003, 0.29], [313, 616], [81.3, 103.8]]) {
      const e = calculeEchelle(valeurs)
      assert.ok(e.min <= Math.min(...valeurs), `min trop haut pour ${valeurs}`)
      assert.ok(e.max >= Math.max(...valeurs), `max trop bas pour ${valeurs}`)
    }
  })

  it('ne force pas le zéro par défaut : une série resserrée garde sa lisibilité', () => {
    /* La dépendance énergétique varie de 81,3 à 103,8. Partir de zéro
       écraserait toute la variation en haut du cadre. */
    const e = calculeEchelle([81.3, 93.6, 103.8])
    assert.ok(e.min > 0, `l’échelle ne devrait pas partir de zéro : min = ${e.min}`)
  })

  it('force le zéro quand on le demande, ce dont les barres dépendent', () => {
    /* Une barre se lit par sa hauteur. Si l'axe ne part pas de zéro, deux
       barres proches paraissent dans un rapport qui n'est pas le leur. */
    const e = calculeEchelle([3.21, 11.69], true)
    assert.equal(e.min, 0)
  })

  it('descend sous zéro quand une valeur est négative', () => {
    /* Le solde net de la filière automobile tombe à −2,758 en 2009, et la
       croissance du PIB à −7,2 en 2020. Ces points doivent rester dans le
       cadre. */
    const e = calculeEchelle([-2.758, 20, 51.491])
    assert.ok(e.min <= -2.758)
  })

  it('ne produit pas de graduation à virgule flottante sale', () => {
    /* 0.1 + 0.2 vaut 0.30000000000000004 en binaire. Une graduation affichée
       « 0,30000000000000004 » suffit à discréditer tout l’écran. */
    const e = calculeEchelle([0.1, 0.5])
    for (const g of e.graduations) {
      assert.equal(g, Number(g.toFixed(10)), `graduation sale : ${g}`)
    }
  })

  it('ne s’effondre pas sur une série plate', () => {
    const e = calculeEchelle([5, 5, 5])
    assert.ok(e.max > e.min, 'une série plate doit garder un cadre non nul')
  })

  it('tient sur les vingt-six séries réelles', () => {
    /* Le contrôle qui compte : aucune série de la plateforme ne doit sortir
       de son cadre, ni recevoir un pas irrégulier. */
    for (const serie of toutesLesSeries) {
      const valeurs = serie.points.map((p) => p.valeur)
      const e = calculeEchelle(valeurs)
      assert.ok(e.min <= Math.min(...valeurs), `hors cadre en bas : ${serie.nom}`)
      assert.ok(e.max >= Math.max(...valeurs), `hors cadre en haut : ${serie.nom}`)
      assert.ok(e.graduations.length >= 2 && e.graduations.length <= 7,
        `${e.graduations.length} graduations sur ${serie.nom}`)
      const pas = e.graduations[1] - e.graduations[0]
      assert.ok(pasEstRond(pas), `pas non rond sur ${serie.nom} : ${pas}`)
    }
  })
})

describe('Axe des années', () => {
  it('gradue sur les multiples de cinq', () => {
    const a = anneesAxe([1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005])
    assert.deepEqual(a, [2000, 2005])
  })

  it('ajoute la dernière année si elle est assez loin de la dernière graduation', () => {
    /* 2025 n'est pas un multiple de 5 ; il est à 5 ans de 2020, donc il
       s'affiche. Sans cela, l'axe s'arrêterait avant le dernier point. */
    const a = anneesAxe([2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025])
    assert.ok(a.includes(2025))
  })

  it('n’ajoute PAS la dernière année si elle collerait à la graduation', () => {
    /* À moins de trois ans d'écart, les deux étiquettes se chevauchent à
       l'écran. C'est un défaut constaté, pas une précaution théorique. */
    const a = anneesAxe([2018, 2019, 2020, 2021])
    assert.ok(!a.includes(2021), `2021 ne devrait pas être gradué : ${a.join(', ')}`)
  })

  it('affiche quand même les bornes sur une période trop courte', () => {
    /* 2021-2023 ne contient aucun multiple de cinq : sans garde-fou, l'axe
       n'afficherait AUCUNE année. */
    assert.deepEqual(anneesAxe([2021, 2022, 2023]), [2021, 2023])
  })

  it('ne rend rien sur une liste vide', () => {
    assert.deepEqual(anneesAxe([]), [])
  })
})

describe('Le repère de dessin', () => {
  it('garde un cadre cohérent, dans lequel x0 < x1 et y0 < y1', () => {
    /* Si ces bornes s'inversent, tous les graphiques se retournent d'un coup
       et aucune fonction ne lève d'erreur pour le signaler. */
    assert.ok(VUE.x0 < VUE.x1, 'axe horizontal inversé')
    assert.ok(VUE.y0 < VUE.y1, 'axe vertical inversé')
    assert.ok(VUE.x1 <= VUE.largeur && VUE.y1 <= VUE.hauteur, 'cadre hors du viewBox')
  })
})
