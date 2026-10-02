import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Fruityvice n'envoie pas d'en-têtes CORS : on passe par un proxy en dev.
    // En production, c'est la redirection de netlify.toml qui prend le relais.
    proxy: {
      '/api': {
        target: 'https://www.fruityvice.com',
        changeOrigin: true,
      },
    },
  },
})
