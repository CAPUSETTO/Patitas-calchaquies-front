import axios, { AxiosError } from 'axios';
import { ENV } from '../config/env';

/**
 * Representa las distintas estructuras de error que devuelven los Controllers de tu API en C#:
 * 1. FluentValidation: `{ mensaje: "Error de validación", errores: ["..."] }` (o en PascalCase)
 * 2. Excepciones controladas: `{ message: "..." }`
 * 3. Validaciones de ruta/ID: `{ error: "..." }`
 * 4. No encontrado (404): `{ mensaje: "..." }`
 * 5. ProblemDetails estándar de ASP.NET Core: `{ title: "...", errors: { Campo: ["..."] } }`
 */
export interface BackendErrorPayload {
  message?: string;
  mensaje?: string;
  Mensaje?: string;
  error?: string;
  errores?: string[];
  Errores?: string[];
  title?: string;
  errors?: Record<string, string[]>;
}

/**
 * Instancia centralizada de Axios (Capa de Infraestructura HTTP).
 *
 * Equivalente a registrar un `HttpClient` tipado en el contenedor de DI de .NET (`Program.cs`).
 */
export const axiosClient = axios.create({
  baseURL: ENV.API_URL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Extrae un mensaje legible para el usuario a partir de cualquier error de red o respuesta HTTP de la API C#.
 * Usa `unknown` en lugar de `any` para mantener seguridad de tipos estricta en TypeScript.
 */
export function extractApiErrorMessage(
  err: unknown,
  fallbackMessage = 'No se pudo completar la operación con el servidor.'
): string {
  if (axios.isAxiosError(err)) {
    const axiosErr = err as AxiosError<BackendErrorPayload>;

    // Error de red (API apagada en Visual Studio / Rider o sin conexión Wi-Fi)
    if (!axiosErr.response) {
      return `Sin respuesta del servidor (puerto ${ENV.BACKEND_PORT}). Verifica que tu proyecto PatitasCalchaquies.API esté en ejecución.`;
    }

    const { status, data } = axiosErr.response;

    if (data && typeof data === 'object') {
      // 1. Lista de errores de FluentValidation (ej. PersonaCreateValidator)
      const fluentList = data.errores ?? data.Errores;
      if (Array.isArray(fluentList) && fluentList.length > 0) {
        return fluentList.join(' • ');
      }

      // 2. Diccionario de errores estándar de ASP.NET ModelState
      if (data.errors && typeof data.errors === 'object') {
        const flatErrors = Object.values(data.errors).flat();
        if (flatErrors.length > 0) {
          return flatErrors.join(' • ');
        }
      }

      // 3. Propiedades directas (`message`, `mensaje`, `Mensaje`, `error`, `title`)
      const directMsg = data.message || data.mensaje || data.Mensaje || data.error || data.title;
      if (typeof directMsg === 'string' && directMsg.trim().length > 0) {
        return directMsg;
      }
    }

    if (status === 404) {
      return 'El registro solicitado no fue encontrado en la base de datos (404).';
    }
    if (status === 409) {
      return 'Conflicto de datos: el registro ya existe en el sistema (409).';
    }
    if (status >= 500) {
      return 'Error interno en el servidor de la API C# (500). Revisa la conexión a MySQL y los procedimientos almacenados.';
    }
  }

  if (err instanceof Error && err.message) {
    return err.message;
  }

  return fallbackMessage;
}
