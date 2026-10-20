/**
 * src/types/index.ts
 * 
 * TUTORÍA PARA DESARROLLADORES C#:
 * Esta carpeta equivale a tu proyecto "Core" en .NET (Entidades del Dominio y DTOs).
 * Aquí definiremos interfaces estrictas para cada modelo que retorne tu API (sin uso de `any`),
 * por ejemplo: `AnimalDto`, `CreateAnimalRequest`, `AdopcionDto`, etc.
 */

// Tipos comunes para respuestas de operaciones o errores
export interface ApiErrorResponse {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}
