import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {  
              maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10 MB, to accommodate Babylon.js
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/storage\.googleapis\.com\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'tfjs-model-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      manifest: {
        name: 'SIH Safety Trainer',
        short_name: 'SafetyTrainer',
        start_url: '.',
        display: 'standalone',
        background_color: '#1a2a4a',
        theme_color: '#1a2a4a',
      },
    }),
  ],
  server: {
    allowedHosts: true,
  },
})