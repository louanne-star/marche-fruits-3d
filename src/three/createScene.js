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

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  // Empêche de passer sous le sol
  controls.maxPolarAngle = Math.PI / 2.15

  const onResize = () => {
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(container.clientWidth, container.clientHeight)
  }
  const resizeObserver = new ResizeObserver(onResize)
  resizeObserver.observe(container)

  renderer.setAnimationLoop((time) => {
    updateSky(time)
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

  return { scene, camera, renderer, controls, dispose }
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
 * Cadre `box` en entier, vu de trois quarts face et légèrement en hauteur :
 * assez bas pour voir sous les auvents, assez haut pour voir tous les étals.
 */
export function fitCameraToBox(camera, controls, box) {
  const sphere = box.getBoundingSphere(new THREE.Sphere())

  // On prend le plus petit des deux champs de vision (vertical ou horizontal)
  // pour que la scène tienne aussi sur un écran en portrait.
  const fovV = THREE.MathUtils.degToRad(camera.fov)
  const fovH = 2 * Math.atan(Math.tan(fovV / 2) * camera.aspect)
  const distance = sphere.radius / Math.sin(Math.min(fovV, fovH) / 2)

  // On vise un peu au-dessus du centre : le marché descend dans le cadre
  // et laisse voir le ciel et les nuages
  const target = sphere.center.clone()
  target.y += sphere.radius * 0.25

  const direction = new THREE.Vector3(0.45, 0.4, 1).normalize()
  // La sphère englobante est large : on se rapproche un peu pour remplir l'écran
  camera.position.copy(target).addScaledVector(direction, distance * 0.8)
  camera.updateProjectionMatrix()

  controls.target.copy(target)
  controls.minDistance = sphere.radius * 0.4
  controls.maxDistance = distance * 1.5
  controls.update()
}
