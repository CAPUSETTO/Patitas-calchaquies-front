import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // Expone el servidor en 0.0.0.0 para acceso desde el teléfono en red local Wi-Fi
    port: 5173,
    strictPort: true,
  },
});
