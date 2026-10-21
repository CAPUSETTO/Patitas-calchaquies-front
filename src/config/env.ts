/**
 * Configuración centralizada de variables de entorno.
 *
 * TUTORÍA PARA DESARROLLADORES C#:
 * En .NET lees configuraciones desde `appsettings.json` mediante `IConfiguration`.
 * En Vite, las variables expuestas al navegador llevan el prefijo `VITE_` y se leen con `import.meta.env`.
 *
 * Por defecto `API_URL` es `''` (cadena vacía) para que las peticiones a `/api/...` pasen por el
 * proxy de Vite (`vite.config.ts` -> `http://localhost:5227`). Así puedes usar la app desde tu
 * teléfono Android por Wi-Fi sin sufrir bloqueos de CORS ni tener que abrir el puerto 5227 en el firewall.
 * Si defines `VITE_API_URL` en un archivo `.env`, Axios usará esa URL explícita.
 */
export const ENV = {
  API_URL: import.meta.env.VITE_API_URL || '',
  BACKEND_PORT: 5227,
  IS_PROD: import.meta.env.PROD,
  IS_DEV: import.meta.env.DEV,
} as const;
