/**
 * Interfaces TypeScript para la entidad Medicamento.
 * Espejo de:
 * - `PatitasCalchaquies.Core.Entities.Medicamento`
 * - `PatitasCalchaquies.API.DTOs.MedicamentoDto`
 * - `PatitasCalchaquies.API.DTOs.MedicamentoCrearDto`
 * - `PatitasCalchaquies.API.DTOs.MedicamentoActualizarDto`
 */

export interface MedicamentoDto {
  idMedicamento: number;
  nombre: string;
  descripcion?: string | null;
}

export interface MedicamentoCrearDto {
  nombre: string;
  descripcion?: string;
}

export interface MedicamentoActualizarDto {
  idMedicamento: number;
  nombre: string;
  descripcion?: string;
}
