// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/Clima_tempo/', // 👈 nome exato do repositório
  plugins: [react()],
})
