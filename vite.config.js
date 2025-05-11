// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/Web_Final/', // Reemplaza con tu repo de GitHub
  plugins: [react()],
});
