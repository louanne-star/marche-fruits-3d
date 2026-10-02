// Disposition des fruits sur les étals de marche.glb.
// Les coordonnées (x, z) sont celles du modèle du marché, chargé sans transformation.
// Elles ont été relevées à partir de la géométrie des plateaux des étals.

// Hauteur des plateaux des étals
export const TABLE_HEIGHT = 0.16

export const STALLS = [
  {
    name: 'Agrumes',
    // Étal de devant (auvent rouge)
    displays: [
      { fruit: 'Orange', x: 0.2, z: 0.71 },
      { fruit: 'Lemon', x: 0.45, z: 0.71 },
      { fruit: 'Pomelo', x: 0.7, z: 0.71 },
    ],
  },
  {
    name: 'Fruits rouges',
    // Étal du fond à gauche
    displays: [
      { fruit: 'Strawberry', x: -0.65, z: -0.55 },
      { fruit: 'Cherry', x: -0.38, z: -0.55 },
      { fruit: 'Blueberry', x: -0.65, z: -0.76 },
      { fruit: 'Grape', x: -0.38, z: -0.76 },
    ],
  },
  {
    name: 'Exotiques',
    // Étal du fond à droite
    displays: [
      { fruit: 'Pineapple', x: 0.38, z: -0.4 },
      { fruit: 'Banana', x: 0.68, z: -0.4 },
      { fruit: 'Papaya', x: 0.38, z: -0.72 },
      { fruit: 'Kiwi', x: 0.68, z: -0.72 },
    ],
  },
  {
    name: 'Verger & potager',
    // Étal de gauche
    displays: [
      { fruit: 'Apple', x: -0.62, z: 0.02 },
      { fruit: 'Watermelon', x: -0.62, z: 0.2 },
      { fruit: 'Tomato', x: -0.62, z: 0.38 },
    ],
  },
]
