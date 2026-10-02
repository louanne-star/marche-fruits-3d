import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { loadModel } from './loadModel'
import { DECOR_MODELS } from '../data/fruitModels'

export const SKY_TOP = '#3f8fdb'
export const SKY_HORIZON = '#c4e2f7'

const CLOUD_COUNT = 10
// Vitesse de rotation de la couronne de nuages (radians par seconde)
const CLOUD_SPEED = 0.01

/**
 * Ciel en dégradé + nuages (nuage.glb) qui tournent lentement autour du marché.
 * Les nuages se chargent en arrière-plan : le ciel s'affiche tout de suite.
 * `update(time)` est à appeler à chaque image (time en millisecondes).
 */
export function createSky() {
  const sky = new THREE.Group()
  sky.add(createDome())

  const clouds = new THREE.Group()
  sky.add(clouds)
  loadClouds(clouds).catch((err) => console.warn('Nuages non chargés :', err))

  const update = (time) => {
    clouds.rotation.y = (time / 1000) * CLOUD_SPEED
  }

  return { sky, update }
}

async function loadClouds(clouds) {
  const geometry = await loadCloudGeometry()
  const material = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: 1,
    // Un peu d'émission pour que le dessous des nuages reste blanc et non gris
    emissive: '#ffffff',
    emissiveIntensity: 0.45,
    // Sinon le brouillard de la scène les efface
    fog: false,
  })

  // Taille d'origine du modèle, pour le ramener à la taille voulue
  geometry.computeBoundingBox()
  const size = geometry.boundingBox.getSize(new THREE.Vector3())
  const baseScale = 1 / Math.max(size.x, size.y, size.z)

  for (let i = 0; i < CLOUD_COUNT; i++) {
    const cloud = new THREE.Mesh(geometry, material)
    cloud.scale.setScalar(baseScale * (1.8 + Math.random() * 0.9))
    const angle = (i / CLOUD_COUNT) * Math.PI * 2 + Math.random() * 0.4
    // Loin et assez bas pour apparaître au-dessus de l'horizon dans la vue par défaut
    const radius = 9 + Math.random() * 4
    cloud.position.set(Math.cos(angle) * radius, 1.3 + Math.random() * 1.3, Math.sin(angle) * radius)
    cloud.rotation.y = Math.random() * Math.PI * 2
    clouds.add(cloud)
  }
}

/**
 * nuage.glb est composé de 275 petits maillages : on les fusionne en une seule
 * géométrie centrée, sinon chaque nuage coûterait 275 appels de dessin par image.
 */
async function loadCloudGeometry() {
  const model = await loadModel(DECOR_MODELS.nuage)
  model.updateMatrixWorld(true)

  const parts = []
  model.traverse((child) => {
    if (!child.isMesh) return
    const part = child.geometry.clone().applyMatrix4(child.matrixWorld)
    // On ne garde que ce qui sert au rendu, pour que toutes les parties soient compatibles
    for (const name of Object.keys(part.attributes)) {
      if (name !== 'position' && name !== 'normal') part.deleteAttribute(name)
    }
    parts.push(part.index ? part.toNonIndexed() : part)
  })

  const geometry = mergeGeometries(parts)
  parts.forEach((part) => part.dispose())
  geometry.center()
  return geometry
}

/** Grande sphère vue de l'intérieur, colorée du bleu au pâle vers l'horizon. */
function createDome() {
  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      top: { value: new THREE.Color(SKY_TOP) },
      horizon: { value: new THREE.Color(SKY_HORIZON) },
    },
    vertexShader: /* glsl */ `
      varying vec3 vDirection;
      void main() {
        vDirection = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 top;
      uniform vec3 horizon;
      varying vec3 vDirection;
      void main() {
        // Transition douce à l'horizon, sans cassure
        float t = smoothstep(0.0, 0.45, vDirection.y);
        gl_FragColor = vec4(mix(horizon, top, t), 1.0);
        #include <colorspace_fragment>
      }
    `,
  })
  return new THREE.Mesh(new THREE.SphereGeometry(20, 32, 16), material)
}
