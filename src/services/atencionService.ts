import { axiosClient } from '../api/axiosClient';
import {
  AtencionVeterinariaDto,
  AtencionVeterinariaCrearDto,
} from '../types/atencion.types';

const BASE_PATH = '/api/AtencionVeterinaria';
const STORAGE_KEY = 'patitas_calchaquies_atenciones_v1';

const SEMILLA_ATENCIONES: AtencionVeterinariaDto[] = [
  {
    idAtencionVeterinaria: 1,
    idAnimal: 3,
    animalNombre: 'Rocky',
    fecha: '2026-09-16',
    motivo: 'Revisión por renguera en miembro anterior',
    diagnostico: 'Traumatismo leve en articulación. Sin fractura en radiografía.',
    veterinarioNombre: 'Dra. Andrea Calchaquí',
    idMedicamentoRecetado: 1,
    medicamentoNombre: 'Meloxicam 0.5%',
    indicaciones: 'Reposo en canil durante 5 días. 1 comprimido diario junto a la comida.',
  },
  {
    idAtencionVeterinaria: 2,
    idAnimal: 1,
    animalNombre: 'Manchitas',
    fecha: '2026-08-12',
    motivo: 'Inmunización anual y desparasitación',
    diagnostico: 'Paciente en excelente condición corporal.',
    veterinarioNombre: 'Dr. Martín Paz',
    idVacunaAplicada: 1,
    vacunaNombre: 'Antirrábica Anual',
    indicaciones: 'Próximo refuerzo en 12 meses.',
  },
];

function obtenerAlmacenados(): AtencionVeterinariaDto[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEMILLA_ATENCIONES));
      return SEMILLA_ATENCIONES;
    }
    return JSON.parse(raw) as AtencionVeterinariaDto[];
  } catch {
    return SEMILLA_ATENCIONES;
  }
}

function guardarAlmacenados(lista: AtencionVeterinariaDto[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  } catch {
    // Si localStorage no está disponible
  }
}

const USE_MOCK = true;

export const atencionService = {
  async getAll(): Promise<AtencionVeterinariaDto[]> {
    if (!USE_MOCK) {
      const res = await axiosClient.get<AtencionVeterinariaDto[]>(BASE_PATH);
      return res.data;
    }
    await new Promise((r) => setTimeout(r, 250));
    return obtenerAlmacenados();
  },

  async crear(
    dto: AtencionVeterinariaCrearDto,
    extraInfo?: { animalNombre?: string; vacunaNombre?: string; medicamentoNombre?: string }
  ): Promise<AtencionVeterinariaDto> {
    if (!USE_MOCK) {
      const res = await axiosClient.post<AtencionVeterinariaDto>(BASE_PATH, dto);
      return res.data;
    }
    await new Promise((r) => setTimeout(r, 300));
    const lista = obtenerAlmacenados();
    const nuevoId =
      lista.length > 0 ? Math.max(...lista.map((x) => x.idAtencionVeterinaria)) + 1 : 1;

    const nueva: AtencionVeterinariaDto = {
      ...dto,
      idAtencionVeterinaria: nuevoId,
      fecha: new Date().toISOString().split('T')[0],
      animalNombre: extraInfo?.animalNombre || `Animal #${dto.idAnimal}`,
      vacunaNombre: extraInfo?.vacunaNombre,
      medicamentoNombre: extraInfo?.medicamentoNombre,
    };
    lista.unshift(nueva);
    guardarAlmacenados(lista);
    return nueva;
  },
};
