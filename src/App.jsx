import { useEffect, useState } from 'react'
import Scene from './components/Scene'
import FicheFruit from './components/FicheFruit'
import { fetchFruits } from './api/fruityvice'

function App() {
  const [fruits, setFruits] = useState([])
  const [source, setSource] = useState(null)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    fetchFruits().then(({ fruits, source }) => {
      setFruits(fruits)
      setSource(source)
    })
  }, [])

  return (
    <main className="app">
      <header className="app-header">
        <h1>Primeur 3D</h1>
        <p>
          {source
            ? `${fruits.length} fruits chargés (${source === 'api' ? 'API Fruityvice' : 'données locales'}) · cliquez sur un fruit`
            : 'Chargement des fruits…'}
        </p>
      </header>
      <Scene onSelectFruit={setSelected} />
      {selected && source && (
        <FicheFruit name={selected} fruits={fruits} onClose={() => setSelected(null)} />
      )}
    </main>
  )
}

export default App
