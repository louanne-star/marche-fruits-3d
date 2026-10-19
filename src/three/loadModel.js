import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

const loader = new GLTFLoader()

export async function loadModel(url) {
  const gltf = await loader.loadAsync(url)
  return gltf.scene
}

export function enableShadows(object) {
  object.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })
}

// Les modèles n'ont pas la même échelle : on met la plus grande dimension
// à targetSize, centré en x/z et posé sur y = 0
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
