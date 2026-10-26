import { axiosClient } from '../api/axiosClient';
import {
  SolicitudAdopcionDto,
  SolicitudAdopcionCrearDto,
  EstadoSolicitudAdopcion,
} from '../types/adopcion.types';
import { PersonaDto } from '../types/persona.types';
import { AnimalDto } from '../types/animal.types';

const SOLICITUDES_PATH = '/api/SolicitudesAdopciones';
const ADOPCIONES_PATH = '/api/Adopciones';
const STORAGE_KEY = 'patitas_calchaquies_adopciones_v1';

interface AdopcionApiDto {
  idAdopcion: number;
  idSolicitudAdopcion: number;
  fecha: string;
  observacion?: string | null;
}

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

const USE_MOCK = false;

async function safeGetList<T>(url: string): Promise<T[]> {
  try {
    const res = await axiosClient.get<T[]>(url);
    return Array.isArray(res.data) ? res.data : [];
  } catch {
    return [];
  }
}

export const adopcionService = {
  async getAll(): Promise<SolicitudAdopcionDto[]> {
    if (!USE_MOCK) {
      const [solicitudesRes, personas, animales, adopciones] = await Promise.all([
        axiosClient.get<SolicitudAdopcionDto[]>(SOLICITUDES_PATH),
        safeGetList<PersonaDto>('/api/Personas'),
        safeGetList<AnimalDto>('/api/Animales'),
        safeGetList<AdopcionApiDto>(ADOPCIONES_PATH),
      ]);

      const solicitudes = Array.isArray(solicitudesRes.data) ? solicitudesRes.data : [];

      return solicitudes.map((sol) => {
        const persona = personas.find((p) => p.idPersona === sol.idPersona);
        const animal = animales.find((a) => a.idAnimal === sol.idAnimal);
        const adopcion = adopciones.find((ad) => ad.idSolicitudAdopcion === sol.idSolicitudAdopcion);

        return {
          ...sol,
          fecha: sol.fecha ? sol.fecha.split('T')[0] : sol.fecha,
          personaNombre:
            sol.personaNombre ||
            (persona ? `${persona.nombre} ${persona.apellido}`.trim() : `Persona #${sol.idPersona}`),
          personaDni: sol.personaDni || persona?.dni || undefined,
          personaTelefono: sol.personaTelefono || persona?.telefono || undefined,
          animalNombre: sol.animalNombre || animal?.nombre || `Animal #${sol.idAnimal}`,
          animalCodigo: sol.animalCodigo || animal?.codigoIdentificacion,
          idAdopcion: sol.idAdopcion ?? adopcion?.idAdopcion ?? null,
        };
      });
    }
    await new Promise((r) => setTimeout(r, 250));
    return obtenerAlmacenados();
  },

  async crear(
    dto: SolicitudAdopcionCrearDto,
    extraInfo?: {
      personaNombre?: string;
      personaDni?: string;
      personaTelefono?: string;
      animalNombre?: string;
      animalCodigo?: string;
    }
  ): Promise<SolicitudAdopcionDto> {
    if (!USE_MOCK) {
      const payload = {
        idPersona: Number(dto.idPersona),
        idAnimal: Number(dto.idAnimal),
        fecha: new Date().toISOString(),
        estado: 'Pendiente' as EstadoSolicitudAdopcion,
        observacion: dto.observacion?.trim() || null,
      };
      const res = await axiosClient.post<SolicitudAdopcionDto>(SOLICITUDES_PATH, payload);
      return {
        ...res.data,
        fecha: res.data.fecha ? res.data.fecha.split('T')[0] : new Date().toISOString().split('T')[0],
        personaNombre: extraInfo?.personaNombre || `Persona #${dto.idPersona}`,
        personaDni: extraInfo?.personaDni,
        personaTelefono: extraInfo?.personaTelefono,
        animalNombre: extraInfo?.animalNombre || `Animal #${dto.idAnimal}`,
        animalCodigo: extraInfo?.animalCodigo,
      };
    }
    await new Promise((r) => setTimeout(r, 300));
    const lista = obtenerAlmacenados();
    const nuevoId = lista.length > 0 ? Math.max(...lista.map((x) => x.idSolicitudAdopcion)) + 1 : 1;

    const nueva: SolicitudAdopcionDto = {
      idSolicitudAdopcion: nuevoId,
      idPersona: dto.idPersona,
      personaNombre: extraInfo?.personaNombre || `Persona #${dto.idPersona}`,
      personaDni: extraInfo?.personaDni,
      personaTelefono: extraInfo?.personaTelefono,
      idAnimal: dto.idAnimal,
      animalNombre: extraInfo?.animalNombre || `Animal #${dto.idAnimal}`,
      animalCodigo: extraInfo?.animalCodigo,
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
      const actualRes = await axiosClient.get<SolicitudAdopcionDto>(
        `${SOLICITUDES_PATH}/${idSolicitud}`
      );
      const actual = actualRes.data;

      const updatePayload = {
        idSolicitudAdopcion: Number(idSolicitud),
        idPersona: Number(actual.idPersona),
        idAnimal: Number(actual.idAnimal),
        fecha: actual.fecha.includes('T') ? actual.fecha : `${actual.fecha}T00:00:00`,
        estado: nuevoEstado,
        observacion: actual.observacion || null,
      };

      const res = await axiosClient.put<SolicitudAdopcionDto>(
        `${SOLICITUDES_PATH}/${idSolicitud}`,
        updatePayload
      );

      let idAdopcionCreada: number | null = null;

      if (nuevoEstado === 'Concretada') {
        try {
          const adopcionRes = await axiosClient.post<AdopcionApiDto>(ADOPCIONES_PATH, {
            idSolicitudAdopcion: Number(idSolicitud),
            fecha: new Date().toISOString(),
            observacion: actual.observacion || 'Adopción concretada.',
          });
          idAdopcionCreada = adopcionRes.data?.idAdopcion ?? null;
        } catch {
          // Si ya existía registro de adopción, continuar
        }

        try {
          const animalRes = await axiosClient.get<AnimalDto>(`/api/Animales/${actual.idAnimal}`);
          const animal = animalRes.data;
          if (animal) {
            await axiosClient.put(`/api/Animales/${actual.idAnimal}`, {
              ...animal,
              idAnimal: Number(actual.idAnimal),
              idEstado: 3, // Adoptado
            });
          }
        } catch {
          // Ignorar si no se pudo actualizar el estado secundario del animal
        }
      }

      return {
        ...res.data,
        idAdopcion: idAdopcionCreada,
      };
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
