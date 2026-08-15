/* ============================================================================
   prevision.test.mjs — protège le CONTRAT des prévisions
   ----------------------------------------------------------------------------
   src/data/predictions.json est le fichier que livre l'équipe data. La
   plateforme le lit sans le vérifier ligne à ligne : elle lui fait confiance.
   Ces tests sont cette vérification.

   POURQUOI TESTER UN FICHIER DE DONNÉES ET PAS DU CODE
   utils/prevision.js utilise `import.meta.glob`, une fonction fournie par
   Vite : le module n'est donc pas importable sous Node, donc pas testable
   directement. Mais l'essentiel n'est pas là. Une prévision fausse ne fait
   rien planter — elle dessine une courbe crédible et fausse. Ce qui doit être
   garanti, c'est que le FICHIER est cohérent avec les séries qu'il prolonge.

   QUATRE GARANTIES
   1. chaque prévision se rattache à une série qui existe ;
   2. elle commence APRÈS la dernière année observée (sinon elle recouvrirait
      des données réelles) ;
   3. ses bornes encadrent bien sa valeur ;
   4. le jeu de démonstration est SIGNALÉ comme tel — c'est ce qui déclenche
      l'avertissement affiché sous le graphique.
   ============================================================================ */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { toutesLesSeries } from '../src/utils/donnees.js'

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..')
const CHEMIN = join(RACINE, 'src', 'data', 'predictions.json')

/* Le fichier est FACULTATIF : la plateforme fonctionne sans lui. Les tests
   doivent donc passer même s'il est absent — sinon supprimer les prévisions
   casserait la suite alors que le site, lui, continuerait de marcher. */
const previsions = existsSync(CHEMIN) ? JSON.parse(readFileSync(CHEMIN, 'utf8')) : []

describe('Contrat des prévisions livrées', () => {
  it('est un tableau (même vide)', () => {
    assert.ok(Array.isArray(previsions), 'predictions.json doit contenir un tableau')
  })

  it('chaque prévision se rattache à une série existante', () => {
    for (const p of previsions) {
      const serie = toutesLesSeries.find((s) => s.id === p.id)
      assert.ok(serie, `prévision « ${p.id} » : aucune série de series.json ne porte cet identifiant`)
    }
  })

  it('ne prolonge jamais sur des années déjà observées', () => {
    for (const p of previsions) {
      const serie = toutesLesSeries.find((s) => s.id === p.id)
      const derniereReelle = serie.points[serie.points.length - 1].annee
      for (const point of p.points) {
        assert.ok(
          point.annee > derniereReelle,
          `prévision « ${p.id} » : l'année ${point.annee} est déjà observée (dernière réelle : ${derniereReelle})`,
        )
      }
    }
  })

  it('encadre chaque valeur par ses bornes', () => {
    for (const p of previsions) {
      for (const point of p.points) {
        if (point.basse == null && point.haute == null) continue
        assert.ok(
          point.basse <= point.valeur && point.valeur <= point.haute,
          `prévision « ${p.id} », ${point.annee} : ${point.basse} ≤ ${point.valeur} ≤ ${point.haute} est faux`,
        )
      }
    }
  })

  it('signale le jeu de démonstration comme tel', () => {
    /* LE TEST LE PLUS IMPORTANT DU FICHIER. Tant que l'équipe data n'a pas
       livré son modèle, les valeurs affichées sont fabriquées pour montrer
       le rendu. Si le champ `modele` cessait de dire « démonstration », le
       site les présenterait comme de vraies prévisions — sans que rien ne
       plante, et sans que personne ne s'en aperçoive. */
    const demonstration = previsions.filter((p) => {
      const m = String(p.modele ?? '').toLowerCase()
      return m === '' || m === 'démonstration' || m === 'demonstration'
    })
    if (previsions.length === 0) return
    assert.equal(
      demonstration.length,
      previsions.length,
      'une prévision porte un nom de modèle : si elle vient vraiment de l’équipe data, ' +
        'mettre ce test à jour ; sinon, remettre « démonstration » dans le champ `modele`',
    )
  })
})
