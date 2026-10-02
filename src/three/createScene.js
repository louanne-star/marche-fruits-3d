import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

/**
 * Crée la scène, la caméra, le rendu et les contrôles dans `container`.
 * Retourne la scène et une fonction `dispose` à appeler au démontage.
 */
export function createScene(container) {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#fdf6ec')

  const camera = new THREE.PerspectiveCamera(
    50,
    container.clientWidth / container.clientHeight,
    0.1,
    100,
  )
  camera.position.set(4, 3, 6)

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(container.clientWidth, container.clientHeight)
  container.appendChild(renderer.domElement)

  scene.add(new THREE.HemisphereLight('#ffffff', '#c9a37a', 1.5))
  const sun = new THREE.DirectionalLight('#ffffff', 2)
  sun.position.set(5, 8, 4)
  scene.add(sun)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  const onResize = () => {
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(container.clientWidth, container.clientHeight)
  }
  const resizeObserver = new ResizeObserver(onResize)
  resizeObserver.observe(container)

  renderer.setAnimationLoop(() => {
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
