import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import pkg from './package.json'

// Caminho base no GitHub Pages: https://<usuario>.github.io/clue-app/
const BASE = '/clue-app/'

// Carimbo de build (data/hora) — injetado no app para confirmar atualizações.
const BUILD_TIME = new Date()
  .toISOString()
  .slice(0, 16)
  .replace('T', ' ')

export default defineConfig({
  base: BASE,
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_TIME__: JSON.stringify(BUILD_TIME),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Registramos o service worker manualmente em main.tsx para controlar
      // a recarga automática e a checagem de atualização ao reabrir o app.
      injectRegister: false,
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Detetive — Marcador de Pistas',
        short_name: 'Detetive',
        description:
          'Marcador e dedutor automático para Clue / Detetive (modos Mansão e Praia).',
        theme_color: '#1e293b',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        start_url: BASE,
        scope: BASE,
        lang: 'pt-BR',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // Garante que a nova versão assuma e limpe caches antigos sem ficar presa.
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
  },
})
