/**
 * Interfaces TypeScript para Adopciones y Solicitudes de Adopción.
 * Espejo de:
 * - `PatitasCalchaquies.Core.Entities.Adopcion.cs`
 * - `PatitasCalchaquies.Core.Entities.Solicitud_Adopcion.cs`
 */

export type EstadoSolicitudAdopcion = 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Concretada';

export interface SolicitudAdopcionDto {
  idSolicitudAdopcion: number;
  idPersona: number;
  personaNombre?: string;
  personaDni?: string;
  personaTelefono?: string;
  idAnimal: number;
  animalNombre?: string;
  animalCodigo?: string;
  fecha: string;
  estado: EstadoSolicitudAdopcion;
  observacion?: string | null;
  idAdopcion?: number | null;
}

export interface SolicitudAdopcionCrearDto {
  idPersona: number;
  idAnimal: number;
  observacion?: string;
}
