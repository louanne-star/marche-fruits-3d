import localFruits from '../data/fruits.json'

// Passe par /api (proxy), et si l'API ne répond pas on prend fruits.json
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
