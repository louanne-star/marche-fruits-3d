import * as THREE from 'three'

// en px : au-delà c'est une rotation de caméra, pas un clic
const CLICK_TOLERANCE = 6
const HOVER_SCALE = 1.15
const HOVER_LIFT = 0.012
const HOVER_GLOW = new THREE.Color(0.12, 0.09, 0.04)

// Survol + clic sur les présentoirs (raycasting)
export function setupInteraction({ canvas, camera, displays, onHover, onSelect }) {
  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  let hovered = null
  let downPosition = null

  // chaque présentoir a ses propres matériaux, on peut changer l'emissive sans
  // toucher aux autres. On garde la valeur d'origine pour revenir après le survol
  displays.forEach((display) => {
    const data = display.userData
    data.highlight = 0
    data.baseY = data.fruitGroup.position.y
    data.materials = new Map()
    data.fruitGroup.traverse((child) => {
      if (!child.isMesh) return
      for (const material of [].concat(child.material)) {
        if (material.emissive && !data.materials.has(material)) {
          data.materials.set(material, material.emissive.clone())
        }
      }
    })
  })

  function pick(event) {
    const rect = canvas.getBoundingClientRect()
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
    raycaster.setFromCamera(pointer, camera)

    const hit = raycaster.intersectObjects(displays, true)[0]
    if (!hit) return null
    let object = hit.object
    while (object && !displays.includes(object)) object = object.parent
    return object
  }

  function setHovered(display, event) {
    hovered = display
    canvas.style.cursor = display ? 'pointer' : ''
    onHover(display, event)
  }

  const onPointerMove = (event) => {
    if (downPosition) return // en train de tourner
    setHovered(pick(event), event)
  }
  const onPointerDown = (event) => {
    downPosition = { x: event.clientX, y: event.clientY }
  }
  const onPointerUp = (event) => {
    if (!downPosition) return
    const moved = Math.hypot(event.clientX - downPosition.x, event.clientY - downPosition.y)
    downPosition = null
    if (moved > CLICK_TOLERANCE) return
    const display = pick(event)
    if (display) onSelect(display)
  }
  const onPointerLeave = (event) => {
    downPosition = null
    setHovered(null, event)
  }

  canvas.addEventListener('pointermove', onPointerMove)
  canvas.addEventListener('pointerdown', onPointerDown)
  canvas.addEventListener('pointerup', onPointerUp)
  canvas.addEventListener('pointerleave', onPointerLeave)

  // appelé à chaque frame pour l'animation du survol
  const update = (delta) => {
    for (const display of displays) {
      const target = display === hovered ? 1 : 0
      const data = display.userData
      if (data.highlight === target) continue

      const step = delta * 8
      data.highlight = target > data.highlight
        ? Math.min(target, data.highlight + step)
        : Math.max(target, data.highlight - step)

      const t = data.highlight
      data.fruitGroup.scale.setScalar(1 + (HOVER_SCALE - 1) * t)
      data.fruitGroup.position.y = data.baseY + HOVER_LIFT * t
      for (const [material, baseEmissive] of data.materials) {
        material.emissive.copy(baseEmissive).lerp(HOVER_GLOW, t)
      }
    }
  }

  const dispose = () => {
    canvas.removeEventListener('pointermove', onPointerMove)
    canvas.removeEventListener('pointerdown', onPointerDown)
    canvas.removeEventListener('pointerup', onPointerUp)
    canvas.removeEventListener('pointerleave', onPointerLeave)
    canvas.style.cursor = ''
  }

  return { update, dispose }
}
