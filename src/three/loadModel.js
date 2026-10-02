import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'

const loader = new GLTFLoader()

/** Charge un fichier .glb et renvoie son objet racine. */
export async function loadModel(url) {
  const gltf = await loader.loadAsync(url)
  return gltf.scene
}
