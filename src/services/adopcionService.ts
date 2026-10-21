import { axiosClient } from '../api/axiosClient';
import {
  SolicitudAdopcionDto,
  SolicitudAdopcionCrearDto,
  EstadoSolicitudAdopcion,
} from '../types/adopcion.types';

const BASE_PATH = '/api/Adopcion';
const STORAGE_KEY = 'patitas_calchaquies_adopciones_v1';

const SEMILLA_ADOPCIONES: SolicitudAdopcionDto[] = [
  {
    idSolicitudAdopcion: 1,
    idPersona: 1,
    personaNombre: 'María Belén Gómez',
    personaDni: '38451290',
    personaTelefono: '+543815112233',
    idAnimal: 1,
    animalNombre: 'Manchitas',
    animalCodigo: 'CAN-2026-001',
    fecha: '2026-10-15',
    estado: 'Pendiente',
    observacion: 'Tiene casa con patio cerrado, vive con dos niños. Ya tuvo perros antes.',
  },
  {
    idSolicitudAdopcion: 2,
    idPersona: 2,
    personaNombre: 'Carlos Eduardo Álvarez',
    personaDni: '35123987',
    personaTelefono: '+543814887766',
    idAnimal: 4,
    animalNombre: 'Canela',
    animalCodigo: 'CAN-2026-004',
    fecha: '2026-09-20',
    estado: 'Concretada',
    observacion: 'Contrato de adopción firmado y entrega formal realizada.',
    idAdopcion: 101,
  },
];

function obtenerAlmacenados(): SolicitudAdopcionDto[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEMILLA_ADOPCIONES));
      return SEMILLA_ADOPCIONES;
    }
    return JSON.parse(raw) as SolicitudAdopcionDto[];
  } catch {
    return SEMILLA_ADOPCIONES;
  }
}

function guardarAlmacenados(lista: SolicitudAdopcionDto[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  } catch {
    // Si localStorage no está disponible
  }
}

const USE_MOCK = true;

export const adopcionService = {
  async getAll(): Promise<SolicitudAdopcionDto[]> {
    if (!USE_MOCK) {
      const res = await axiosClient.get<SolicitudAdopcionDto[]>(BASE_PATH);
      return res.data;
    }
    await new Promise((r) => setTimeout(r, 250));
    return obtenerAlmacenados();
  },

  async crear(
    dto: SolicitudAdopcionCrearDto,
    extraInfo?: { personaNombre?: string; animalNombre?: string }
  ): Promise<SolicitudAdopcionDto> {
    if (!USE_MOCK) {
      const res = await axiosClient.post<SolicitudAdopcionDto>(BASE_PATH, dto);
      return res.data;
    }
    await new Promise((r) => setTimeout(r, 300));
    const lista = obtenerAlmacenados();
    const nuevoId = lista.length > 0 ? Math.max(...lista.map((x) => x.idSolicitudAdopcion)) + 1 : 1;

    const nueva: SolicitudAdopcionDto = {
      idSolicitudAdopcion: nuevoId,
      idPersona: dto.idPersona,
      personaNombre: extraInfo?.personaNombre || `Persona #${dto.idPersona}`,
      idAnimal: dto.idAnimal,
      animalNombre: extraInfo?.animalNombre || `Animal #${dto.idAnimal}`,
      fecha: new Date().toISOString().split('T')[0],
      estado: 'Pendiente',
      observacion: dto.observacion || '',
    };
    lista.unshift(nueva);
    guardarAlmacenados(lista);
    return nueva;
  },

  async cambiarEstado(
    idSolicitud: number,
    nuevoEstado: EstadoSolicitudAdopcion
  ): Promise<SolicitudAdopcionDto> {
    if (!USE_MOCK) {
      const res = await axiosClient.patch<SolicitudAdopcionDto>(
        `${BASE_PATH}/${idSolicitud}/estado`,
        { estado: nuevoEstado }
      );
      return res.data;
    }
    await new Promise((r) => setTimeout(r, 250));
    const lista = obtenerAlmacenados();
    const index = lista.findIndex((x) => x.idSolicitudAdopcion === idSolicitud);
    if (index === -1) throw new Error('Solicitud no encontrada');

    lista[index].estado = nuevoEstado;
    if (nuevoEstado === 'Concretada' && !lista[index].idAdopcion) {
      lista[index].idAdopcion = Date.now();
    }
    guardarAlmacenados(lista);
    return lista[index];
  },
};
