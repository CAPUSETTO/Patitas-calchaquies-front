import { axiosClient } from '../api/axiosClient';
import {
  AtencionVeterinariaDto,
  AtencionVeterinariaCrearDto,
} from '../types/atencion.types';
import { AnimalDto, VeterinarioDto } from '../types/animal.types';
import { VacunaDto } from '../types/vacuna.types';
import { MedicamentoDto } from '../types/medicamento.types';

const BASE_PATH = '/api/AtencionesVeterinarias';
const STORAGE_KEY = 'patitas_calchaquies_atenciones_v1';

interface VacunacionApiDto {
  idVacunacion: number;
  idAnimal: number;
  idVacuna: number;
  fecha: string;
  proximaFecha?: string | null;
  observacion?: string | null;
}

interface TratamientoApiDto {
  idTratamiento: number;
  idAtencionVeterinaria: number;
  descripcion: string;
  fechaInicio: string;
  fechaFin?: string | null;
  estado: string;
  observacion?: string | null;
}

interface TratamientoMedicamentoApiDto {
  idTratamientoMedico: number;
  idMedicamento: number;
  idTratamiento: number;
  dosis: string;
  frecuencia: string;
  duracion: string;
  observacion?: string | null;
}

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

const USE_MOCK = false;

async function safeGetList<T>(url: string): Promise<T[]> {
  try {
    const res = await axiosClient.get<T[]>(url);
    return Array.isArray(res.data) ? res.data : [];
  } catch {
    return [];
  }
}

async function resolverIdVeterinario(
  idPreferido?: number,
  nombreTexto?: string
): Promise<number> {
  if (idPreferido && idPreferido > 0) return idPreferido;

  const veterinarios = await safeGetList<VeterinarioDto>('/api/Veterinarios');
  if (veterinarios.length > 0) {
    if (nombreTexto?.trim()) {
      const buscado = nombreTexto.trim().toLowerCase();
      const coincidencia = veterinarios.find((v) =>
        `${v.nombre} ${v.apellido}`.toLowerCase().includes(buscado)
      );
      if (coincidencia) return coincidencia.idVeterinario;
    }
    return veterinarios[0].idVeterinario;
  }

  // Si aún no hay veterinarios cargados en la tabla de MySQL, crear el veterinario de guardia por defecto
  try {
    const partes = (nombreTexto?.replace(/^(Dra?\.?\s*)/i, '').trim() || 'Sofía Mamaní').split(' ');
    const nombre = partes[0] || 'Sofía';
    const apellido = partes.slice(1).join(' ') || 'Mamaní';

    const creadoRes = await axiosClient.post<VeterinarioDto>('/api/Veterinarios', {
      matricula: `MP-SAL-${Math.floor(100 + Math.random() * 899)}`,
      nombre: nombre.slice(0, 50),
      apellido: apellido.slice(0, 50),
      telefono: '+543868421900',
    });
    if (creadoRes.data?.idVeterinario) {
      return creadoRes.data.idVeterinario;
    }
  } catch {
    // Fallback
  }

  return 1;
}

