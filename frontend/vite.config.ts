import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listens on 0.0.0.0 and allows access via localhost, 127.0.0.1, and LAN IP
    port: 5173,
    strictPort: true,
  },
})
