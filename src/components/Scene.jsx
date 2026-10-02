import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { createScene, fitCameraToBox } from '../three/createScene'
import { loadModel, enableShadows } from '../three/loadModel'
import { placeFruits } from '../three/placeFruits'
import { setupInteraction } from '../three/interaction'
import { DECOR_MODELS } from '../data/fruitModels'

/**
 * Scène 3D du marché. `onSelectFruit(name)` reçoit le nom d'API du fruit cliqué.
 */
export default function Scene({ onSelectFruit }) {
  const containerRef = useRef(null)
  // La scène n'est créée qu'une fois : on passe par une ref pour toujours
  // appeler la dernière version du callback
  const onSelectRef = useRef(onSelectFruit)
  const [tooltip, setTooltip] = useState(null)

  useEffect(() => {
    onSelectRef.current = onSelectFruit
  }, [onSelectFruit])

  useEffect(() => {
    const container = containerRef.current
    const { scene, camera, renderer, controls, onFrame, dispose } = createScene(container)
    let cancelled = false
    let interaction = null

    async function build() {
      // Le marché est chargé sans transformation : les positions de data/stalls.js en dépendent
      const market = await loadModel(DECOR_MODELS.marche)
      if (cancelled) return
      enableShadows(market)
      scene.add(market)

      const displays = await placeFruits(scene)
      if (cancelled) return

      const sceneBox = new THREE.Box3().setFromObject(market)
      displays.forEach((display) => sceneBox.expandByObject(display))
      fitCameraToBox(camera, controls, sceneBox)

      interaction = setupInteraction({
        canvas: renderer.domElement,
        camera,
        displays,
        onHover: (display, event) => {
          if (!display || event.pointerType === 'touch') {
            setTooltip(null)
            return
          }
          const rect = container.getBoundingClientRect()
          setTooltip({
            label: display.userData.label,
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
          })
        },
        onSelect: (display) => {
          setTooltip(null)
          onSelectRef.current?.(display.userData.name)
        },
      })
      onFrame((time, delta) => interaction.update(delta))
    }
    build()

    return () => {
      cancelled = true
      interaction?.dispose()
      dispose()
    }
  }, [])

  return (
    <div ref={containerRef} className="scene">
      {tooltip && (
        <div className="scene-tooltip" style={{ left: tooltip.x, top: tooltip.y }}>
          {tooltip.label}
        </div>
      )}
    </div>
  )
}
