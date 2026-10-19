// Positions (x, z) des cagettes, relevées sur les plateaux dans marche.glb
export const TABLE_HEIGHT = 0.16

export const STALLS = [
  {
    name: 'Agrumes',
    // devant, auvent rouge
    displays: [
      { fruit: 'Orange', x: 0.2, z: 0.71 },
      { fruit: 'Lemon', x: 0.45, z: 0.71 },
      { fruit: 'Pomelo', x: 0.7, z: 0.71 },
    ],
  },
  {
    name: 'Fruits rouges',
    // fond gauche
    displays: [
      { fruit: 'Strawberry', x: -0.65, z: -0.55 },
      { fruit: 'Cherry', x: -0.38, z: -0.55 },
      { fruit: 'Blueberry', x: -0.65, z: -0.76 },
      { fruit: 'Grape', x: -0.38, z: -0.76 },
    ],
  },
  {
    name: 'Exotiques',
    // fond droite
    displays: [
      { fruit: 'Pineapple', x: 0.38, z: -0.4 },
      { fruit: 'Banana', x: 0.68, z: -0.4 },
      { fruit: 'Papaya', x: 0.38, z: -0.72 },
      { fruit: 'Kiwi', x: 0.68, z: -0.72 },
    ],
  },
  {
    name: 'Verger & potager',
    // gauche
    displays: [
      { fruit: 'Apple', x: -0.62, z: 0.02 },
      { fruit: 'Watermelon', x: -0.62, z: 0.2 },
      { fruit: 'Tomato', x: -0.62, z: 0.38 },
    ],
  },
]
