import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // This strictly forces all packages (like lucide-react) to use the exact same React instance
    dedupe: ['react', 'react-dom'],
  },
})