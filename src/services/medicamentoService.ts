import { axiosClient } from '../api/axiosClient';
import {
  MedicamentoDto,
  MedicamentoCrearDto,
  MedicamentoActualizarDto,
} from '../types/medicamento.types';

const BASE_PATH = '/api/Medicamento';

/**
 * Servicio asíncrono para el catálogo de Medicamentos.
 * Conecta con `MedicamentoController.cs` en la API C#.
 */
export const medicamentoService = {
  /**
   * GET /api/Medicamento
   */
  async getAll(): Promise<MedicamentoDto[]> {
    const response = await axiosClient.get<MedicamentoDto[]>(BASE_PATH);
    return response.data;
  },

  /**
   * GET /api/Medicamento/{idMedicamento}
   */
  async getById(id: number): Promise<MedicamentoDto> {
    const response = await axiosClient.get<MedicamentoDto>(`${BASE_PATH}/${id}`);
    return response.data;
  },

  /**
   * GET /api/Medicamento/buscar?nombre={nombre}
   */
  async buscar(nombre: string): Promise<MedicamentoDto[]> {
    const response = await axiosClient.get<MedicamentoDto[]>(`${BASE_PATH}/buscar`, {
      params: { nombre: nombre.trim() },
    });
    return response.data;
  },

  /**
   * POST /api/Medicamento
   */
  async crear(dto: MedicamentoCrearDto): Promise<MedicamentoDto> {
    const payload: MedicamentoCrearDto = {
      nombre: dto.nombre.trim(),
      descripcion: dto.descripcion?.trim() || undefined,
    };
    const response = await axiosClient.post<MedicamentoDto>(BASE_PATH, payload);
    return response.data;
  },

  /**
   * PUT /api/Medicamento/{idMedicamento}
   */
  async actualizar(id: number, dto: MedicamentoActualizarDto): Promise<MedicamentoDto> {
    const payload: MedicamentoActualizarDto = {
      idMedicamento: id,
      nombre: dto.nombre.trim(),
      descripcion: dto.descripcion?.trim() || undefined,
    };
    const response = await axiosClient.put<MedicamentoDto>(`${BASE_PATH}/${id}`, payload);
    return response.data;
  },

  /**
   * DELETE /api/Medicamento/{idMedicamento}
   */
  async eliminar(id: number): Promise<void> {
    await axiosClient.delete(`${BASE_PATH}/${id}`);
  },
};
