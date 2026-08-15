import { useEffect } from 'react'
import NavHaut from '../composants/NavHaut'
import PiedPage from '../composants/PiedPage'
import TableauQualite from '../composants/TableauQualite'
import { toutesLesSources, toutesLesSeries } from '../utils/donnees'

/* Page Sources : d'où viennent les chiffres, ce qu'ils couvrent, leurs
   limites — et ce qui n'est PAS encore livré.

   L'encart du haut était rédigé quand aucune donnée du binôme data n'était
   arrivée : il annonçait des « données d'exemple » qui seraient « remplacées
   par le dataset officiel ». Les séries douanières ont été livrées depuis, la
   phrase est devenue fausse. Elle est maintenant CALCULÉE à partir des séries
   elles-mêmes : le jour où une source s'ajoute, le décompte suit tout seul et
   personne n'a à se souvenir de venir corriger un paragraphe. */
function PageSources() {
  useEffect(() => {
    document.title = 'Sources des données — Trajectoires Maroc'
  }, [])

  /* Combien de séries par source, et sur quelle période. Rien d'écrit à la
     main : c'est le même principe que le tableau de couverture plus bas.

     Le regroupement part des SÉRIES, pas de la liste des sources. Les deux ne
     se recouvrent pas exactement : une fiche source peut décrire un fichier de
     collecte dont les séries portent le nom de l'organisme d'origine. Partir
     des fiches donnait un décompte muet pour la Banque Mondiale — donc un
     encart qui annonçait 26 séries et n'en attribuait que 12. */
  const parSource = Object.values(
    toutesLesSeries.reduce((groupes, serie) => {
      const nom = serie.source ?? 'Source non renseignée'
      const groupe = groupes[nom] ?? { nom, series: 0, debut: Infinity, fin: -Infinity }
      groupe.series += 1
      for (const point of serie.points) {
        if (point.annee < groupe.debut) groupe.debut = point.annee
        if (point.annee > groupe.fin) groupe.fin = point.annee
      }
      groupes[nom] = groupe
      return groupes
    }, {}),
  ).sort((a, b) => b.series - a.series)

  return (
    <div>
      <NavHaut />

      <header className="hero">
        <div className="conteneur">
          <p className="hero__surtitre">Transparence</p>
          <h1>Sources des données</h1>
          <p className="hero__description">
            Chaque chiffre de la plateforme est traçable : {toutesLesSources.length}{' '}
            sources publiques, leurs indicateurs couverts et leurs limites.
          </p>
        </div>
      </header>

      <main className="conteneur">
        {/* h2 et non h3 : après le h1 de la page, sauter directement au niveau 3
            casse le plan du document. Un lecteur d'écran qui navigue de titre en
            titre entend alors une sous-section sans section. */}
        <div className="encart-avertissement">
          <h2>Ce que contient cette version</h2>
          <p>
            Les {toutesLesSeries.length} séries affichées viennent toutes de
            sources publiques vérifiables. Aucune valeur n’est inventée et aucun
            trou n’est comblé : une année non publiée reste vide, sur le
            graphique comme dans le fichier. Le décompte série par série est
            plus bas sur cette page.
          </p>
          <p>
            {parSource.map((bloc, rang) => (
              <span key={bloc.nom}>
                {rang > 0 ? ' ; ' : ''}
                <strong>
                  {bloc.series} série{bloc.series > 1 ? 's' : ''}
                </strong>{' '}
                — {bloc.nom} (<span dir="ltr">{bloc.debut}–{bloc.fin}</span>)
              </span>
            ))}
            . Les séries douanières ont été transmises le 02/08/2026 par le
            binôme data du stage, sous forme d’un tableau croisé mensuel agrégé
            ici en totaux annuels ; l’année 2026, incomplète, en est exclue. La
            population par région, qui alimente la carte, vient du recensement
            2024 du HCP : c’est une donnée structurelle, et elle ne figure pas
            dans ce décompte de séries annuelles.
          </p>
          <p>
            <strong>Une exception, et elle est signalée partout où elle
            apparaît :</strong> les prévisions ne sortent d’aucun modèle. Ce
            sont des valeurs écrites à la main pour développer l’affichage, en
            attendant les modèles du binôme data. La plateforme l’annonce
            au-dessus du graphique concerné, dans la vue « Données » et dans
            l’export CSV — et l’avertissement disparaîtra de lui-même le jour
            où un vrai modèle sera livré.
          </p>
        </div>

        {/* Les fiches sont des h3 : il leur fallait donc un h2 au-dessus pour
            les rattacher à quelque chose. Il porte aussi le compte, qui suit le
            fichier de sources au lieu d'être écrit à la main. */}
        <h2 className="titre-section-sources">
          Les {toutesLesSources.length} sources déclarées
        </h2>

        {toutesLesSources.map((source) => (
          <article key={source.source} className="carte-source">
            <h3>{source.source}</h3>
            <p>
              <a href={source.url} target="_blank" rel="noreferrer">
                {source.url}
              </a>
            </p>
            <p>{source.description}</p>
            <p className="carte-source__badges">
              {source.indicateursCouverts.map((indicateur) => (
                <span key={indicateur} className="badge">
                  {indicateur}
                </span>
              ))}
            </p>
            <p>
              <strong>Limites :</strong> {source.limites}
            </p>
          </article>
        ))}

        {/* LE RELÉVÉ DES TROUS, juste après les fiches source.
            Sa place est ici : une page qui dit d'où viennent les chiffres
            doit aussi dire jusqu'où ils vont, et où ils s'arrêtent. */}
        <TableauQualite />

        <section className="section-chapitre">
          <h2>Ce qui reste à livrer</h2>
          <p className="section-chapitre__intro">
            Deux briques manquent encore, et la plateforme est déjà prête à les
            recevoir : les fichiers se déposent dans <code>donnees-binome/</code>,
            une commande les convertit, et <strong>aucune ligne de code n’est à
            modifier</strong>.
          </p>
          <p>
            <strong>Les prévisions</strong> —{' '}
            <code>predictions.csv</code>, colonnes <code>secteur ; indicateur ;
            annee ; valeur_prevue ; borne_basse ; borne_haute ; modele</code>.
            Les bornes sont facultatives : sans elles la courbe prévue s’affiche
            sans intervalle, plutôt qu’avec une incertitude fabriquée. Dès que
            la colonne <code>modele</code> porte un nom réel, l’avertissement
            « valeurs de démonstration » cède la place à une mention discrète
            indiquant le modèle utilisé.
          </p>
          <p>
            <strong>Les indicateurs économiques régionaux</strong> —{' '}
            <code>regions.csv</code>, colonnes <code>indicateur ; secteur ;
            region ; annee ; valeur ; unite ; source</code>, avec les codes
            officiels <code>MA-01</code> à <code>MA-12</code>. La carte affiche
            aujourd’hui la population du recensement 2024 : une donnée
            structurelle, pas économique, choisie parce qu’elle est réelle et
            vérifiable. Une cellule vide reste vide — la région s’affiche
            hachurée plutôt que remplie par une estimation.
          </p>
          <p className="mention-prevision">
            La conversion refuse d’écrire quoi que ce soit tant qu’une erreur
            subsiste dans un fichier, et les données remplacées sont
            sauvegardées avant d’être écrasées. Le format exact, avec un exemple
            de chaque fichier, est décrit dans{' '}
            <code>donnees-binome/LISEZMOI.md</code>.
          </p>
        </section>
      </main>

      <PiedPage />
    </div>
  )
}

export default PageSources
