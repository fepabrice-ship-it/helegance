import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true, // Autorise ngrok et les autres tunnels
    host: true,        // Permet l'accès sur le réseau local
  }
})
