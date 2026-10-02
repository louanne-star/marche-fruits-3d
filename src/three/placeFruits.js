import * as THREE from 'three'
import { loadModel, normalizeModel, enableShadows } from './loadModel'
import { FRUIT_MODELS, DECOR_MODELS } from '../data/fruitModels'
import { STALLS, TABLE_HEIGHT } from '../data/stalls'

// Plus grande dimension d'une cagette (unités du marché)
const CRATE_SIZE = 0.15
// Les plateaux portent des petits tas de légumes modélisés : on surélève
// les fruits pour qu'ils passent au-dessus, cachés par les bords de la cagette.
const FRUIT_LIFT = 0.035
// Position des 4 exemplaires dans une cagette (fraction de CRATE_SIZE)
const QUAD_OFFSETS = [
  [-0.23, -0.2],
  [0.23, -0.2],
  [-0.23, 0.2],
  [0.23, 0.2],
]

/**
 * Charge les fruits et les pose dans des cagettes sur les étals du marché.
 * Chaque présentoir (cagette + fruits) garde le nom d'API du fruit dans userData,
 * ce qui servira à identifier le fruit cliqué.
 */
export async function placeFruits(scene) {
  const crate = normalizeModel(await loadModel(DECOR_MODELS.cagette), CRATE_SIZE)

  const displays = STALLS.flatMap((stall) =>
    stall.displays.map((display) => ({ ...display, stall: stall.name })),
  )
  const results = await Promise.allSettled(
    displays.map(({ fruit }) => loadModel(FRUIT_MODELS[fruit].model)),
  )

  const fruits = []
  results.forEach((result, i) => {
    const { fruit: name, x, z, stall } = displays[i]
    const { label, perCrate } = FRUIT_MODELS[name]
    if (result.status === 'rejected') {
      console.warn(`Modèle introuvable pour ${label}`, result.reason)
      return
    }

    const display = new THREE.Group()
    display.position.set(x, TABLE_HEIGHT, z)
    display.userData = { name, label, stall }
    display.add(crate.clone())

    const single = perCrate === 1
    const fruit = normalizeModel(result.value, CRATE_SIZE * (single ? 0.7 : 0.36))
    const offsets = single ? [[0, 0]] : QUAD_OFFSETS
    offsets.forEach(([ox, oz], k) => {
      const copy = fruit.clone()
      copy.position.set(ox * CRATE_SIZE, FRUIT_LIFT, oz * CRATE_SIZE)
      // Petite rotation différente pour chaque exemplaire, plus naturel
      copy.rotation.y = (i * 1.7 + k * 2.3) % (Math.PI * 2)
      display.add(copy)
    })

    enableShadows(display)
    scene.add(display)
    fruits.push(display)
  })

  return fruits
}
