# Primeur 3D

Un petit marché en 3D où on peut se balader entre les étals et cliquer sur les fruits
pour voir leur fiche (classification + valeurs nutritionnelles).
Les données viennent de l'API [Fruityvice](https://www.fruityvice.com/).

Fait avec React (Vite) et Three.js, déployé sur Netlify.

## Fonctionnalités

- Marché 3D avec ciel, nuages, herbe et ombres
- 14 fruits rangés dans des cagettes sur 4 étals : agrumes, fruits rouges, exotiques, verger & potager
- Rotation et zoom à la souris ou au doigt
- Survol d'un fruit : il grossit un peu et son nom s'affiche
- Clic : fiche avec famille, ordre, genre et valeurs pour 100 g (calories, sucres, glucides, protéines, lipides),
  avec une barre de comparaison par rapport au fruit le plus riche

## Lancer le projet

```bash
npm install
npm run dev
```

Puis aller sur http://localhost:5173

Autres commandes : `npm run build`, `npm run preview`, `npm run lint` (oxlint).

## Organisation

```
public/models/   modèles .glb (fruits, marché, stand, cagette, nuage)
src/
  api/           appel à Fruityvice
  components/    Scene (canvas 3D) et FicheFruit (la modale)
  three/         tout le code Three.js : scène, ciel, herbe, placement des fruits, survol/clic
  data/          fruits.json (copie de l'API), lien fruit -> modèle, position des cagettes
```

Pour ajouter un fruit : mettre le .glb dans `public/models/`, l'ajouter dans
`src/data/fruitModels.js` (avec son nom anglais de l'API) puis lui donner une place dans `src/data/stalls.js`.

## API et CORS

Fruityvice ne renvoie pas d'en-têtes CORS, donc on ne peut pas l'appeler directement depuis le navigateur.
Les requêtes passent par `/api` :

- en local : proxy Vite (`vite.config.js`)
- en prod : redirection Netlify (`netlify.toml`)

Si l'API est down, l'appli utilise `src/data/fruits.json` à la place.

## Déploiement

Netlify, commande de build `npm run build`, dossier `dist`.

## À faire

- filtres / recherche (par étal, famille, calories...)
- un écran de chargement pendant que les modèles arrivent
- compresser `nuage.glb` (4 Mo)
- placer le raisin vert (`raisin-vert.glb` n'est pas encore utilisé)
