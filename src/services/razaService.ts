import { axiosClient } from '../api/axiosClient';
import { RazaDto, RazaCrearDto } from '../types/raza.types';

const BASE_PATH = '/api/Raza';

/**
 * Servicio asíncrono para el catálogo de Razas.
 * Conecta con `RazaController.cs` en la API C#.
 */
export const razaService = {
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
    const payload: RazaCrearDto = {
      idEspecie: Number(dto.idEspecie),
      nombre: dto.nombre.trim(),
    };
    const response = await axiosClient.post<RazaDto>(BASE_PATH, payload);
    return response.data;
  },
};
