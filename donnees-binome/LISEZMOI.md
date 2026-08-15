# Dossier de dépôt des données de l'équipe data

Déposer ici les fichiers CSV, puis lancer depuis la racine du projet :

```bash
npm run convertir
```

## Fichiers attendus

| Fichier | Colonnes |
|---|---|
| `predictions.csv` | `secteur;indicateur;annee;valeur_prevue;borne_basse;borne_haute;modele` |
| `regions.csv` | `indicateur;secteur;region;annee;valeur;unite;source` |

Les deux sont facultatifs et indépendants : livrer l'un sans l'autre fonctionne.

## Les exemples

`exemple-predictions.csv` et `exemple-regions.csv` montrent le format exact.
Ils portent volontairement un autre nom que les fichiers attendus, pour que
`npm run convertir` ne les prenne pas pour une vraie livraison.

## Deux points qui comptent

- **La colonne `modele`** doit porter le nom réel du modèle. Vide ou
  « démonstration », la plateforme affiche un avertissement disant que les
  valeurs ne sortent d'aucun modèle statistique.
- **Une cellule de valeur vide est acceptée** : la région reste sans donnée et
  s'affiche hachurée sur la carte. Ne jamais combler un trou par une
  estimation.

## Sécurité

Rien n'est écrit tant qu'une erreur subsiste, et les fichiers remplacés sont
copiés dans `src/data/.sauvegarde/`.
