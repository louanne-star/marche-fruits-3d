import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { createSky, SKY_HORIZON } from './sky'

/**
 * Crée la scène, la caméra, le rendu et les contrôles dans `container`.
 * Retourne la scène et une fonction `dispose` à appeler au démontage.
 */
export function createScene(container) {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(SKY_HORIZON)
  // Le brouillard prend la couleur de l'horizon : le bord du sol se fond dans le ciel
  scene.fog = new THREE.Fog(SKY_HORIZON, 4, 9)

  const { sky, update: updateSky } = createSky()
  scene.add(sky)

  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.01,
    50,
  )
  camera.position.set(1.2, 1, 2)

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  container.appendChild(renderer.domElement)

  addLights(scene)
  addGround(scene)

  // Rotation libre autour du marché, avec des limites pour rester dans la scène.
  // Les distances de zoom sont fixées dans fitCameraToBox, une fois la taille du marché connue.
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  // Ni vue de dessus à la verticale, ni passage sous le sol :
  // au plus bas, la caméra est presque à l'horizontale, à hauteur de la cible
  controls.minPolarAngle = Math.PI / 8
  controls.maxPolarAngle = Math.PI / 2 - 0.03
  // Pas de déplacement latéral : la caméra tourne toujours autour du marché
  controls.enablePan = false

  const onResize = () => {
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(container.clientWidth, container.clientHeight)
  }
  const resizeObserver = new ResizeObserver(onResize)
  resizeObserver.observe(container)

  // Fonctions appelées à chaque image (animations), ajoutées via onFrame
  const frameCallbacks = [updateSky]
  const onFrame = (callback) => frameCallbacks.push(callback)

  let previousTime = 0
  renderer.setAnimationLoop((time) => {
    const delta = Math.min((time - previousTime) / 1000, 0.1)
    previousTime = time
    frameCallbacks.forEach((callback) => callback(time, delta))
    controls.update()
    renderer.render(scene, camera)
  })

  const dispose = () => {
    renderer.setAnimationLoop(null)
    resizeObserver.disconnect()
    controls.dispose()
    renderer.dispose()
    renderer.domElement.remove()
  }

  return { scene, camera, renderer, controls, onFrame, dispose }
}

/**
 * Éclairage doux adapté aux modèles low poly :
 * une ambiance assez forte pour qu'aucune face ne soit noire,
 * et un soleil chaud de biais pour le volume et les ombres.
 */
function addLights(scene) {
  scene.add(new THREE.AmbientLight('#fff4e6', 1.4))

  const sun = new THREE.DirectionalLight('#fff1d6', 2.2)
  sun.position.set(1.5, 3, 2)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  // Zone couverte par les ombres : un peu plus grande que le marché (~2 unités)
  const extent = 1.4
  Object.assign(sun.shadow.camera, {
    left: -extent,
    right: extent,
    top: extent,
    bottom: -extent,
    near: 0.5,
    far: 8,
  })
  sun.shadow.bias = -0.0005
  sun.shadow.normalBias = 0.01
  sun.shadow.radius = 4
  scene.add(sun)
}

function addGround(scene) {
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(8, 64),
    new THREE.MeshStandardMaterial({ color: '#eadbc0', roughness: 1 }),
  )
  ground.rotation.x = -Math.PI / 2
  // Légèrement sous le marché, dont la base descend à y = -0,007
  ground.position.y = -0.008
  ground.receiveShadow = true
  scene.add(ground)
}

/**
 * Cadre `box` en entier, vu de trois quarts face et légèrement en hauteur,
 * avec le ciel visible au-dessus du marché.
 */
export function fitCameraToBox(camera, controls, box) {
  const sphere = box.getBoundingSphere(new THREE.Sphere())

  // On prend le plus petit des deux champs de vision (vertical ou horizontal)
  // pour que la scène tienne aussi sur un écran en portrait.
  const fovV = THREE.MathUtils.degToRad(camera.fov)
  const fovH = 2 * Math.atan(Math.tan(fovV / 2) * camera.aspect)
  const distance = sphere.radius / Math.sin(Math.min(fovV, fovH) / 2)

  // On vise à hauteur de visiteur (entre les plateaux et les auvents) :
  // en tournant au plus bas, la caméra passe sous les auvents, au niveau des fruits.
  const target = sphere.center.clone()
  target.y = box.min.y + (box.max.y - box.min.y) * 0.35

  // Vue peu plongeante : on voit le ciel et les nuages au-dessus du marché
  const direction = new THREE.Vector3(0.45, 0.32, 1).normalize()
  // La sphère englobante est large : on se rapproche un peu pour remplir l'écran
  camera.position.copy(target).addScaledVector(direction, distance * 0.8)
  camera.updateProjectionMatrix()

  controls.target.copy(target)
  controls.minDistance = sphere.radius * 0.3
  controls.maxDistance = distance * 1.5
  controls.update()
}
