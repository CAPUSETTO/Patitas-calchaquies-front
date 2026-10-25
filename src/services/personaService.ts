import axios from 'axios';
import { axiosClient } from '../api/axiosClient';
import {
  PersonaDto,
  PersonaCrearDto,
  PersonaActualizarDto,
} from '../types/persona.types';

const BASE_PATH = '/api/Personas';

/**
 * Servicio asíncrono para la entidad Persona.
 *
 * TUTORÍA PARA DESARROLLADORES C#:
 * Equivale a tu clase `ServicioPersona` en la capa Core, pero del lado del cliente HTTP.
 * Ningún componente de React llama a `axiosClient` directamente; todos consumen este objeto.
 * `Promise<T>` en TypeScript es el equivalente exacto a `Task<T>` en C#.
 */
export const personaService = {
  /**
   * GET /api/Personas
   * Obtiene el listado completo de personas registradas.
   */
  async getAll(): Promise<PersonaDto[]> {
    const response = await axiosClient.get<PersonaDto[]>(BASE_PATH);
    return response.data;
  },

  /**
   * GET /api/Personas/{id}
   * Obtiene una persona por su clave primaria `IdPersona`.
   */
  async getById(id: number): Promise<PersonaDto> {
    const response = await axiosClient.get<PersonaDto>(`${BASE_PATH}/${id}`);
    return response.data;
  },

  /**
   * GET /api/Personas/dni/{dni}
   * Ruta custom no-RESTful para buscar una persona por su DNI exacto.
   * Si la API responde 404 NotFound, devolvemos `null` limpiamente.
   */
  async getByDni(dni: string): Promise<PersonaDto | null> {
    try {
      const cleanDni = encodeURIComponent(dni.trim());
      const response = await axiosClient.get<PersonaDto>(`${BASE_PATH}/dni/${cleanDni}`);
      return response.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        return null;
      }
      throw err;
    }
  },

  /**
   * GET /api/Personas/buscar?nombre={nombre}
   * Ruta custom que invoca `sp_persona_buscar` mediante QueryString (`[FromQuery] string nombre`).
   */
  async buscarPorNombre(nombre: string): Promise<PersonaDto[]> {
    const response = await axiosClient.get<PersonaDto[]>(`${BASE_PATH}/buscar`, {
      params: { nombre: nombre.trim() },
    });
    return response.data;
  },

  /**
   * POST /api/Personas
   * Crea una nueva persona validando con `PersonaCreateValidator` en el backend.
   */
  async crear(dto: PersonaCrearDto): Promise<PersonaDto> {
    const cleanDni = dto.dni.replace(/\D/g, '');
    const cleanPhone = dto.telefono.replace(/[^\d+]/g, '');
    const payload: PersonaCrearDto = {
      apellido: dto.apellido.trim(),
      nombre: dto.nombre.trim(),
      dni: cleanDni || dto.dni.trim(),
      telefono: cleanPhone || dto.telefono.trim(),
      direccion: (dto.direccion ?? '').trim() || 'Valles Calchaquíes',
      email: dto.email && dto.email.trim().length > 0 ? dto.email.trim() : undefined,
    };
    const response = await axiosClient.post<PersonaDto>(BASE_PATH, payload);
    return response.data;
  },

  /**
   * PUT /api/Personas/{id}
   * Actualiza los datos de una persona existente (`id` debe coincidir con `dto.idPersona`).
   */
  async actualizar(id: number, dto: PersonaActualizarDto): Promise<PersonaDto> {
    const cleanDni = dto.dni.replace(/\D/g, '');
    const cleanPhone = dto.telefono.replace(/[^\d+]/g, '');
    const payload: PersonaActualizarDto = {
      idPersona: id,
      apellido: dto.apellido.trim(),
      nombre: dto.nombre.trim(),
      dni: cleanDni || dto.dni.trim(),
      telefono: cleanPhone || dto.telefono.trim(),
      direccion: (dto.direccion ?? '').trim() || 'Valles Calchaquíes',
      email: dto.email && dto.email.trim().length > 0 ? dto.email.trim() : undefined,
      activo: dto.activo,
    };
    const response = await axiosClient.put<PersonaDto>(`${BASE_PATH}/${id}`, payload);
    return response.data;
  },

  /**
   * DELETE /api/Personas/{id}
   * Ejecuta la baja de la persona (`sp_persona_eliminar`).
   */
  async eliminar(id: number): Promise<void> {
    await axiosClient.delete(`${BASE_PATH}/${id}`);
  },
};
