import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { createSky, SKY_HORIZON } from './sky'
import { GRASS_COLOR } from './grass'

export function createScene(container) {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(SKY_HORIZON)
  // même couleur que l'horizon pour que le bord du sol disparaisse
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

  // le zoom min/max est réglé dans fitCameraToBox
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.minPolarAngle = Math.PI / 8
  controls.maxPolarAngle = Math.PI / 2 - 0.03 // pour ne pas passer sous le sol
  controls.enablePan = false

  const onResize = () => {
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(container.clientWidth, container.clientHeight)
  }
  const resizeObserver = new ResizeObserver(onResize)
  resizeObserver.observe(container)

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

function addLights(scene) {
  // ambiance assez forte sinon les faces à l'ombre sont noires (low poly)
  scene.add(new THREE.AmbientLight('#fff4e6', 1.4))

  const sun = new THREE.DirectionalLight('#fff1d6', 2.2)
  sun.position.set(1.5, 3, 2)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  // le marché fait environ 2 unités
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
    new THREE.MeshStandardMaterial({ color: GRASS_COLOR, roughness: 1 }),
  )
  ground.rotation.x = -Math.PI / 2
  // juste sous le marché (-0.007) et la terre battue (-0.009)
  ground.position.y = -0.012
  ground.receiveShadow = true
  scene.add(ground)
}

// Place la caméra pour voir toute la box, de trois quarts et un peu en hauteur
export function fitCameraToBox(camera, controls, box) {
  const sphere = box.getBoundingSphere(new THREE.Sphere())

  // on prend le plus petit fov pour que ça marche aussi en portrait
  const fovV = THREE.MathUtils.degToRad(camera.fov)
  const fovH = 2 * Math.atan(Math.tan(fovV / 2) * camera.aspect)
  const distance = sphere.radius / Math.sin(Math.min(fovV, fovH) / 2)

  // cible à hauteur des fruits, pas au centre de la box
  const target = sphere.center.clone()
  target.y = box.min.y + (box.max.y - box.min.y) * 0.35

  const direction = new THREE.Vector3(0.45, 0.32, 1).normalize()
  camera.position.copy(target).addScaledVector(direction, distance * 0.8)
  camera.updateProjectionMatrix()

  controls.target.copy(target)
  controls.minDistance = sphere.radius * 0.3
  controls.maxDistance = distance * 1.5
  controls.update()
}
