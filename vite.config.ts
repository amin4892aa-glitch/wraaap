import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative paths so the build works from Dropbox / local folder
  base: './',
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    // large edit mp4s in public/sfx can EBUSY the Windows file watcher
    watch: {
      ignored: ['**/public/sfx/**'],
    },
  },
})
