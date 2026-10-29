import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base relativa para que funcione en GitHub Pages bajo /gastos-compartidos/
export default defineConfig({
  plugins: [react()],
  base: './',
})
