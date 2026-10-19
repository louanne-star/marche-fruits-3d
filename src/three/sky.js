import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { loadModel } from './loadModel'
import { DECOR_MODELS } from '../data/fruitModels'

export const SKY_TOP = '#3f8fdb'
export const SKY_HORIZON = '#c4e2f7'

const CLOUD_COUNT = 10
const CLOUD_SPEED = 0.01 // rad/s

// Ciel en dégradé + nuages qui tournent autour du marché.
// Les nuages sont chargés après, le ciel s'affiche direct
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
    // sinon le dessous des nuages est gris
    emissive: '#ffffff',
    emissiveIntensity: 0.45,
    fog: false, // le brouillard les faisait disparaître
  })

  geometry.computeBoundingBox()
  const size = geometry.boundingBox.getSize(new THREE.Vector3())
  const baseScale = 1 / Math.max(size.x, size.y, size.z)

  for (let i = 0; i < CLOUD_COUNT; i++) {
    const cloud = new THREE.Mesh(geometry, material)
    cloud.scale.setScalar(baseScale * (1.8 + Math.random() * 0.9))
    const angle = (i / CLOUD_COUNT) * Math.PI * 2 + Math.random() * 0.4
    const radius = 9 + Math.random() * 4
    cloud.position.set(Math.cos(angle) * radius, 1.3 + Math.random() * 1.3, Math.sin(angle) * radius)
    cloud.rotation.y = Math.random() * Math.PI * 2
    clouds.add(cloud)
  }
}

// nuage.glb contient 275 petits meshs, on fusionne tout en une géométrie
// (sinon 275 draw calls par nuage)
async function loadCloudGeometry() {
  const model = await loadModel(DECOR_MODELS.nuage)
  model.updateMatrixWorld(true)

  const parts = []
  model.traverse((child) => {
    if (!child.isMesh) return
    const part = child.geometry.clone().applyMatrix4(child.matrixWorld)
    // mergeGeometries veut les mêmes attributs partout
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
        float t = smoothstep(0.0, 0.45, vDirection.y);
        gl_FragColor = vec4(mix(horizon, top, t), 1.0);
        #include <colorspace_fragment>
      }
    `,
  })
  return new THREE.Mesh(new THREE.SphereGeometry(20, 32, 16), material)
}
