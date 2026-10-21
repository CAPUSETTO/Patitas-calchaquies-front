/**
 * Interfaces TypeScript para Atenciones Veterinarias y Vacunaciones.
 * Espejo de:
 * - `PatitasCalchaquies.Core.Entities.Atencion_Veterinario.cs`
 * - `PatitasCalchaquies.Core.Entities.Vacunacion.cs`
 * - `PatitasCalchaquies.Core.Entities.Tratamiento.cs`
 */

export interface AtencionVeterinariaDto {
  idAtencionVeterinaria: number;
  idAnimal: number;
  animalNombre?: string;
  fecha: string;
  motivo: string;
  diagnostico?: string;
  veterinarioNombre?: string;
  idVacunaAplicada?: number | null;
  vacunaNombre?: string;
  idMedicamentoRecetado?: number | null;
  medicamentoNombre?: string;
  indicaciones?: string;
}

export interface AtencionVeterinariaCrearDto {
  idAnimal: number;
  motivo: string;
  diagnostico?: string;
  veterinarioNombre?: string;
  idVacunaAplicada?: number | null;
  idMedicamentoRecetado?: number | null;
  indicaciones?: string;
}
