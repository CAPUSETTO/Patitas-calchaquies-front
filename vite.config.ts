import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // Expone el servidor en 0.0.0.0 para acceso desde teléfono Android en red local Wi-Fi
    port: 5173,
    strictPort: true,
    proxy: {
      // Redirige las peticiones /api hacia tu backend C# (.NET) en el puerto 5227.
      // Ventaja clave: Tu celular Android se conecta a la IP de tu PC en el puerto 5173
      // y Vite hace de puente hacia localhost:5227 evitando bloqueos de CORS y Firewall.
      '/api': {
        target: 'http://localhost:5227',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
