/* ============================================================================
   convertir-csv.mjs — LE PONT ENTRE L'ÉQUIPE DATA ET LA PLATEFORME
   ----------------------------------------------------------------------------
   POURQUOI CET OUTIL EXISTE
   Le binôme data travaille avec des tableurs et produit des CSV. La plateforme,
   elle, lit du JSON. Sans outil au milieu, chaque livraison demanderait une
   recopie à la main : long, et surtout une occasion de se tromper à chaque
   fois. Le format d'échange a donc été arrêté AVANT la première livraison, et
   cet outil le met en œuvre — de sorte que ni l'affichage ni le modèle
   n'attende l'autre.

   USAGE
     npm run convertir                  (lit le dossier donnees-binome/)
     npm run convertir -- mon-dossier   (lit un autre dossier)

   FICHIERS LUS (séparateur « ; », encodage UTF-8) :
     predictions.csv  secteur;indicateur;annee;valeur_prevue;borne_basse;borne_haute;modele
     regions.csv      indicateur;region;annee;valeur;unite;source

   FICHIERS ÉCRITS dans src/data/ :
     predictions.json         ← predictions.csv  (courbe pointillée + bande)
     valeurs-regionales.json  ← regions.csv      (barres des 12 régions)

   DEUX PRINCIPES DE SÛRETÉ
   1. RIEN N'EST ÉCRIT TANT QU'UNE ERREUR SUBSISTE. On lit tout, on valide
      tout, et seulement ensuite on écrit. Un CSV à moitié faux ne peut donc
      pas remplacer des données correctes par un fichier vide.
   2. LES FICHIERS REMPLACÉS SONT SAUVEGARDÉS dans src/data/.sauvegarde/ —
      les données de démonstration ne sont jamais perdues.

   Aucune dépendance : le format est simple, une centaine de lignes suffisent
   et se relisent.
   ============================================================================ */
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..')
const DOSSIER_DONNEES = join(RACINE, 'src', 'data')
const DOSSIER_SAUVEGARDE = join(DOSSIER_DONNEES, '.sauvegarde')

/* `resolve` et non `join` : un chemin absolu passé en argument doit être
   utilisé tel quel, pas collé derrière la racine du projet. */
const dossierEntree = resolve(RACINE, process.argv[2] ?? 'donnees-binome')

/* Les codes des 12 régions sont lus dans le fichier de noms plutôt que
   recopiés ici : une seule source de vérité. */
const REGIONS = Object.keys(
  JSON.parse(readFileSync(join(DOSSIER_DONNEES, 'regions-noms.json'), 'utf8')),
)

const erreurs = []
const avertissements = []

/* --- Lecture d'un CSV -------------------------------------------------------
   Minimaliste mais tolérant : le BOM qu'ajoute Excel, les fins de ligne
   Windows, les lignes vides et les espaces superflus. */
function litCsv(chemin) {
  let texte = readFileSync(chemin, 'utf8')
  if (texte.charCodeAt(0) === 0xfeff) texte = texte.slice(1) // BOM d'Excel
  const lignes = texte.split(/\r?\n/).filter((l) => l.trim() !== '')
  if (lignes.length < 2) return { entetes: [], lignes: [] }

  const decoupe = (ligne) => ligne.split(';').map((c) => c.trim())
  const entetes = decoupe(lignes[0]).map((e) => e.toLowerCase())
  const donnees = lignes.slice(1).map((l) => {
    const champs = decoupe(l)
    const objet = {}
    entetes.forEach((e, i) => {
      objet[e] = champs[i] ?? ''
    })
    return objet
  })
  return { entetes, lignes: donnees }
}

function verifieColonnes(nomFichier, entetes, requises) {
  const manquantes = requises.filter((r) => !entetes.includes(r))
  if (manquantes.length) {
    erreurs.push(`${nomFichier} : colonne(s) manquante(s) → ${manquantes.join(', ')}`)
    return false
  }
  return true
}

/* Un nombre écrit à la française (« 12,5 ») ou à l'anglaise (« 12.5 »), avec
   ou sans espaces. Une cellule vide vaut null — un trou, pas un zéro. */
