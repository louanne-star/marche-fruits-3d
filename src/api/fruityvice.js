import localFruits from '../data/fruits.json'

/**
 * Récupère tous les fruits depuis l'API Fruityvice (via le proxy /api).
 * Si l'API est indisponible, on retombe sur la copie locale de src/data/fruits.json.
 */
export async function fetchFruits() {
  try {
    const res = await fetch('/api/fruit/all')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return { fruits: await res.json(), source: 'api' }
  } catch (err) {
    console.warn('API Fruityvice indisponible, données locales utilisées :', err)
    return { fruits: localFruits, source: 'local' }
  }
}
