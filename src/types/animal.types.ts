/**
 * Interfaces TypeScript para la entidad Animal.
 * Espejo de `PatitasCalchaquies.Core.Entities.Animal.cs`
 */

export interface AnimalDto {
  idAnimal: number;
  nombre: string;
  codigoIdentificacion: string;
  fechaIngreso: string;
  castrado: boolean;
  idEspecie: number; // 1: Canino, 2: Felino, 3: Otro
  idRaza?: number | null;
  razaNombre?: string;
  idSexo?: number | null; // 1: Macho, 2: Hembra
  idEstado?: number | null; // 1: Disponible, 2: En Tratamiento, 3: Adoptado, 4: En Tránsito
  estadoNombre?: string;
  fotoUrl?: string;
  observaciones?: string;
}

export interface AnimalCrearDto {
  nombre: string;
  codigoIdentificacion: string;
  fechaIngreso: string;
  castrado: boolean;
  idEspecie: number;
  idRaza?: number | null;
  idSexo?: number | null;
  idEstado?: number | null;
  fotoUrl?: string;
  observaciones?: string;
}

export interface AnimalActualizarDto extends AnimalCrearDto {
  idAnimal: number;
}

export const ESTADOS_ANIMAL = [
  { idEstado: 1, nombre: 'Disponible para Adopción', variant: 'success' as const },
  { idEstado: 2, nombre: 'En Tratamiento / Observación', variant: 'warning' as const },
  { idEstado: 3, nombre: 'Adoptado', variant: 'info' as const },
  { idEstado: 4, nombre: 'En Tránsito / Temporal', variant: 'neutral' as const },
];

export const SEXOS_ANIMAL = [
  { idSexo: 1, nombre: 'Macho' },
  { idSexo: 2, nombre: 'Hembra' },
];
