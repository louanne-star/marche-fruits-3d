import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

export const GRASS_COLOR = '#86b552'
const DIRT_COLOR = '#d2b98c'
const TUFT_COLORS = ['#6fa83f', '#7fb548', '#93c456', '#a3cc5f']

/**
 * Place du marché en terre battue entourée d'herbe.
 * `center` et `radius` décrivent la zone occupée par le marché (pas de touffes dedans).
 */
export function createGrass({ center, radius, count = 6000, outerRadius = 4.5 }) {
  const group = new THREE.Group()
  group.add(createDirtPatch(center, radius))

  const tufts = new THREE.InstancedMesh(
    createTuftGeometry(),
    new THREE.MeshStandardMaterial({ roughness: 1, flatShading: true }),
    count,
  )
  tufts.receiveShadow = true

  const matrix = new THREE.Matrix4()
  const position = new THREE.Vector3()
  const rotation = new THREE.Quaternion()
  const scale = new THREE.Vector3()
  const up = new THREE.Vector3(0, 1, 0)
  const color = new THREE.Color()

  // Les touffes commencent un peu après le bord de la place, avec un bord irrégulier
  const innerRadius = radius * 1.02
  for (let i = 0; i < count; i++) {
    // Répartition uniforme sur l'anneau (sqrt pour ne pas tasser au centre)
    const r = Math.sqrt(
      innerRadius ** 2 + Math.random() * (outerRadius ** 2 - innerRadius ** 2),
    )
    const angle = Math.random() * Math.PI * 2
    position.set(center.x + Math.cos(angle) * r, 0, center.z + Math.sin(angle) * r)
    rotation.setFromAxisAngle(up, Math.random() * Math.PI * 2)
    const size = 0.7 + Math.random() * 0.7
    scale.set(size, size * (0.8 + Math.random() * 0.5), size)
    tufts.setMatrixAt(i, matrix.compose(position, rotation, scale))
    tufts.setColorAt(i, color.set(TUFT_COLORS[i % TUFT_COLORS.length]))
  }
  group.add(tufts)

  return group
}

/** Une touffe = 3 brins fins et pointus, inclinés dans des directions différentes. */
function createTuftGeometry() {
  const blades = [0, 1, 2].map((i) => {
    const height = 0.045 + i * 0.01
    const blade = new THREE.ConeGeometry(0.007, height, 3, 1, true)
    blade.translate(0, height / 2, 0)
    blade.rotateZ(0.25 * (i - 1))
    blade.rotateY((i * Math.PI * 2) / 3)
    blade.translate(Math.cos(i * 2.1) * 0.008, 0, Math.sin(i * 2.1) * 0.008)
    return blade
  })
  const geometry = mergeGeometries(blades)
  blades.forEach((blade) => blade.dispose())
  return geometry
}

/** Disque de terre aux bords irréguliers sous le marché. */
function createDirtPatch(center, radius) {
  const segments = 28
  const shape = new THREE.Shape()
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2
    const r = radius * (1 + (i % segments === 0 ? 0 : (Math.random() - 0.5) * 0.12))
    const x = Math.cos(angle) * r
    const y = Math.sin(angle) * r
    if (i === 0) shape.moveTo(x, y)
    else shape.lineTo(x, y)
  }

  const patch = new THREE.Mesh(
    new THREE.ShapeGeometry(shape),
    new THREE.MeshStandardMaterial({
      color: DIRT_COLOR,
      roughness: 1,
      // Évite le scintillement avec le sol juste en dessous
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    }),
  )
  patch.rotation.x = -Math.PI / 2
  patch.position.set(center.x, -0.009, center.z)
  patch.receiveShadow = true
  return patch
}
