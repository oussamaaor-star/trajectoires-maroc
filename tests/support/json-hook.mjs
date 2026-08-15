/* ============================================================================
   json-hook.mjs — permet à Node d'importer les modules du projet tels quels
   ----------------------------------------------------------------------------
   POURQUOI CE FICHIER EXISTE
   src/utils/donnees.js écrit  `import series from '../data/series.json'`.
   Vite (le serveur de dév et le build) sait résoudre cet import tout seul.
   Node, lui, exige depuis la v18 une « import attribute » explicite :
       import series from '../data/series.json' with { type: 'json' }

   Plutôt que de modifier le code de l'application juste pour faire plaisir aux
   tests (mauvaise pratique : on ne déforme pas le code testé), on ajoute cet
   attribut À LA VOLÉE, au moment où Node résout l'import. Le code de src/
   reste donc EXACTEMENT celui qui part en production.

   Branché via  node --import ./tests/support/json-hook.mjs  (voir package.json).
   ============================================================================ */
import { register } from 'node:module'

register('./json-resolve.mjs', import.meta.url)
