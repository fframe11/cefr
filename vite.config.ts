import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
  },
  // @ts-expect-error vitest config field
  test: {
    include: ['tests/**/*.test.ts']
  }
})
