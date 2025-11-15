import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa' 

export default defineConfig({
  plugins: [
    react(),
    VitePWA({ 
      registerType: 'prompt',
      injectRegister: 'auto', 
      manifest: {
        name: 'Curiosity - Your Personal AI Journal',
        short_name: 'Curiosity',
        description: 'A personal journal to document questions, discoveries, and goals, enhanced with AI insights.',
        theme_color: '#14b8a6', 
        background_color: "#0f172a", 
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
           {
            src: '/icons/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any',
          },
        ],
      },
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'logo.svg', 'icons/*.png'], 
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'], 
        globIgnores: [
          '**/node_modules/**', 
          'sw.js', 
          'workbox-*.js'
        ],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: { cacheName: 'app-shell-cache', expiration: { maxEntries: 1, maxAgeSeconds: 60 * 60 * 24 }, networkTimeoutSeconds: 3 }
          },
          {
             urlPattern: ({ request }) => request.destination === 'script' || request.destination === 'style' || request.destination === 'worker',
             handler: 'CacheFirst',
             options: { cacheName: 'asset-cache', expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 } }
          },
           {
             urlPattern: ({ request }) => request.destination === 'image',
             handler: 'CacheFirst',
             options: { cacheName: 'image-cache', expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 7 } }
          }
        ]
      },
      devOptions: {
        enabled: false, // Disable PWA in development to avoid glob pattern warnings
        type: 'module', 
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React and core libraries
          'react-vendor': ['react', 'react-dom'],
          
          // UI libraries
          'ui-vendor': ['framer-motion', 'lucide-react', '@headlessui/react'],
          
          // Firebase
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage', 'firebase/analytics', 'firebase/performance', 'firebase/functions'],
          
          // Data processing
          'data-vendor': ['dexie', 'dexie-react-hooks', 'date-fns', 'nanoid'],
          
          // PDF and export libraries (loaded on demand)
          'pdf-vendor': ['jspdf', 'jspdf-autotable', 'html2canvas'],
          
          // Utility libraries
          'utils-vendor': ['clsx', 'tailwind-merge', 'crypto-js', 'bcrypt-ts', 'file-saver', 'jszip', 'react-markdown', 'react-simplemde-editor'],
          
          // PWA and service worker
          'pwa-vendor': ['workbox-window'],
        }
      }
    },
    // Increase chunk size warning limit since we're optimizing
    chunkSizeWarningLimit: 1000,
  },
})
