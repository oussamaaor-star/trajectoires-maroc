/* ============================================================================
   analyse.test.mjs — protège le MOTEUR DE SYNTHÈSE AUTOMATIQUE (simple)
   ----------------------------------------------------------------------------
   src/utils/analyse.js transforme des chiffres en phrases affichées au
   visiteur, et prolonge la tendance sur 2 ans. Une erreur ici ne fait rien
   planter : elle publie une phrase FAUSSE, proprement mise en page. D'où ces
   tests, sur des séries fabriquées vérifiables de tête + les vraies données.
   ============================================================================ */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { phrasesDeLaSerie, projetteDeuxAns } from '../src/utils/analyse.js'
import { serieParId } from '../src/utils/donnees.js'

/* Les espaces qui séparent un nombre de son unité sont INSÉCABLES (U+00A0
   devant une unité en lettres, U+202F devant « % »). On les importe : une
   espace ordinaire tapée ici passerait inaperçue à la relecture. */
import { ESPACE_FINE, ESPACE_MOT } from '../src/utils/formatage.js'

function serie(points, unite = 'milliards USD') {
  return { id: 'test', nom: 'Test', secteur: 'automobile', unite, points: points.map(([a, v]) => ({ annee: a, valeur: v })) }
}

describe('Phrase d’évolution', () => {
  it('exprime un rapport ≥ 2 en « multiplié par N »', () => {
    const phrases = phrasesDeLaSerie(serie([[2010, 2], [2020, 8]]))
    assert.match(phrases[0], new RegExp(`De 2${ESPACE_MOT}Md USD en 2010 à 8${ESPACE_MOT}Md USD en 2020`))
    assert.match(phrases[0], /multipliée par 4\./)
  })

  it('exprime une hausse et une baisse modérées en pourcentage', () => {
    assert.match(phrasesDeLaSerie(serie([[2010, 100], [2020, 150]]))[0], new RegExp(`augmenté de 50${ESPACE_FINE}%`))
    assert.match(phrasesDeLaSerie(serie([[2010, 100], [2020, 80]]))[0], new RegExp(`diminué de 20${ESPACE_FINE}%`))
  })

  it('gère un départ à zéro sans calculer de pourcentage absurde', () => {
    const texte = phrasesDeLaSerie(serie([[2010, 0], [2020, 5]])).join(' ')
    assert.match(texte, /forte progression depuis un niveau très faible/)
    assert.doesNotMatch(texte, /Infinity|NaN|multipliée/)
  })
})

describe('Phrase des extrêmes', () => {
  it('donne le maximum et le minimum avec leurs années', () => {
    const phrases = phrasesDeLaSerie(serie([[2010, 5], [2011, 9], [2012, 2], [2013, 7]]))
    assert.match(phrases[1], new RegExp(`maximum est atteint en 2011 \\(9${ESPACE_MOT}Md USD\\)`))
    assert.match(phrases[1], new RegExp(`minimum en 2012 \\(2${ESPACE_MOT}Md USD\\)`))
  })
})

describe('Cas limites', () => {
  it('renvoie [] pour une série trop courte, et 2 phrases sinon', () => {
    assert.deepEqual(phrasesDeLaSerie(serie([[2020, 4]])), [])
    assert.deepEqual(phrasesDeLaSerie(serie([])), [])
    assert.deepEqual(phrasesDeLaSerie(null), [])
    assert.equal(phrasesDeLaSerie(serie([[2010, 1], [2011, 2], [2012, 3]])).length, 2)
  })
})

describe('Véracité sur les vraies données', () => {
  it('BLÉ — la production varie bien du simple au sextuple (11,69 / 1,78)', () => {
    const texte = phrasesDeLaSerie(serieParId('prod_cereales')).join(' ')
    assert.match(texte, new RegExp(`De 6,28${ESPACE_MOT}Mt en 1990 à 3,21${ESPACE_MOT}Mt en 2024`))
    assert.match(texte, new RegExp(`maximum est atteint en 2015 \\(11,69${ESPACE_MOT}Mt\\)`))
    assert.match(texte, new RegExp(`minimum en 1995 \\(1,78${ESPACE_MOT}Mt\\)`))
  })

  it('AUTOMOBILE — les exportations partent de presque rien (Office des Changes)', () => {
    const texte = phrasesDeLaSerie(serieParId('exports_voitures')).join(' ')
    /* 0,007 Md DH en 1998 : les données douanières commencent bien avant
       l'usine de Melloussa (2012). Le premier point doit rester lisible et
       ne surtout pas s'arrondir à « 0 ». */
    assert.match(texte, new RegExp(`De 0,007${ESPACE_MOT}Md DH en 1998 à 59,11${ESPACE_MOT}Md DH en 2025`))
    /* 59,113 / 0,007 = 8 444,7 — exact, mais dû au niveau de départ : la
       phrase doit le dire elle-même, sinon elle ment par omission. */
    assert.match(texte, /multipliée par 8 444,7/)
    assert.match(texte, /amplifié par le très faible niveau de départ/)
  })
})

describe('Projection simple sur 2 ans', () => {
  it('prolonge une tendance régulière (moyenne des 3 variations)', () => {
    /* +1 par an sur 4 ans → 2 années projetées à +1, +1. */
    assert.deepEqual(projetteDeuxAns([[2020, 1], [2021, 2], [2022, 3], [2023, 4]].map(([a, v]) => ({ annee: a, valeur: v }))), [
      { annee: 2024, valeur: 5 },
      { annee: 2025, valeur: 6 },
    ])
  })

  it('ramène à zéro une valeur projetée qui deviendrait négative', () => {
    /* Tendance −2/an à partir de 4 → 2024 = 2, puis 2025 = 0 (jamais négatif). */
    const points = [[2020, 10], [2021, 7], [2022, 5], [2023, 4]].map(([a, v]) => ({ annee: a, valeur: v }))
    const projection = projetteDeuxAns(points)
    assert.equal(projection[0].valeur, 2)
    assert.equal(projection[1].valeur, 0)
  })

  it('ne projette rien sans au moins 4 années d’historique', () => {
    assert.deepEqual(projetteDeuxAns([[2020, 1], [2021, 2], [2022, 3]].map(([a, v]) => ({ annee: a, valeur: v }))), [])
  })
})
