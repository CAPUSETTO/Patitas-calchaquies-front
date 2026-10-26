import { axiosClient } from '../api/axiosClient';
import { ESPECIES_REFUGIO, EspecieCatalogItem, RazaDto, RazaCrearDto } from '../types/raza.types';

const BASE_PATH = '/api/Raza';
const ESPECIES_PATH = '/api/Especies';

let especiesSeeded = false;

/**
 * Servicio asíncrono para el catálogo de Razas y Especies.
 * Conecta con `RazaController.cs` (`/api/Raza`) y `EspeciesController.cs` (`/api/Especies`) en la API C#.
 */
export const razaService = {
  /**
   * GET /api/Especies (con auto-semilla en la API si la tabla Especies está vacía)
   */
  async getEspecies(): Promise<EspecieCatalogItem[]> {
    try {
      const response = await axiosClient.get<EspecieCatalogItem[]>(ESPECIES_PATH);
      if (Array.isArray(response.data) && response.data.length > 0) {
        especiesSeeded = true;
        return response.data;
      }

      if (!especiesSeeded) {
        especiesSeeded = true;
        for (const esp of ESPECIES_REFUGIO) {
          try {
            await axiosClient.post(ESPECIES_PATH, { nombre: esp.nombre });
          } catch {
            // Ignorar si ya existe
          }
        }
        const recheck = await axiosClient.get<EspecieCatalogItem[]>(ESPECIES_PATH);
        if (Array.isArray(recheck.data) && recheck.data.length > 0) {
          return recheck.data;
        }
      }
    } catch {
      // Respaldo al catálogo base si falla la consulta inicial
    }
    return ESPECIES_REFUGIO;
  },

  /**
   * GET /api/Raza
   */
  async getAll(): Promise<RazaDto[]> {
    const response = await axiosClient.get<RazaDto[]>(BASE_PATH);
    return response.data;
  },

  /**
   * GET /api/Raza/especie/{idEspecie}
   */
  async getByEspecie(idEspecie: number): Promise<RazaDto[]> {
    const response = await axiosClient.get<RazaDto[]>(`${BASE_PATH}/especie/${idEspecie}`);
    return response.data;
  },

  /**
   * POST /api/Raza
   */
  async crear(dto: RazaCrearDto): Promise<RazaDto> {
    if (!especiesSeeded) {
      await this.getEspecies();
    }
    const payload: RazaCrearDto = {
      idEspecie: Number(dto.idEspecie),
      nombre: dto.nombre.trim(),
    };
    const response = await axiosClient.post<RazaDto>(BASE_PATH, payload);
    return response.data;
  },
};
