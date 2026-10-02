import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

const loader = new GLTFLoader()

/** Charge un fichier .glb et renvoie son objet racine. */
export async function loadModel(url) {
  const gltf = await loader.loadAsync(url)
  return gltf.scene
}

/** Active les ombres portées et reçues sur tous les maillages de `object`. */
export function enableShadows(object) {
  object.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })
}

/**
 * Les modèles n'ont pas tous la même échelle : on ramène la plus grande
 * dimension à `targetSize`, centré en x/z et posé sur y = 0.
 * Renvoie un Group qu'on peut ensuite positionner librement.
 */
export function normalizeModel(model, targetSize) {
  const box = new THREE.Box3().setFromObject(model)
  const size = box.getSize(new THREE.Vector3())
  const scale = targetSize / Math.max(size.x, size.y, size.z)

  const center = box.getCenter(new THREE.Vector3())
  const offset = new THREE.Vector3(center.x, box.min.y, center.z)
  model.position.sub(offset).multiplyScalar(scale)
  model.scale.multiplyScalar(scale)

  const group = new THREE.Group()
  group.add(model)
  return group
}
