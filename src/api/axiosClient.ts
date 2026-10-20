import axios from 'axios';
import { ENV } from '../config/env';

/**
 * Instancia centralizada de Axios (Capa de Infraestructura HTTP).
 * 
 * TUTORÍA PARA DESARROLLADORES C#:
 * En .NET sueles registrar un `HttpClient` tipado mediante `services.AddHttpClient(...)`.
 * Aquí creamos una instancia singleton `axiosClient` preconfigurada con:
 * - `baseURL`: la URL base de tu API (ej. `http://localhost:5000` o `http://192.168.1.50:5000`).
 * - `timeout`: 10 segundos para no bloquear la app indefinidamente si la red local fluctúa.
 * - `headers`: cabeceras estándar JSON.
 * 
 * En la Fase 2 incorporaremos interceptores de respuesta para formatear errores unificados.
 */
export const axiosClient = axios.create({
  baseURL: ENV.API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});
