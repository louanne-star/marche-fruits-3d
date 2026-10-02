import { useEffect, useRef } from 'react'
import { createScene } from '../three/createScene'
import { loadModel } from '../three/loadModel'
import { DECOR_MODELS } from '../data/fruitModels'

export default function Scene() {
  const containerRef = useRef(null)

  useEffect(() => {
    const { scene, dispose } = createScene(containerRef.current)
    let cancelled = false

    loadModel(DECOR_MODELS.marche).then((model) => {
      if (!cancelled) scene.add(model)
    })

    return () => {
      cancelled = true
      dispose()
    }
  }, [])

  return <div ref={containerRef} className="scene" />
}
