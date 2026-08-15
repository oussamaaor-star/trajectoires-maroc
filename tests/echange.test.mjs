/* ============================================================================
   echange.test.mjs — protège le FORMAT D'ÉCHANGE avec l'équipe data
   ----------------------------------------------------------------------------
   Le dossier donnees-binome/ contient deux fichiers d'exemple qui montrent au
   binôme le format attendu. Ils ne sont pas décoratifs : c'est le contrat.

   POURQUOI CE TEST
   Le jour où quelqu'un ajoute une colonne au convertisseur sans mettre
   l'exemple à jour, le binôme livre un fichier conforme à l'exemple… et
   refusé par l'outil. L'erreur ne se verrait qu'au moment de la livraison,
   c'est-à-dire au pire moment. Ce test compare les deux, à chaque exécution.

   Il vérifie aussi que les exemples ne s'appellent PAS comme les fichiers
   attendus : sinon `npm run convertir` les prendrait pour une vraie livraison
   et écraserait les données du site.
   ============================================================================ */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..')
const DOSSIER = join(RACINE, 'donnees-binome')
const CONVERTISSEUR = readFileSync(join(RACINE, 'outils', 'convertir-csv.mjs'), 'utf8')

/* Les colonnes que le convertisseur EXIGE réellement, lues dans son code
   plutôt que recopiées ici : une seule source de vérité. */
function colonnesRequises(nomFichier) {
  const motif = new RegExp(`verifieColonnes\\('${nomFichier}', entetes, \\[([^\\]]*)\\]`)
  const trouve = CONVERTISSEUR.match(motif)
  if (!trouve) return []
  return trouve[1].split(',').map((c) => c.trim().replace(/['"]/g, '')).filter(Boolean)
}

function entetesDe(fichier) {
  const chemin = join(DOSSIER, fichier)
  if (!existsSync(chemin)) return null
  let texte = readFileSync(chemin, 'utf8')
  if (texte.charCodeAt(0) === 0xfeff) texte = texte.slice(1)
  return texte.split(/\r?\n/)[0].split(';').map((c) => c.trim().toLowerCase())
}

describe('Format d’échange avec l’équipe data', () => {
  it('le dossier de dépôt existe, avec sa notice', () => {
    assert.ok(existsSync(DOSSIER), 'le dossier donnees-binome/ doit exister')
    assert.ok(existsSync(join(DOSSIER, 'LISEZMOI.md')), 'la notice LISEZMOI.md doit accompagner les exemples')
  })

  it('les exemples ne portent pas le nom des fichiers attendus', () => {
    /* Sinon `npm run convertir` les convertirait comme une vraie livraison et
       remplacerait les données du site par des valeurs d'exemple. */
    const fichiers = readdirSync(DOSSIER)
    for (const piege of ['predictions.csv', 'regions.csv']) {
      assert.ok(
        !fichiers.includes(piege),
        `« ${piege} » traîne dans donnees-binome/ : il serait pris pour une livraison réelle`,
      )
    }
  })

  for (const [exemple, attendu] of [
    ['exemple-predictions.csv', 'predictions.csv'],
    ['exemple-regions.csv', 'regions.csv'],
  ]) {
    it(`${exemple} porte toutes les colonnes exigées par le convertisseur`, () => {
      const entetes = entetesDe(exemple)
      assert.ok(entetes, `${exemple} est introuvable`)
      const requises = colonnesRequises(attendu)
      assert.ok(requises.length > 0, `aucune colonne requise trouvée pour ${attendu} dans le convertisseur`)
      for (const colonne of requises) {
        assert.ok(
          entetes.includes(colonne),
          `${exemple} : colonne « ${colonne} » absente, alors que le convertisseur l'exige`,
        )
      }
    })
  }

  it('l’exemple de prévisions montre un vrai nom de modèle', () => {
    /* L'exemple doit montrer ce qu'on ATTEND, pas ce qu'on a par défaut : un
       binôme qui recopie l'exemple ne doit pas livrer « démonstration ». */
    const chemin = join(DOSSIER, 'exemple-predictions.csv')
    const texte = readFileSync(chemin, 'utf8')
    assert.ok(
      !/d[ée]monstration/i.test(texte),
      'l’exemple ne doit pas suggérer « démonstration » dans la colonne modele',
    )
  })
})
