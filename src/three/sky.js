import * as THREE from 'three'

export const SKY_TOP = '#3f8fdb'
export const SKY_HORIZON = '#c4e2f7'

const CLOUD_COUNT = 12
// Vitesse de rotation de la couronne de nuages (radians par seconde)
const CLOUD_SPEED = 0.01

/**
 * Ciel en dégradé + nuages low poly qui tournent lentement autour du marché.
 * `update(time)` est à appeler à chaque image (time en millisecondes).
 */
export function createSky() {
  const sky = new THREE.Group()
  sky.add(createDome())

  const clouds = new THREE.Group()
  const material = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    flatShading: true,
    roughness: 1,
    // Un peu d'émission pour que le dessous des nuages reste blanc et non gris
    emissive: '#ffffff',
    emissiveIntensity: 0.45,
    // Sinon le brouillard de la scène les efface
    fog: false,
  })
  for (let i = 0; i < CLOUD_COUNT; i++) {
    const cloud = createCloud(material)
    const angle = (i / CLOUD_COUNT) * Math.PI * 2 + Math.random() * 0.4
    // Loin et assez bas pour apparaître au-dessus de l'horizon dans la vue par défaut
    const radius = 9 + Math.random() * 4
    cloud.position.set(Math.cos(angle) * radius, 1.3 + Math.random() * 1.3, Math.sin(angle) * radius)
    cloud.rotation.y = -angle
    clouds.add(cloud)
  }
  sky.add(clouds)

  const update = (time) => {
    clouds.rotation.y = (time / 1000) * CLOUD_SPEED
  }

  return { sky, update }
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

/** Un nuage = quelques boules à facettes, aplaties et serrées. */
function createCloud(material) {
  const cloud = new THREE.Group()
  const puffs = 3 + Math.floor(Math.random() * 3)
  for (let i = 0; i < puffs; i++) {
    const size = 0.35 + Math.random() * 0.3
    const puff = new THREE.Mesh(new THREE.IcosahedronGeometry(size, 1), material)
    puff.position.set((i - (puffs - 1) / 2) * 0.45, Math.random() * 0.15, (Math.random() - 0.5) * 0.3)
    puff.scale.y = 0.7
    cloud.add(puff)
  }
  return cloud
}
