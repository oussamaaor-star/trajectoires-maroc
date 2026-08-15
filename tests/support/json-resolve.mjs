/* ============================================================================
   json-resolve.mjs — le « hook » de résolution proprement dit
   Tourne dans le thread des loaders de Node. Une seule règle : quand l'import
   aboutit à un fichier .json, on ajoute l'attribut { type: 'json' } que Node
   réclame depuis la v18. Tout le reste passe sans être touché.
   ============================================================================ */

export async function resolve(specifier, context, nextResolve) {
  const resultat = await nextResolve(specifier, context)
  if (resultat.url.endsWith('.json')) {
    return { ...resultat, format: 'json', importAttributes: { type: 'json' } }
  }
  return resultat
}
