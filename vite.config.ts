import fs from 'node:fs';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const UPLOAD_DIR_NAME = 'imagenes-animales';

/**
 * Plugin local para guardar las fotos seleccionadas de los animales en la carpeta
 * `/imagenes-animales` en la raíz del proyecto y servirlas como archivos estáticos,
 * permitiendo que la base de datos MySQL guarde únicamente la ruta relativa
 * (ej. `/imagenes-animales/CAN-2026-001.jpg`).
 */
function patitasLocalImageStorage(): Plugin {
  const rootUploadDir = path.resolve(process.cwd(), UPLOAD_DIR_NAME);

  const ensureUploadDir = () => {
    if (!fs.existsSync(rootUploadDir)) {
      fs.mkdirSync(rootUploadDir, { recursive: true });
    }
  };

  const attachMiddlewares = (
    middlewares: {
      use: (fn: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void;
    }
  ) => {
    ensureUploadDir();

    middlewares.use((req, res, next) => {
      const url = req.url ? req.url.split('?')[0] : '';

      // 1. Endpoint para guardar la imagen recortada/ajustada en la carpeta raíz `/imagenes-animales`
      if (req.method === 'POST' && url === '/__local-upload') {
        let body = '';
        req.on('data', (chunk: Buffer) => {
          body += chunk.toString();
        });
        req.on('end', () => {
          try {
            ensureUploadDir();
            const parsed = JSON.parse(body) as {
              fileName?: string;
              dataUrl?: string;
            };

            if (!parsed.dataUrl || !parsed.dataUrl.startsWith('data:image/')) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Formato de imagen inválido.' }));
              return;
            }

            const base64Match = parsed.dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
            if (!base64Match) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'No se pudo procesar la imagen.' }));
              return;
            }

            const rawName = (parsed.fileName || `animal-${Date.now()}`)
              .toLowerCase()
              .replace(/[^a-z0-9-_]/g, '-')
              .replace(/-+/g, '-')
              .replace(/^-|-$/g, '');

            const finalFileName = `${rawName || 'animal'}.jpg`;
            const filePath = path.join(rootUploadDir, finalFileName);
            const buffer = Buffer.from(base64Match[2], 'base64');

            fs.writeFileSync(filePath, buffer);

            const rutaRelativa = `/${UPLOAD_DIR_NAME}/${finalFileName}`;
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ruta: rutaRelativa }));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(
              JSON.stringify({
                error: err instanceof Error ? err.message : 'Error al guardar la imagen en disco.',
              })
            );
          }
        });
        return;
      }

      // 2. Servir imágenes desde la carpeta `/imagenes-animales` en la raíz del proyecto
      if (req.method === 'GET' && url.startsWith(`/${UPLOAD_DIR_NAME}/`)) {
        const requestedFile = decodeURIComponent(url.slice(`/${UPLOAD_DIR_NAME}/`.length));
        const safeFileName = path.basename(requestedFile);
        const fullPath = path.join(rootUploadDir, safeFileName);

        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
          const ext = path.extname(fullPath).toLowerCase();
          const mimeType =
            ext === '.png'
              ? 'image/png'
              : ext === '.webp'
              ? 'image/webp'
              : 'image/jpeg';

          res.statusCode = 200;
          res.setHeader('Content-Type', mimeType);
          res.setHeader('Cache-Control', 'no-cache');
          fs.createReadStream(fullPath).pipe(res);
          return;
        }
      }

      next();
    });
  };

  return {
    name: 'patitas-local-image-storage',
    configureServer(server) {
      attachMiddlewares(server.middlewares);
    },
    configurePreviewServer(server) {
      attachMiddlewares(server.middlewares);
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), patitasLocalImageStorage()],
  server: {
    host: true, // Expone el servidor en 0.0.0.0 para acceso desde teléfono en red local Wi-Fi
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5227',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    host: true,
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5227',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
