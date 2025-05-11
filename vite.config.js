// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: 'https://github.com/DylanJC13/Web2_Final.git', // Reemplaza con tu repo de GitHub
  plugins: [react()],
});
