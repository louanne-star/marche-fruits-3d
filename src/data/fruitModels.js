// Correspondance entre les fruits de l'API (nom anglais) et les modèles 3D de public/models/
export const FRUIT_MODELS = {
  Apple: { label: 'Pomme', model: '/models/pomme.glb' },
  Banana: { label: 'Banane', model: '/models/banane.glb' },
  Pineapple: { label: 'Ananas', model: '/models/ananas.glb' },
  Cherry: { label: 'Cerise', model: '/models/cerise.glb' },
  Lemon: { label: 'Citron', model: '/models/citron.glb' },
  Strawberry: { label: 'Fraise', model: '/models/fraise.glb' },
  Kiwi: { label: 'Kiwi', model: '/models/kiwi.glb' },
  Blueberry: { label: 'Myrtille', model: '/models/myrtille.glb' },
  Orange: { label: 'Orange', model: '/models/orange.glb' },
  Pomelo: { label: 'Pamplemousse', model: '/models/pamplemousse.glb' },
  Papaya: { label: 'Papaye', model: '/models/papaye.glb' },
  Watermelon: { label: 'Pastèque', model: '/models/pasteque.glb' },
  Grape: { label: 'Raisin', model: '/models/raisin.glb' },
  Tomato: { label: 'Tomate', model: '/models/tomate.glb' },
}

// Modèles de décor (pas liés à l'API)
export const DECOR_MODELS = {
  marche: '/models/marche.glb',
  stand: '/models/stand.glb',
  cagette: '/models/cagette.glb',
}
