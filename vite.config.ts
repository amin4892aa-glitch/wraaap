import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
// @ts-expect-error shared Node store has no TS types
import { handleOrdersApi } from './server/ordersStore.mjs'

function ordersApiPlugin(): Plugin {
  return {
    name: 'wraaap-orders-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (handleOrdersApi(req, res)) return
        next()
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        if (handleOrdersApi(req, res)) return
        next()
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), ordersApiPlugin()],
  base: '/',
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    // large edit mp4s in public/sfx can EBUSY the Windows file watcher
    watch: {
      ignored: ['**/public/sfx/**', '**/data/**'],
    },
  },
})
