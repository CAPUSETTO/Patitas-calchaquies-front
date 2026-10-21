/**
 * Interfaces TypeScript para la entidad Persona.
 * Espejo exacto de:
 * - `PatitasCalchaquies.Core.Entities.Persona`
 * - `PatitasCalchaquies.API.DTOs.PersonaDto`
 * - `PatitasCalchaquies.API.DTOs.PersonaCrearDto`
 * - `PatitasCalchaquies.API.DTOs.PersonaActualizarDto`
 *
 * Nota técnica: ASP.NET Core serializa las propiedades C# (PascalCase) a JSON en camelCase por defecto.
 */

export interface PersonaDto {
  idPersona: number;
  apellido: string;
  nombre: string;
  nombreCompleto?: string;
  dni: string;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  fechaAlta?: string | null;
  activo?: boolean | null;
  estadoTexto?: string;
}

export interface PersonaCrearDto {
  apellido: string;
  nombre: string;
  dni: string;
  telefono: string;
  email?: string;
  direccion: string;
}

export interface PersonaActualizarDto {
  idPersona: number;
  apellido: string;
  nombre: string;
  dni: string;
  telefono: string;
  email?: string;
  direccion: string;
  activo: boolean;
}

export type ModoBusquedaPersona = 'nombre' | 'dni';
export type FiltroEstadoPersona = 'todos' | 'activos' | 'inactivos';

/**
 * Helper puro para obtener el nombre completo independientemente de si el endpoint
 * de C# devolvió la entidad `Persona` (en GET) o el `PersonaDto` (en POST/PUT).
 */
export function formatNombreCompleto(persona: Pick<PersonaDto, 'nombre' | 'apellido' | 'nombreCompleto'>): string {
  if (persona.nombreCompleto && persona.nombreCompleto.trim().length > 0) {
    return persona.nombreCompleto.trim();
  }
  return `${persona.nombre} ${persona.apellido}`.trim();
}
