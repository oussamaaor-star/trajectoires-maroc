/* ============================================================================
   contenuSecteurs.js — le CONTENU éditorial des pages secteur.
   Tout ce qui est du texte ou du choix de graphique est ici, séparé du code :
   pour changer un titre, une intro ou la série affichée, on ne touche qu'à
   ce fichier. Le titre d'un graphique est un CONSTAT, le sous-titre donne la
   mesure (unité + période).
   ============================================================================ */

/* Les 2 chapitres du gabarit de page secteur (ids = ancres du sommaire). */
export const CHAPITRES = [
  { id: 'vue-densemble', titre: "Vue d’ensemble" },
  { id: 'trajectoire', titre: 'Trajectoire' },
]

export const CONTENU_SECTEURS = {
  automobile: {
    introVue:
      "Les exportations de voitures de tourisme atteignent 59,1 milliards de dirhams en 2025, après un record de 68 milliards en 2024. Les produits manufacturés pèsent près de 83 % des exportations.",
    introTrajectoire:
      "Les données douanières remontent à 1998, quand le Maroc n’exportait pratiquement aucune voiture. Deux ouvertures d’usines jalonnent la période ; elles sont datées sous le graphique : Renault à Melloussa en 2012, PSA à Kénitra en 2019.",
    /* la série « phare » du secteur, affichée en grand + projetée sur 2 ans */
    trajectoire: {
      type: 'courbe',
      serieId: 'exports_voitures',
      projection: true,
      titre:
        'Les exportations de voitures sont passées de presque rien à 59 milliards de dirhams, après un record de 68 milliards en 2024',
      sousTitre: 'Milliards de dirhams courants — observé 1998–2025',
      etiquette: 'Voitures',
    },
  },

  ble: {
    introVue:
      'Une campagne sèche en 2024 : 3,21 millions de tonnes de céréales, en baisse de 43 % sur un an, pour un rendement de 1 240 kg par hectare.',
    introTrajectoire:
      'La récolte oscille entre 1,78 et 11,69 millions de tonnes d’une campagne à l’autre. Les barres permettent de comparer les campagnes une à une. On ne projette pas cette série : sa dispersion atteint 45,6 % de sa moyenne, et une série de cette nature n’a pas de tendance à prolonger.',
    trajectoire: {
      type: 'barres', // magnitude annuelle très volatile → barres, pas courbe
      serieId: 'prod_cereales',
      projection: false, // dispersion de 45,6 % de la moyenne, sans tendance
      titre: 'La production céréalière varie du simple au sextuple d’une campagne à l’autre',
      sousTitre: 'Millions de tonnes — observé 1990–2024',
    },
  },

  energie: {
    introVue:
      "Le Maroc a importé 93,6 % de l’énergie utilisée en 2023 ; sa dépendance énergétique reste supérieure à 90 % depuis 2009.",
    // « Deux ruptures L’ENTRETIENNENT » : c’était une cause affirmée, sur la
    // page même où la plateforme dit ne jamais en affirmer. Les deux faits sont
    // datés et vérifiables ; le lien entre eux et la courbe, lui, n’est démontré
    // par aucune donnée affichée ici. On juxtapose, comme partout ailleurs.
    introTrajectoire:
      "La dépendance énergétique reste très élevée. Elle dépasse même 100 % certaines années — 103,8 % en 2012 — parce qu’elle rapporte les importations NETTES à l’énergie utilisée : une année où le pays reconstitue ses stocks, il importe plus qu’il ne consomme. Deux ruptures sont datées sur la même période : la fermeture de la raffinerie Samir (2015) et celle du gazoduc Maghreb-Europe (2021).",
    trajectoire: {
      type: 'courbe',
      serieId: 'dependance_energetique',
      projection: false, // dernier relevé en 2023 : prolonger une série vieille de trois ans
      titre: "Le Maroc importe plus de 90 % de l’énergie qu’il consomme",
      sousTitre: "Importations nettes en % de l’énergie utilisée — observé 1990–2023",
      etiquette: 'Dépendance',
    },
  },
}

/* Série « phare » d'un secteur = celle de son graphique de trajectoire
   (sert aussi aux sparklines des cartes de l'accueil). */
export function idSeriePhare(idSecteur) {
  return CONTENU_SECTEURS[idSecteur].trajectoire.serieId
}
