import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { createScene, fitCameraToBox } from '../three/createScene'
import { loadModel, enableShadows } from '../three/loadModel'
import { placeFruits } from '../three/placeFruits'
import { DECOR_MODELS } from '../data/fruitModels'

export default function Scene() {
  const containerRef = useRef(null)

  useEffect(() => {
    const { scene, camera, controls, dispose } = createScene(containerRef.current)
    let cancelled = false

    async function build() {
      // Le marché est chargé sans transformation : les positions de data/stalls.js en dépendent
      const market = await loadModel(DECOR_MODELS.marche)
      if (cancelled) return
      enableShadows(market)
      scene.add(market)

      const fruits = await placeFruits(scene)
      if (cancelled) return

      const sceneBox = new THREE.Box3().setFromObject(market)
      fruits.forEach((fruit) => sceneBox.expandByObject(fruit))
      fitCameraToBox(camera, controls, sceneBox)
    }
    build()

    return () => {
      cancelled = true
      dispose()
    }
  }, [])

  return <div ref={containerRef} className="scene" />
}
