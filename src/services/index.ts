/**
 * src/services/index.ts
 * 
 * TUTORÍA PARA DESARROLLADORES C#:
 * Esta carpeta equivale a tus servicios de aplicación o clientes HTTP específicos de entidad
 * (por ejemplo, `IAnimalService` / `AnimalService`).
 * 
 * Regla arquitectónica:
 * Ningún componente de React (`src/components` o `src/pages`) debe importar Axios directamente.
 * Toda llamada asíncrona a la API debe estar encapsulada en una función de esta capa.
 */

export * from '../api/axiosClient';