function nombre(valeur) {
  if (valeur == null || valeur === '') return null
  const n = Number(String(valeur).replace(/\s/g, '').replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

/* --- 1. predictions.csv → predictions.json --------------------------------- */
function convertitPredictions() {
  const chemin = join(dossierEntree, 'predictions.csv')
  if (!existsSync(chemin)) return null

  const { entetes, lignes } = litCsv(chemin)
  if (!verifieColonnes('predictions.csv', entetes, ['indicateur', 'annee', 'valeur_prevue'])) return null

  const parSerie = new Map()
  lignes.forEach((ligne, i) => {
    const id = ligne.indicateur.trim()
    const annee = nombre(ligne.annee)
    const prevue = nombre(ligne.valeur_prevue)
    if (!id || annee == null || prevue == null) {
      avertissements.push(`predictions.csv ligne ${i + 2} : ligne incomplète, ignorée`)
      return
    }
    if (!parSerie.has(id)) {
      parSerie.set(id, { id, modele: (ligne.modele ?? '').trim(), points: [] })
    }
    parSerie.get(id).points.push({
      annee,
      valeur: prevue,
      basse: nombre(ligne.borne_basse),
      haute: nombre(ligne.borne_haute),
    })
  })

  /* Le nom du modèle décide de l'avertissement affiché sous le graphique
     (voir utils/prevision.js). Un modèle vide laisse le bandeau
     « démonstration » : on le signale plutôt que de le laisser passer. */
  for (const p of parSerie.values()) {
    if (!p.modele) {
      avertissements.push(
        `predictions.csv : la série « ${p.id} » n'indique aucun modèle — la plateforme affichera l'avertissement « démonstration »`,
      )
    }
    p.points.sort((a, b) => a.annee - b.annee)
  }

  return [...parSerie.values()]
}

/* --- 2. regions.csv → valeurs-regionales.json ------------------------------ */
function convertitRegions() {
  const chemin = join(dossierEntree, 'regions.csv')
  if (!existsSync(chemin)) return null

  const { entetes, lignes } = litCsv(chemin)
  if (!verifieColonnes('regions.csv', entetes, ['indicateur', 'region', 'valeur'])) return null

  const parIndicateur = new Map()
  lignes.forEach((ligne, i) => {
    const nom = ligne.indicateur.trim()
    const region = ligne.region.trim().toUpperCase()
    if (!nom) return
    if (!REGIONS.includes(region)) {
      erreurs.push(
        `regions.csv ligne ${i + 2} : code de région inconnu « ${ligne.region} » (attendus : ${REGIONS.join(', ')})`,
      )
      return
    }
    if (!parIndicateur.has(nom)) {
      parIndicateur.set(nom, {
        id: nom.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
          .replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''),
        secteur: (ligne.secteur ?? '').trim(),
        nom,
        unite: (ligne.unite ?? '').trim(),
        annee: nombre(ligne.annee),
        source: (ligne.source ?? '').trim(),
        valeurs: {},
      })
    }
    const valeur = nombre(ligne.valeur)
    /* Une cellule vide laisse la région SANS donnée : la page Territoires
       ne lui dessine aucune barre et affiche « — » à la place de sa valeur.
       On ne comble jamais un trou par une estimation. */
    if (valeur == null) {
      avertissements.push(`regions.csv ligne ${i + 2} : valeur vide (${nom} / ${region}) — région laissée sans donnée`)
      return
    }
    parIndicateur.get(nom).valeurs[region] = valeur
  })

  for (const ind of parIndicateur.values()) {
    const remplies = Object.keys(ind.valeurs).length
    if (remplies < REGIONS.length) {
      avertissements.push(
        `indicateur régional « ${ind.nom} » : ${remplies}/${REGIONS.length} régions renseignées — les autres n'auront pas de barre, et leur valeur s'affichera « — »`,
      )
    }
  }
  return [...parIndicateur.values()]
}

/* --- Écriture, avec sauvegarde de l'ancien fichier -------------------------- */
function ecrit(nom, contenu) {
  const cible = join(DOSSIER_DONNEES, nom)
  if (existsSync(cible)) {
    if (!existsSync(DOSSIER_SAUVEGARDE)) mkdirSync(DOSSIER_SAUVEGARDE, { recursive: true })
    copyFileSync(cible, join(DOSSIER_SAUVEGARDE, nom))
  }
  writeFileSync(cible, `${JSON.stringify(contenu, null, 2)}\n`, 'utf8')
}

/* --- Le programme ---------------------------------------------------------- */
console.log('='.repeat(74))
console.log('CONVERSION DES DONNÉES DE L’ÉQUIPE DATA')
console.log(`Dossier lu : ${dossierEntree}`)
console.log('='.repeat(74))

if (!existsSync(dossierEntree)) {
  console.error(`\n❌ Dossier introuvable : ${dossierEntree}\n`)
  process.exit(1)
}
console.log(`Fichiers présents : ${readdirSync(dossierEntree).join(', ') || '(aucun)'}\n`)

const predictions = convertitPredictions()
const regions = convertitRegions()

if (!predictions && !regions) {
  erreurs.push('aucun fichier reconnu (attendus : predictions.csv, regions.csv)')
}

/* Rien n'a encore été écrit : en cas d'erreur, la plateforme reste intacte. */
if (erreurs.length) {
  console.error('❌ ERREURS — AUCUN fichier modifié, la plateforme continue de fonctionner.')
  erreurs.forEach((e) => console.error('   • ' + e))
  console.error('')
  process.exit(1)
}

if (predictions) ecrit('predictions.json', predictions)
if (regions) ecrit('valeurs-regionales.json', regions)

console.log('✅ CONVERSION RÉUSSIE\n')
if (predictions) {
  console.log(`predictions.json : ${predictions.length} série(s) prévue(s)`)
  predictions.forEach((p) =>
    console.log(`     ${p.id} — ${p.points.length} année(s), modèle « ${p.modele || 'non précisé'} »`),
  )
}
if (regions) {
  console.log(`valeurs-regionales.json : ${regions.length} indicateur(s) régional(aux)`)
}
if (avertissements.length) {
  console.log(`\n⚠️  ${avertissements.length} avertissement(s) — la conversion a réussi malgré tout :`)
  avertissements.forEach((a) => console.log('   • ' + a))
}
console.log('\nAnciens fichiers sauvegardés dans src/data/.sauvegarde/')
console.log('Étape suivante : npm run dev, puis vérifier l’affichage.\n')
