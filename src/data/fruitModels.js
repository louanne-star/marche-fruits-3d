// Correspondance entre les fruits de l'API (nom anglais) et les modèles 3D de public/models/
// perCrate : nombre d'exemplaires posés dans la cagette (1 pour les gros fruits, 4 sinon)
export const FRUIT_MODELS = {
  Apple: { label: 'Pomme', model: '/models/pomme.glb', perCrate: 4 },
  Banana: { label: 'Banane', model: '/models/banane.glb', perCrate: 1 },
  Pineapple: { label: 'Ananas', model: '/models/ananas.glb', perCrate: 1 },
  Cherry: { label: 'Cerise', model: '/models/cerise.glb', perCrate: 4 },
  Lemon: { label: 'Citron', model: '/models/citron.glb', perCrate: 4 },
  Strawberry: { label: 'Fraise', model: '/models/fraise.glb', perCrate: 4 },
  Kiwi: { label: 'Kiwi', model: '/models/kiwi.glb', perCrate: 4 },
  Blueberry: { label: 'Myrtille', model: '/models/myrtille.glb', perCrate: 4 },
  Orange: { label: 'Orange', model: '/models/orange.glb', perCrate: 4 },
  Pomelo: { label: 'Pamplemousse', model: '/models/pamplemousse.glb', perCrate: 4 },
  Papaya: { label: 'Papaye', model: '/models/papaye.glb', perCrate: 1 },
  Watermelon: { label: 'Pastèque', model: '/models/pasteque.glb', perCrate: 1 },
  Grape: { label: 'Raisin', model: '/models/raisin.glb', perCrate: 1 },
  Tomato: { label: 'Tomate', model: '/models/tomate.glb', perCrate: 4 },
}

// Modèles de décor (pas liés à l'API)
export const DECOR_MODELS = {
  marche: '/models/marche.glb',
  stand: '/models/stand.glb',
  cagette: '/models/cagette.glb',
  nuage: '/models/nuage.glb',
}
