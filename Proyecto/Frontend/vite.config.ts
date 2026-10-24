import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import fs from 'node:fs'

export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync('./frontend.key'),
      cert: fs.readFileSync('./frontend.crt'),
    },
    host: 'localhost',
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true, // fuerza a detectar cuando se guardan archivos
      interval: 100, // revisa cambios cada 100 ms
    }
  }
})
