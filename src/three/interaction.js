import * as THREE from 'three'

// Au-delà de ce déplacement (en pixels) entre l'appui et le relâchement,
// on considère que l'utilisateur fait tourner la caméra, pas qu'il clique.
const CLICK_TOLERANCE = 6
const HOVER_SCALE = 1.15
const HOVER_LIFT = 0.012
// Lueur chaude légère : assez visible sans délaver la couleur du fruit
const HOVER_GLOW = new THREE.Color(0.12, 0.09, 0.04)

/**
 * Survol et clic sur les présentoirs de fruits (raycasting).
 * - onHover(display | null, event) : appelé à chaque mouvement du pointeur sur la scène
 * - onSelect(display) : appelé au clic sur un fruit
 * Renvoie { update(delta), dispose() } : update anime la mise en valeur à chaque image.
 */
export function setupInteraction({ canvas, camera, displays, onHover, onSelect }) {
  const raycaster = new THREE.Raycaster()
  const pointer = new THREE.Vector2()
  let hovered = null
  let downPosition = null

  // Les fruits ont leurs propres matériaux (un modèle chargé par présentoir) :
  // on peut les faire briller sans toucher aux autres présentoirs.
  // On garde la couleur d'émission d'origine pour y revenir après le survol.
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
    // On remonte jusqu'au présentoir qui porte les infos du fruit
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
    // Pendant une rotation de caméra, on ne change pas la mise en valeur
    if (downPosition) return
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

  // Transition douce vers l'état survolé / normal
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
