/**
 * Interfaces TypeScript para la entidad Vacuna.
 * Espejo de:
 * - `PatitasCalchaquies.Core.Entities.Vacuna`
 * - `PatitasCalchaquies.API.DTOs.VacunaDto`
 * - `PatitasCalchaquies.API.DTOs.VacunaCrearDto`
 * - `PatitasCalchaquies.API.DTOs.VacunaActualizarDto`
 */

export interface VacunaDto {
  idVacuna: number;
  nombre: string;
  descripcion?: string | null;
}

export interface VacunaCrearDto {
  nombre: string;
  descripcion?: string;
}

export interface VacunaActualizarDto {
  idVacuna: number;
  nombre: string;
  descripcion?: string;
}