export const atencionService = {
  async getAll(): Promise<AtencionVeterinariaDto[]> {
    if (!USE_MOCK) {
      const [
        atencionesRes,
        animales,
        veterinarios,
        vacunaciones,
        vacunas,
        tratamientos,
        tratMed,
        medicamentos,
      ] = await Promise.all([
        axiosClient.get<AtencionVeterinariaDto[]>(BASE_PATH),
        safeGetList<AnimalDto>('/api/Animales'),
        safeGetList<VeterinarioDto>('/api/Veterinarios'),
        safeGetList<VacunacionApiDto>('/api/Vacunaciones'),
        safeGetList<VacunaDto>('/api/Vacuna'),
        safeGetList<TratamientoApiDto>('/api/Tratamientos'),
        safeGetList<TratamientoMedicamentoApiDto>('/api/TratamientosMedicamentos'),
        safeGetList<MedicamentoDto>('/api/Medicamento'),
      ]);

      const atenciones = Array.isArray(atencionesRes.data) ? atencionesRes.data : [];

      return atenciones.map((at) => {
        const animal = animales.find((a) => a.idAnimal === at.idAnimal);
        const vet = veterinarios.find((v) => v.idVeterinario === at.idVeterinario);
        const tratamiento = tratamientos.find(
          (t) => t.idAtencionVeterinaria === at.idAtencionVeterinaria
        );
        const tm = tratamiento
          ? tratMed.find((m) => m.idTratamiento === tratamiento.idTratamiento)
          : undefined;
        const med = tm
          ? medicamentos.find((m) => m.idMedicamento === tm.idMedicamento)
          : undefined;

        const fechaCorta = at.fecha ? at.fecha.split('T')[0] : at.fecha;
        const vacunacion = vacunaciones.find(
          (vac) =>
            vac.idAnimal === at.idAnimal &&
            (vac.fecha ? vac.fecha.split('T')[0] : '') === fechaCorta
        );
        const vacuna = vacunacion
          ? vacunas.find((v) => v.idVacuna === vacunacion.idVacuna)
          : undefined;

        return {
          ...at,
          fecha: fechaCorta,
          animalNombre: at.animalNombre || animal?.nombre || `Animal #${at.idAnimal}`,
          veterinarioNombre:
            at.veterinarioNombre ||
            (vet ? `${vet.nombre} ${vet.apellido} (${vet.matricula})` : 'Guardia Veterinaria'),
          diagnostico: at.diagnostico || tratamiento?.descripcion || undefined,
          indicaciones:
            at.indicaciones ||
            tratamiento?.observacion ||
            tm?.observacion ||
            vacunacion?.observacion ||
            undefined,
          idVacunaAplicada: at.idVacunaAplicada ?? vacunacion?.idVacuna ?? null,
          vacunaNombre: at.vacunaNombre || vacuna?.nombre || undefined,
          idMedicamentoRecetado: at.idMedicamentoRecetado ?? tm?.idMedicamento ?? null,
          medicamentoNombre: at.medicamentoNombre || med?.nombre || undefined,
        };
      });
    }
    await new Promise((r) => setTimeout(r, 250));
    return obtenerAlmacenados();
  },

  async crear(
    dto: AtencionVeterinariaCrearDto,
    extraInfo?: { animalNombre?: string; vacunaNombre?: string; medicamentoNombre?: string }
  ): Promise<AtencionVeterinariaDto> {
    if (!USE_MOCK) {
      const fechaIso = new Date().toISOString();
      const idVeterinario = await resolverIdVeterinario(dto.idVeterinario, dto.veterinarioNombre);

      const apiPayload = {
        idAnimal: Number(dto.idAnimal),
        idVeterinario,
        fecha: fechaIso,
        motivo: dto.motivo.trim().slice(0, 50),
      };

      const res = await axiosClient.post<AtencionVeterinariaDto>(BASE_PATH, apiPayload);
      const creada = res.data;

      // Si se aplicó vacuna durante la consulta, registrar también en VacunacionesController
      if (dto.idVacunaAplicada && Number(dto.idVacunaAplicada) > 0) {
        try {
          await axiosClient.post('/api/Vacunaciones', {
            idAnimal: Number(dto.idAnimal),
            idVacuna: Number(dto.idVacunaAplicada),
            fecha: fechaIso,
            proximaFecha: null,
            observacion: (dto.indicaciones?.trim() || dto.motivo.trim()).slice(0, 500),
          });
        } catch {
          // No interrumpir si falla el registro secundario de vacunación
        }
      }

      // Si hay diagnóstico, indicaciones o medicamento recetado, registrar Tratamiento y TratamientoMedicamento
      if (
        (dto.diagnostico?.trim() || dto.indicaciones?.trim() || dto.idMedicamentoRecetado) &&
        creada?.idAtencionVeterinaria
      ) {
        try {
          const tratRes = await axiosClient.post<TratamientoApiDto>('/api/Tratamientos', {
            idAtencionVeterinaria: creada.idAtencionVeterinaria,
            descripcion: (dto.diagnostico?.trim() || dto.motivo.trim()).slice(0, 255),
            fechaInicio: fechaIso,
            fechaFin: null,
            estado: 'Activo',
            observacion: dto.indicaciones?.trim().slice(0, 500) || null,
          });

          if (
            dto.idMedicamentoRecetado &&
            Number(dto.idMedicamentoRecetado) > 0 &&
            tratRes.data?.idTratamiento
          ) {
            await axiosClient.post('/api/TratamientosMedicamentos', {
              idMedicamento: Number(dto.idMedicamentoRecetado),
              idTratamiento: tratRes.data.idTratamiento,
              dosis: 'Según prescripción clínica',
              frecuencia: 'Cada 12 / 24 hs',
              duracion: '5 a 7 días',
              observacion: dto.indicaciones?.trim().slice(0, 500) || null,
            });
          }
        } catch {
          // No interrumpir si falla el registro secundario de tratamiento
        }
      }

      return {
        ...creada,
        fecha: creada.fecha ? creada.fecha.split('T')[0] : fechaIso.split('T')[0],
        animalNombre: extraInfo?.animalNombre || `Animal #${dto.idAnimal}`,
        veterinarioNombre: dto.veterinarioNombre || 'Guardia Veterinaria',
        diagnostico: dto.diagnostico,
        indicaciones: dto.indicaciones,
        idVacunaAplicada: dto.idVacunaAplicada,
        vacunaNombre: extraInfo?.vacunaNombre,
        idMedicamentoRecetado: dto.idMedicamentoRecetado,
        medicamentoNombre: extraInfo?.medicamentoNombre,
      };
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
