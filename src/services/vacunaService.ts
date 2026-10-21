import { axiosClient } from '../api/axiosClient';
import {
  VacunaDto,
  VacunaCrearDto,
  VacunaActualizarDto,
} from '../types/vacuna.types';

const BASE_PATH = '/api/Vacuna';

/**
 * Servicio asíncrono para el catálogo de Vacunas.
 * Conecta con `VacunaController.cs` en la API C#.
 */
export const vacunaService = {
  /**
   * GET /api/Vacuna
   */
  async getAll(): Promise<VacunaDto[]> {
    const response = await axiosClient.get<VacunaDto[]>(BASE_PATH);
    return response.data;
  },

  /**
   * GET /api/Vacuna/{idVacuna}
   */
  async getById(id: number): Promise<VacunaDto> {
    const response = await axiosClient.get<VacunaDto>(`${BASE_PATH}/${id}`);
    return response.data;
  },

  /**
   * GET /api/Vacuna/buscar?nombre={nombre}
   */
  async buscar(nombre: string): Promise<VacunaDto[]> {
    const response = await axiosClient.get<VacunaDto[]>(`${BASE_PATH}/buscar`, {
      params: { nombre: nombre.trim() },
    });
    return response.data;
  },

  /**
   * POST /api/Vacuna
   */
  async crear(dto: VacunaCrearDto): Promise<VacunaDto> {
    const payload: VacunaCrearDto = {
      nombre: dto.nombre.trim(),
      descripcion: dto.descripcion?.trim() || undefined,
    };
    const response = await axiosClient.post<VacunaDto>(BASE_PATH, payload);
    return response.data;
  },

  /**
   * PUT /api/Vacuna/{idVacuna}
   */
  async actualizar(id: number, dto: VacunaActualizarDto): Promise<VacunaDto> {
    const payload: VacunaActualizarDto = {
      idVacuna: id,
      nombre: dto.nombre.trim(),
      descripcion: dto.descripcion?.trim() || undefined,
    };
    const response = await axiosClient.put<VacunaDto>(`${BASE_PATH}/${id}`, payload);
    return response.data;
  },

  /**
   * DELETE /api/Vacuna/{idVacuna}
   */
  async eliminar(id: number): Promise<void> {
    await axiosClient.delete(`${BASE_PATH}/${id}`);
  },
};
