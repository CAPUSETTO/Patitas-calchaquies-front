/**
 * Configuración centralizada de variables de entorno.
 * 
 * TUTORÍA PARA DESARROLLADORES C#:
 * En .NET sueles leer la configuración desde `appsettings.json` inyectando `IConfiguration`.
 * En Vite (React) las variables de entorno para el navegador deben comenzar obligatoriamente con el prefijo `VITE_`.
 * Se acceden a través de `import.meta.env.VITE_NOMBRE_VARIABLE`.
 */
export const ENV = {
  /**
   * URL base de tu API Backend en C# ejecutándose en tu máquina o red local.
   * Por defecto apunta a localhost si no se especifica en un archivo `.env`.
   */
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  IS_PROD: import.meta.env.PROD,
  IS_DEV: import.meta.env.DEV,
} as const;
