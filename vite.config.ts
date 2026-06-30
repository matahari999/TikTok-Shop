import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons.svg'],
      devOptions: { enabled: true },
      manifest: {
        name: 'TikTok Shop VN - Quản lý lợi nhuận',
        short_name: 'TikTok Shop VN',
        description: 'Quản lý lợi nhuận sau khi trừ phí TikTok Shop 2026. Dành cho người bán hàng Việt Nam.',
        id: '/',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone'],
        orientation: 'portrait',
        lang: 'vi',
        theme_color: '#EE1D52',
        background_color: '#ffffff',
        categories: ['business', 'shopping', 'finance'],
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        prefer_related_applications: false,
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/[^/]+\.supabase\.co\/rest\/v1\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              expiration: { maxEntries: 50, maxAgeSeconds: 300 },
              networkTimeoutSeconds: 5,
            },
          },
          {
            urlPattern: /^https?:\/\/[^/]+\.supabase\.co\/auth\/v1\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-auth',
              expiration: { maxEntries: 20, maxAgeSeconds: 300 },
              networkTimeoutSeconds: 5,
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
  server: { port: 3333 },
})
