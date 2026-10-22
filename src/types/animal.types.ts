/**
 * Interfaces TypeScript para el ecosistema de Animales, Alojamiento, Ingreso y Nutrición.
 * Espejo directo de las clases en `PatitasCalchaquies.Core.Entities`:
 * - Animal.cs
 * - Ingreso_Animal.cs (IngresoAnimal)
 * - Predio.cs, Sector.cs y Alojamiento_Animal.cs (AlojamientoAnimal)
 * - PlanAlimentacion.cs
 * - Esterilizacion.cs y Veterinario.cs
 */

export interface PredioDto {
  idPredio: number;
  nombre: string;
  direccion?: string | null;
  descripcion?: string | null;
}

export interface SectorDto {
  idSector: number;
  nombre: string;
  capacidad: number;
  descripcion?: string | null;
  idPredio: number;
  predioNombre: string;
}

export interface IngresoAnimalDto {
  idIngresoAnimal: number;
  idAnimal: number;
  fecha: string;
  motivo: string;
  tipoIngreso: string;
  lugarOrigen?: string | null;
  observacion?: string | null;
}

export interface AlojamientoAnimalDto {
  idAlojamiento: number;
  idAnimal: number;
  idSector: number;
  sectorNombre: string;
  predioNombre: string;
  fechaIngreso: string;
  fechaSalida?: string | null;
  observacion?: string | null;
}

export interface PlanAlimentacionDto {
  idPlan: number;
  idAnimal: number;
  tipoAlimento: string;
  cantidad: number; // en gramos por toma
  frecuencia: string;
  observacion?: string | null;
  fechaDesde: string;
  fechaHasta?: string | null;
}

export interface EsterilizacionDto {
  idEsterilizacion: number;
  idAnimal: number;
  idVeterinario: number;
  veterinarioNombre: string;
  veterinarioMatricula: string;
  fecha: string;
  tipo: string;
  observacion?: string | null;
}

export interface VeterinarioDto {
  idVeterinario: number;
  matricula: string;
  nombre: string;
  apellido: string;
  telefono: string;
}

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
  // Sub-expedientes vinculados en PatitasCalchaquies.Core.Entities
  ingreso?: IngresoAnimalDto;
  alojamiento?: AlojamientoAnimalDto;
  planAlimentacion?: PlanAlimentacionDto;
  esterilizacion?: EsterilizacionDto;
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
