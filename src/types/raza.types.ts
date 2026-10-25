/**
 * Interfaces TypeScript para la entidad Raza y Especie.
 * Espejo de:
 * - `PatitasCalchaquies.Core.Entities.Raza`
 * - `PatitasCalchaquies.Core.Entities.Especie`
 * - `PatitasCalchaquies.API.DTOs.RazaDto`
 * - `PatitasCalchaquies.API.DTOs.RazaCrearDto`
 */

export interface EspecieRef {
  idEspecie: number;
  nombre: string;
}

export type EspecieCatalogItem = EspecieRef;

export const ESPECIES_REFUGIO: EspecieRef[] = [
  { idEspecie: 1, nombre: 'Canino (Perro)' },
  { idEspecie: 2, nombre: 'Felino (Gato)' },
  { idEspecie: 3, nombre: 'Otro' },
];

export interface RazaDto {
  idRaza: number;
  idEspecie: number;
  nombre: string;
  especieNombre?: string;
}

export interface RazaCrearDto {
  idEspecie: number;
  nombre: string;
}
