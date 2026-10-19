import * as THREE from 'three'
import { loadModel, normalizeModel, enableShadows } from './loadModel'
import { FRUIT_MODELS, DECOR_MODELS } from '../data/fruitModels'
import { STALLS, TABLE_HEIGHT } from '../data/stalls'

const CRATE_SIZE = 0.15
// les plateaux ont déjà des petits légumes modélisés, on remonte les fruits
// pour passer au-dessus
const FRUIT_LIFT = 0.035
const QUAD_OFFSETS = [
  [-0.23, -0.2],
  [0.23, -0.2],
  [-0.23, 0.2],
  [0.23, 0.2],
]

// Pose chaque fruit dans une cagette sur son étal.
// Le nom API du fruit est gardé dans userData pour savoir lequel est cliqué
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
    // groupe à part pour pouvoir l'animer au survol sans bouger la cagette
    const fruitGroup = new THREE.Group()
    fruitGroup.position.y = FRUIT_LIFT
    offsets.forEach(([ox, oz], k) => {
      const copy = fruit.clone()
      copy.position.set(ox * CRATE_SIZE, 0, oz * CRATE_SIZE)
      copy.rotation.y = (i * 1.7 + k * 2.3) % (Math.PI * 2)
      fruitGroup.add(copy)
    })
    display.add(fruitGroup)
    display.userData.fruitGroup = fruitGroup

    enableShadows(display)
    scene.add(display)
    fruits.push(display)
  })

  return fruits
}
