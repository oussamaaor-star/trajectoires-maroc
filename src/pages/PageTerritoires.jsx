import { useEffect } from 'react'
import NavHaut from '../composants/NavHaut'
import PiedPage from '../composants/PiedPage'
import BarresRegions from '../composants/BarresRegions'
import valeursRegionales from '../data/valeurs-regionales.json'
import nomsRegions from '../data/regions-noms.json'

/* On prend le premier (et seul) indicateur régional disponible : la population
   légale par région (HCP, RGPH 2024). C'est une donnée réelle et vérifiable. */
const indicateur = valeursRegionales[0]

/* On croise les valeurs (par code MA-01…MA-12) avec les noms de régions, puis
   on trie de la plus peuplée à la moins peuplée : la barre la plus longue en
   haut, c'est ce qui se lit le mieux. */
const regions = Object.entries(nomsRegions)
  .map(([code, nom]) => ({ code, nom, valeur: indicateur.valeurs[code] ?? null }))
  .sort((a, b) => (b.valeur ?? 0) - (a.valeur ?? 0))

/* ============================================================================
   PageTerritoires — /territoires
   La dimension qui manquait aux pages secteur : le OÙ. Les trajectoires y sont
   NATIONALES, alors qu'une moyenne nationale cache de gros écarts entre régions.
   On l'illustre avec un indicateur simple et réel : la population par région.
   ============================================================================ */
function PageTerritoires() {
  useEffect(() => {
    document.title = 'Territoires — Trajectoires Maroc'
  }, [])

  return (
    <div>
      <NavHaut />

      <header className="hero">
        <div className="conteneur">
          <p className="hero__surtitre">Dimension territoriale</p>
          <h1>Territoires</h1>
          <p className="hero__description">
            Une moyenne nationale additionne des régions très différentes. Les 12
            régions du découpage de 2015 sont l’échelle à laquelle se décident les
            plans agricoles et industriels : c’est donc l’échelle à laquelle il
            faut aussi pouvoir lire les indicateurs.
          </p>
        </div>
      </header>

      <main className="conteneur" id="contenu" tabIndex={-1}>
        <section className="section-chapitre">
          <h2>
            <span className="section-chapitre__numero">01</span> Population par région
          </h2>
          <p className="section-chapitre__intro">
            Pour montrer la dimension territoriale sur des chiffres réels, on
            affiche ici la population légale de chaque région (recensement 2024).
            Chaque barre est proportionnelle à la population : Casablanca-Settat
            pèse à elle seule près d’un cinquième du pays. Les indicateurs
            économiques régionaux (rendement céréalier, emploi industriel,
            capacité électrique…) viendront s’afficher de la même façon dès leur
            collecte.
          </p>

          <BarresRegions indicateur={indicateur} regions={regions} />
        </section>
      </main>

      <PiedPage />
    </div>
  )
}

export default PageTerritoires
