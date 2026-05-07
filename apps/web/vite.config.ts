import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*'],
      manifest: {
        name: 'B-Routes',
        short_name: 'B-Routes',
        description: '池亀ボルダーのエリア・岩・ルートを地図とトポで閲覧',
        theme_color: '#0f766e',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/data/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'b-routes-data',
              expiration: { maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 * 7 },
              networkTimeoutSeconds: 5
            }
          },
          {
            urlPattern: ({ url }) =>
              url.pathname.startsWith('/images/') ||
              /\.(png|jpe?g|webp|svg)$/i.test(url.pathname),
            handler: 'CacheFirst',
            options: {
              cacheName: 'b-routes-images',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          },
          {
            urlPattern: ({ url }) =>
              url.hostname.endsWith('.tile.openstreetmap.org'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'b-routes-tiles',
              expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 14 }
            }
          }
        ]
      },
      devOptions: { enabled: false }
    })
  ],
  server: {
    host: true,
    port: 5173
  },
  build: {
    target: 'es2022',
    sourcemap: true
  }
})
