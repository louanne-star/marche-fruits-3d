# Primeur 3D

Application web d'exploration interactive des fruits dans un marché en 3D.
Les données nutritionnelles viennent de l'API publique [Fruityvice](https://www.fruityvice.com/).

**Stack :** React (Vite) · Three.js · Netlify

## Lancer le projet

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:5173

## Structure

```
public/models/      Modèles 3D (.glb) des fruits et du décor
src/
  api/              Appels à l'API Fruityvice
  components/       Composants React (Scene, filtres, fiche fruit…)
  three/            Logique Three.js (scène, chargement des modèles, raycasting)
  data/             fruits.json (copie locale de l'API), correspondance fruits ↔ modèles,
                    disposition des fruits sur les étals (stalls.js)
```

## Données et CORS

L'API Fruityvice n'autorise pas les appels directs depuis un navigateur (pas d'en-têtes CORS).
Les requêtes passent donc par `/api` :

- en développement : proxy Vite (`vite.config.js`)
- en production : redirection Netlify (`netlify.toml`)

Si l'API ne répond pas, l'application utilise la copie locale `src/data/fruits.json`.

## Déploiement

Le site est déployé sur Netlify (build : `npm run build`, dossier publié : `dist`).
