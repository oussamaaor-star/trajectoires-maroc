/* ============================================================================
   formatage.js — mise en forme des nombres « à la française »
   Un seul endroit pour tout le formatage : si un chiffre s'affiche mal,
   c'est ici (et seulement ici) qu'on corrige.
   ============================================================================ */

/* Intl.NumberFormat est le formateur de nombres intégré au navigateur.
   En « fr-FR », il produit exactement ce qu'on veut :
   - espace pour les milliers  : 1240  → « 1 240 »
   - virgule pour les décimales : 6.39 → « 6,39 »
   On le crée UNE fois (c'est un objet un peu coûteux à construire). */
const formateurFrancais = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 2,
})

/* Deux décimales suffisent PARTOUT sauf pour les valeurs minuscules : les
   exportations de voitures valent 0,001 milliard de dirhams en 2001, que
   l'arrondi à deux décimales afficherait « 0 » — un zéro faux, qui laisse
   croire à une absence de donnée. Sous 0,01 on passe donc aux chiffres
   SIGNIFICATIFS : 0,001 reste « 0,001 », 0,007 reste « 0,007 ». */
const SEUIL_PETITE_VALEUR = 0.01
const formateurPetitesValeurs = new Intl.NumberFormat('fr-FR', {
  maximumSignificantDigits: 2,
})

/* Formate un nombre seul : formateNombre(1240) → « 1 240 ». */
export function formateNombre(valeur) {
  if (valeur !== 0 && Math.abs(valeur) < SEUIL_PETITE_VALEUR) {
    return formateurPetitesValeurs.format(valeur)
  }
  return formateurFrancais.format(valeur)
}

/* Abréviations des unités longues des fichiers de données.
   Convention : Md = milliards, M = millions (les valeurs des séries sont déjà
   exprimées dans ces ordres de grandeur, on abrège seulement le libellé). */
const UNITES_COURTES = {
  'milliards USD': 'Md USD',
  'millions de tonnes': 'Mt',
  "millions d'hectares": 'M ha',
  'kg par hectare': 'kg/ha',
  'kg équivalent pétrole': 'kgep',
  /* Commerce extérieur (Office des Changes) : les montants sont en dirhams,
     l'unité officielle des statistiques douanières marocaines. */
  'milliards DH': 'Md DH',
}

/* Version courte d'une unité : les unités en pourcentage deviennent « % »
   (le contexte est déjà donné par le libellé de l'indicateur). */
export function uniteCourte(unite) {
  if (UNITES_COURTES[unite]) return UNITES_COURTES[unite]
  if (unite.startsWith('%')) return '%'
  return unite
}

/* LES DEUX ESPACES INSÉCABLES QUI SÉPARENT UN NOMBRE DE SON UNITÉ.
   Ni l'une ni l'autre n'est une espace ordinaire, et c'est tout le sujet :
   une espace ordinaire AUTORISE LA COUPURE. Dans une colonne étroite,
   « +19 % » se scinde en fin de ligne et le « % » commence la suivante,
   orphelin de son nombre.

   Laquelle des deux, et pourquoi pas une seule :
   - ESPACE_FINE (U+202F) devant le SIGNE « % ». C'est la règle typographique
     française, et c'est déjà l'espace qu'Intl pose dans « 1 240 » pour les
     milliers : même chasse d'un bout à l'autre d'un même nombre. C'est aussi
     celle qu'écrivent le tableau de couverture (&#8239;) et les textes de
     contenuSecteurs.js — la page mélangeait les deux avant cette note.
   - ESPACE_MOT (U+00A0) devant une unité écrite en LETTRES (« Md DH »,
     « kg/ha », « Mt ») : une fine y collerait le mot au chiffre. Le français
     distingue le signe du mot ; on le suit.

   Réservées à l'AFFICHAGE : les exports CSV composent leurs cellules
   eux-mêmes, en ASCII, pour que les tableurs y lisent des nombres.
   Écrites en séquences d'échappement, jamais en caractères littéraux : une
   espace insécable posée telle quelle dans le code est indiscernable d'une
   espace ordinaire à la relecture. */
export const ESPACE_FINE = '\u202f'
export const ESPACE_MOT = '\u00a0'

/* L'espace qui convient à une unité DÉJÀ abrégée. Exportée parce que les
   cartes KPI ne peuvent pas appeler formate() : elles enveloppent l'unité
   dans un <small>, et doivent donc poser l'espace elles-mêmes. Sans elle,
   la même page écrivait « 93,6 % » (espace fine, via formate) et
   « 82,9 % » (espace ordinaire, dans la carte) à quelques centimètres. */
export function espaceUnite(uniteAbregee) {
  return uniteAbregee === '%' ? ESPACE_FINE : ESPACE_MOT
}

/* LA fonction de formatage : nombre français + unité abrégée.
   formate(6.39, 'milliards USD') → « 6,39 Md USD » (espace-mot insécable)
   formate(93.6, "% de l'énergie utilisée") → « 93,6 % » (espace fine) */
export function formate(valeur, unite) {
  const courte = uniteCourte(unite)
  return `${formateNombre(valeur)}${espaceUnite(courte)}${courte}`
}

/* Variation signée pour les cartes KPI : le « + » n'est pas ajouté par
   Intl, on le préfixe nous-mêmes. formateVariation(22.2) → « +22,2 ». */
export function formateVariation(variation) {
  return `${variation > 0 ? '+' : ''}${formateNombre(variation)}`
}
