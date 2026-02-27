import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    // Ensure reference links resolve to emitted files, not data: URLs.
    assetsInlineLimit: 0
  }
});
