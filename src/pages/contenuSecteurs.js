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
      "L’automobile est devenue le premier poste d’exportation du pays : 59,1 milliards de dirhams de voitures exportées en 2025, après un record de 68 milliards en 2024, et près de 83 % d’exportations manufacturées.",
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
      'La récolte oscille entre 1,78 et 11,69 millions de tonnes d’une campagne à l’autre. Les barres permettent de comparer les campagnes une à une. On ne projette pas cette série : sa dispersion atteint la moitié de sa moyenne, et une série de cette nature n’a pas de tendance à prolonger.',
    trajectoire: {
      type: 'barres', // magnitude annuelle très volatile → barres, pas courbe
      serieId: 'prod_cereales',
      projection: false, // dispersion égale à la moitié de la moyenne : aucune tendance à prolonger
      titre: 'La production céréalière varie du simple au sextuple d’une campagne à l’autre',
      sousTitre: 'Millions de tonnes — observé 1990–2024',
    },
  },

  energie: {
    introVue:
      "Le Maroc a importé 93,6 % de l’énergie utilisée en 2023 ; sa dépendance énergétique reste supérieure à 90 % depuis 2009.",
    introTrajectoire:
      "La dépendance énergétique reste très élevée. Deux ruptures l’entretiennent : la fermeture de la raffinerie Samir (2015) et celle du gazoduc Maghreb-Europe (2021).",
    trajectoire: {
      type: 'courbe',
      serieId: 'dependance_energetique',
      projection: true,
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
