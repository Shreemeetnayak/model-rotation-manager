import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    // Tauri expects that the dev server is running on this port
    port: 5173,
    strictPort: true
  },
  // Tauri uses a fixed port for the dev server, so we need to match it
  // We'll also set the base to './' for building
  base: './',
})