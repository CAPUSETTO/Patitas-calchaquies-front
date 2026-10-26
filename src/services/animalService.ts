import { axiosClient } from '../api/axiosClient';
import {
  AnimalDto,
  AnimalCrearDto,
  AnimalActualizarDto,
  SectorDto,
  PredioDto,
  VeterinarioDto,
  IngresoAnimalDto,
  AlojamientoAnimalDto,
  PlanAlimentacionDto,
  EsterilizacionDto,
  ESTADOS_ANIMAL,
} from '../types/animal.types';
import { RazaDto } from '../types/raza.types';

const BASE_PATH = '/api/Animales';
const STORAGE_KEY = 'patitas_calchaquies_animales_v2';

interface FotoAnimalApiDto {
  idFotoAnimal: number;
  idAnimal: number;
  ruta: string;
  esPrincipal: boolean;
  fecha: string;
}

interface EstadoAnimalApiDto {
  idEstadoAnimal: number;
  nombre: string;
}

interface SexoApiDto {
  idSexo: number;
  nombre: string;
}

interface EspecieApiDto {
  idEspecie: number;
  nombre: string;
}

interface SectorApiDto {
  idSector: number;
  nombre: string;
  capacidad: number;
  descripcion?: string | null;
  idPredio: number;
}

interface AlojamientoApiDto {
  idAlojamiento: number;
  idAnimal: number;
  idSector: number;
  fechaIngreso: string;
  fechaSalida?: string | null;
  observacion?: string | null;
}

interface EsterilizacionApiDto {
  idEsterilizacion: number;
  idAnimal: number;
  idVeterinario: number;
  fecha: string;
  tipo: string;
  observacion?: string | null;
}

export const SECTORES_REFUGIO: SectorDto[] = [
  {
    idSector: 1,
    nombre: 'Sector A · Caniles de Sol',
    capacidad: 12,
    descripcion: 'Patios amplios con sombra de algarrobo para caninos adultos rehabilitados.',
    idPredio: 1,
    predioNombre: 'Predio Central Ruta 40 · Cafayate',
  },
  {
    idSector: 2,
    nombre: 'Sector B · Gatera Calchaquí',
    capacidad: 10,
    descripcion: 'Recinto cerrado climatizado con estantes en altura y jardín seguro para felinos.',
    idPredio: 1,
    predioNombre: 'Predio Central Ruta 40 · Cafayate',
  },
  {
    idSector: 3,
    nombre: 'Sector C · Guardia Post-Quirúrgica',
    capacidad: 6,
    descripcion: 'Boxes individuales junto al consultorio para recuperación de cirugías y traumatología.',
    idPredio: 1,
    predioNombre: 'Predio Central Ruta 40 · Cafayate',
  },
  {
    idSector: 4,
    nombre: 'Posta Sanitaria San Carlos',
    capacidad: 8,
    descripcion: 'Hogar de tránsito comunitario y primera recepción para rescates del norte del valle.',
    idPredio: 2,
    predioNombre: 'Anexo Comunitario · San Carlos',
  },
];

export const EQUIPO_VETERINARIO: VeterinarioDto[] = [
  {
    idVeterinario: 1,
    matricula: 'MP-SAL-0418',
    nombre: 'Sofía',
    apellido: 'Mamaní',
    telefono: '+54 3868 421900',
  },
  {
    idVeterinario: 2,
    matricula: 'MP-SAL-0291',
    nombre: 'Lucas',
    apellido: 'Tolaba',
    telefono: '+54 3868 438810',
  },
];

// Semilla inicial enriquecida con las entidades de PatitasCalchaquies.Core.Entities
const SEMILLA_ANIMALES: AnimalDto[] = [
  {
    idAnimal: 1,
    nombre: 'Manchitas',
    codigoIdentificacion: 'CAN-2026-001',
    fechaIngreso: '2026-08-10',
    castrado: true,
    idEspecie: 1,
    idRaza: 1,
    razaNombre: 'Mestizo Calchaquí',
    idSexo: 1,
    idEstado: 1,
    estadoNombre: 'Disponible para Adopción',
    fotoUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
    observaciones:
      'Rescatado en la rotonda de acceso a Cafayate (Ruta 40). Compañero atento, de temperamento equilibrado, convive sin conflictos con otros perros y niños.',
    ingreso: {
      idIngresoAnimal: 101,
      idAnimal: 1,
      fecha: '2026-08-10',
      motivo: 'Abandono en banquina con deshidratación leve',
      tipoIngreso: 'Rescate en Ruta',
      lugarOrigen: 'Ruta Nacional 40 Km 4340 · Acceso Sur Cafayate',
      observacion: 'Asistido por patrulla voluntaria de fin de semana.',
    },
    alojamiento: {
      idAlojamiento: 201,
      idAnimal: 1,
      idSector: 1,
      sectorNombre: 'Sector A · Caniles de Sol',
      predioNombre: 'Predio Central Ruta 40 · Cafayate',
      fechaIngreso: '2026-08-14',
      observacion: 'Comparte patio recreativo matutino.',
    },
    planAlimentacion: {
      idPlan: 301,
      idAnimal: 1,
      tipoAlimento: 'Balanceado Adulto Mediano + Proteína cocida',
      cantidad: 340,
      frecuencia: '2 raciones diarias (08:30 y 18:30 hs)',
      fechaDesde: '2026-08-15',
    },
    esterilizacion: {
      idEsterilizacion: 401,
      idAnimal: 1,
      idVeterinario: 1,
      veterinarioNombre: 'Dra. Sofía Mamaní',
      veterinarioMatricula: 'MP-SAL-0418',
      fecha: '2026-08-25',
      tipo: 'Orquiectomía bilateral',
      observacion: 'Cicatrización completa con alta médica definitiva.',
    },
  },
  {
    idAnimal: 2,
    nombre: 'Luna',
    codigoIdentificacion: 'FEL-2026-002',
    fechaIngreso: '2026-09-04',
    castrado: true,
    idEspecie: 2,
    idRaza: 2,
    razaNombre: 'Común Europeo Atigrado',
    idSexo: 2,
    idEstado: 1,
    estadoNombre: 'Disponible para Adopción',
    fotoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
    observaciones:
      'Encontrada en un galpón de vasijas en Animaná. Extremadamente limpia, usa bandeja sanitaria desde el primer día y busca compañía tranquila en interiores.',
    ingreso: {
      idIngresoAnimal: 102,
      idAnimal: 2,
      fecha: '2026-09-04',
      motivo: 'Camada sin madre hallada por trabajadores rurales',
      tipoIngreso: 'Aviso Comunitario',
      lugarOrigen: 'Paraje El Divisadero · Animaná',
      observacion: 'Ingresó con 1.9 kg, hoy en peso óptimo (3.4 kg).',
    },
    alojamiento: {
      idAlojamiento: 202,
      idAnimal: 2,
      idSector: 2,
      sectorNombre: 'Sector B · Gatera Calchaquí',
      predioNombre: 'Predio Central Ruta 40 · Cafayate',
      fechaIngreso: '2026-09-06',
      observacion: 'Habita el módulo soleado con rascadores de madera.',
    },
    planAlimentacion: {
      idPlan: 302,
      idAnimal: 2,
      tipoAlimento: 'Balanceado Felino Urinary Care',
      cantidad: 75,
      frecuencia: '3 tomas fraccionadas',
      fechaDesde: '2026-09-10',
    },
    esterilizacion: {
      idEsterilizacion: 402,
      idAnimal: 2,
      idVeterinario: 1,
      veterinarioNombre: 'Dra. Sofía Mamaní',
      veterinarioMatricula: 'MP-SAL-0418',
      fecha: '2026-09-19',
      tipo: 'Ovariohisterectomía',
      observacion: 'Puntos retirados sin novedad.',
    },
  },
  {
    idAnimal: 5,
    nombre: 'Chañar',
    codigoIdentificacion: 'CAN-2026-005',
    fechaIngreso: '2026-09-28',
    castrado: true,
    idEspecie: 1,
    idRaza: 1,
    razaNombre: 'Mestizo Ovejero del Valle',
    idSexo: 1,
    idEstado: 1,
    estadoNombre: 'Disponible para Adopción',
    fotoUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80',
    observaciones:
      'Perro guardián pero sumamente afectuoso con su círculo familiar. Ideal para casas con fondo cerrado o fincas familiares en el valle.',
    ingreso: {
      idIngresoAnimal: 105,
      idAnimal: 5,
      fecha: '2026-09-28',
      motivo: 'Familia anterior se mudó y no pudo trasladarlo',
      tipoIngreso: 'Recepción Directa',
      lugarOrigen: 'Barrio San Isidro · San Carlos',
      observacion: 'Ingresó con libreta de vacunación parcial que fue completada en el refugio.',
    },
    alojamiento: {
      idAlojamiento: 205,
      idAnimal: 5,
      idSector: 4,
      sectorNombre: 'Posta Sanitaria San Carlos',
      predioNombre: 'Anexo Comunitario · San Carlos',
      fechaIngreso: '2026-09-28',
      observacion: 'Acostumbrado a paseos con correa dos veces al día.',
    },
    planAlimentacion: {
      idPlan: 305,
      idAnimal: 5,
      tipoAlimento: 'Balanceado Alta Energía Adulto',
      cantidad: 420,
      frecuencia: '2 raciones diarias',
      fechaDesde: '2026-09-29',
    },
    esterilizacion: {
      idEsterilizacion: 405,
      idAnimal: 5,
      idVeterinario: 2,
      veterinarioNombre: 'Dr. Lucas Tolaba',
      veterinarioMatricula: 'MP-SAL-0291',
      fecha: '2026-10-04',
      tipo: 'Orquiectomía bilateral',
      observacion: 'Alta quirúrgica otorgada el 12/10/2026.',
    },
  },
  {
    idAnimal: 3,
    nombre: 'Rocky',
    codigoIdentificacion: 'CAN-2026-003',
    fechaIngreso: '2026-09-15',
    castrado: false,
    idEspecie: 1,
    idRaza: 1,
    razaNombre: 'Cruza Pastor',
    idSexo: 1,
    idEstado: 2,
    estadoNombre: 'En Tratamiento / Observación',
    fotoUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80',
    observaciones:
      'Ingresó con lesión traumatológica leve en miembro anterior derecho. En última semana de fisioterapia y antiinflamatorios; disponible para pre-adopción.',
    ingreso: {
      idIngresoAnimal: 103,
      idAnimal: 3,
      fecha: '2026-09-15',
      motivo: 'Traumatismo vial leve en zona de mirador',
      tipoIngreso: 'Guardia de Emergencia',
      lugarOrigen: 'Quebrada de las Conchas · Km 18',
      observacion: 'Sin fractura ósea en radiografía de control.',
    },
    alojamiento: {
      idAlojamiento: 203,
      idAnimal: 3,
      idSector: 3,
      sectorNombre: 'Sector C · Guardia Post-Quirúrgica',
      predioNombre: 'Predio Central Ruta 40 · Cafayate',
      fechaIngreso: '2026-09-15',
      observacion: 'Reposo supervisado por el Dr. Lucas Tolaba.',
    },
    planAlimentacion: {
      idPlan: 303,
      idAnimal: 3,
      tipoAlimento: 'Dieta Hiperproteica con Suplemento Condroprotector',
      cantidad: 380,
      frecuencia: '2 raciones diarias con medicación matutina',
      fechaDesde: '2026-09-16',
    },
  },
  {
    idAnimal: 4,
    nombre: 'Canela',
    codigoIdentificacion: 'CAN-2026-004',
    fechaIngreso: '2026-07-22',
    castrado: true,
    idEspecie: 1,
    idRaza: 1,
    razaNombre: 'Mestiza',
    idSexo: 2,
    idEstado: 3,
    estadoNombre: 'Adoptado',
    fotoUrl: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80',
    observaciones:
      'Adoptada por la familia Álvarez en Amaicha del Valle. Primer control de SeguimientoAdopcion completado con resultado sobresaliente.',
    ingreso: {
      idIngresoAnimal: 104,
      idAnimal: 4,
      fecha: '2026-07-22',
      motivo: 'Hallada durante helada invernal',
      tipoIngreso: 'Operativo Invernal',
      lugarOrigen: 'Puente Río Santa María · Cafayate',
    },
  },
];

function obtenerAlmacenados(): AnimalDto[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEMILLA_ANIMALES));
      return SEMILLA_ANIMALES;
    }
    return JSON.parse(raw) as AnimalDto[];
  } catch {
    return SEMILLA_ANIMALES;
  }
}

function guardarAlmacenados(lista: AnimalDto[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
  } catch {
    // Si localStorage no está disponible
  }
}

// Consumo real contra AnimalesController.cs (`/api/Animales`) y controladores vinculados
const USE_MOCK = false;

let cachedSectores: SectorDto[] = SECTORES_REFUGIO;
let cachedVeterinarios: VeterinarioDto[] = EQUIPO_VETERINARIO;
let catalogosVerificados = false;

async function safeGetList<T>(url: string): Promise<T[]> {
  try {
    const res = await axiosClient.get<T[]>(url);
    return Array.isArray(res.data) ? res.data : [];
  } catch {
    return [];
  }
}

async function asegurarCatalogosBase(): Promise<void> {
  if (catalogosVerificados) return;
  catalogosVerificados = true;

  try {
    const [especies, sexos, estados] = await Promise.all([
      safeGetList<EspecieApiDto>('/api/Especies'),
      safeGetList<SexoApiDto>('/api/Sexos'),
      safeGetList<EstadoAnimalApiDto>('/api/EstadosAnimales'),
    ]);

    if (especies.length === 0) {
      for (const nombre of ['Canino', 'Felino']) {
        try {
          await axiosClient.post('/api/Especies', { nombre });
        } catch {
          // Ignorar
        }
      }
    }

    if (sexos.length === 0) {
      for (const nombre of ['Macho', 'Hembra']) {
        try {
          await axiosClient.post('/api/Sexos', { nombre });
        } catch {
          // Ignorar
        }
      }
    }

    if (estados.length === 0) {
      for (const nombre of ['Disponible', 'En Tratamiento', 'Adoptado', 'En Tránsito']) {
        try {
          await axiosClient.post('/api/EstadosAnimales', { nombre });
        } catch {
          // Ignorar
        }
      }
    }
  } catch {
    // Continuar incluso si algún endpoint de catálogo no responde
  }
}

async function enriquecerAnimales(animalesBase: AnimalDto[]): Promise<AnimalDto[]> {
  if (animalesBase.length === 0) return [];

  const [
    razas,
    estados,
    fotos,
    ingresos,
    alojamientos,
    sectoresApi,
    prediosApi,
    planes,
    esterilizaciones,
    veterinariosApi,
  ] = await Promise.all([
    safeGetList<RazaDto>('/api/Raza'),
    safeGetList<EstadoAnimalApiDto>('/api/EstadosAnimales'),
    safeGetList<FotoAnimalApiDto>('/api/FotosAnimales'),
    safeGetList<IngresoAnimalDto>('/api/IngresosAnimales'),
    safeGetList<AlojamientoApiDto>('/api/AlojamientosAnimales'),
    safeGetList<SectorApiDto>('/api/Sectores'),
    safeGetList<PredioDto>('/api/Predios'),
    safeGetList<PlanAlimentacionDto>('/api/PlanesAlimentacion'),
    safeGetList<EsterilizacionApiDto>('/api/Esterilizaciones'),
    safeGetList<VeterinarioDto>('/api/Veterinarios'),
  ]);

  if (sectoresApi.length > 0) {
    cachedSectores = sectoresApi.map((s) => {
      const predio = prediosApi.find((p) => p.idPredio === s.idPredio);
      return {
        ...s,
        predioNombre: predio?.nombre || 'Predio Central Ruta 40 · Cafayate',
      };
    });
  }

  if (veterinariosApi.length > 0) {
    cachedVeterinarios = veterinariosApi;
  }

  return animalesBase.map((animal) => {
    const raza = razas.find((r) => r.idRaza === animal.idRaza);
    const estadoApi = estados.find((e) => e.idEstadoAnimal === animal.idEstado);
    const estadoFallback = ESTADOS_ANIMAL.find((e) => e.idEstado === (animal.idEstado ?? 1));
    const fotosAnimal = fotos.filter((f) => f.idAnimal === animal.idAnimal);
    const foto = fotosAnimal.find((f) => f.esPrincipal) ?? fotosAnimal[0];
    const ingreso = ingresos.find((i) => i.idAnimal === animal.idAnimal);
    const alojApi = alojamientos.find((a) => a.idAnimal === animal.idAnimal);
    const plan = planes.find((p) => p.idAnimal === animal.idAnimal);
    const estApi = esterilizaciones.find((e) => e.idAnimal === animal.idAnimal);

    let alojamiento: AlojamientoAnimalDto | undefined = animal.alojamiento;
    if (alojApi) {
      const sector =
        cachedSectores.find((s) => s.idSector === alojApi.idSector) ?? SECTORES_REFUGIO[0];
      alojamiento = {
        ...alojApi,
        sectorNombre: sector.nombre,
        predioNombre: sector.predioNombre,
      };
    }

    let esterilizacion: EsterilizacionDto | undefined = animal.esterilizacion;
    if (estApi) {
      const vet =
        cachedVeterinarios.find((v) => v.idVeterinario === estApi.idVeterinario) ??
        EQUIPO_VETERINARIO[0];
      esterilizacion = {
        ...estApi,
        veterinarioNombre: `${vet.nombre} ${vet.apellido}`.trim(),
        veterinarioMatricula: vet.matricula,
      };
    }

    const defaultPhoto =
      animal.idEspecie === 2
        ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80'
        : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80';

    return {
      ...animal,
      fechaIngreso: animal.fechaIngreso ? animal.fechaIngreso.split('T')[0] : animal.fechaIngreso,
      razaNombre: animal.razaNombre || raza?.nombre || undefined,
      estadoNombre:
        animal.estadoNombre ||
        estadoFallback?.nombre ||
        estadoApi?.nombre ||
        'Disponible para Adopción',
      fotoUrl: animal.fotoUrl || foto?.ruta || defaultPhoto,
      observaciones:
        animal.observaciones ||
        ingreso?.observacion ||
        alojApi?.observacion ||
        undefined,
      ingreso,
      alojamiento,
      planAlimentacion: plan ?? animal.planAlimentacion,
      esterilizacion,
    };
  });
}

export const animalService = {
  getSectores(): SectorDto[] {
    return cachedSectores;
  },

  getVeterinarios(): VeterinarioDto[] {
    return cachedVeterinarios;
  },

  async fetchVeterinarios(): Promise<VeterinarioDto[]> {
    const lista = await safeGetList<VeterinarioDto>('/api/Veterinarios');
    if (lista.length > 0) {
      cachedVeterinarios = lista;
      return lista;
    }
    return cachedVeterinarios;
  },

  async getAll(): Promise<AnimalDto[]> {
    if (!USE_MOCK) {
      const res = await axiosClient.get<AnimalDto[]>(BASE_PATH);
      return await enriquecerAnimales(res.data);
    }
    await new Promise((r) => setTimeout(r, 200));
    return obtenerAlmacenados();
  },

  async getById(id: number): Promise<AnimalDto> {
    if (!USE_MOCK) {
      const res = await axiosClient.get<AnimalDto>(`${BASE_PATH}/${id}`);
      const [enriquecido] = await enriquecerAnimales([res.data]);
      return enriquecido;
    }
    await new Promise((r) => setTimeout(r, 150));
    const lista = obtenerAlmacenados();
    const item = lista.find((a) => a.idAnimal === id);
    if (!item) throw new Error(`Animal con ID ${id} no encontrado.`);
    return item;
  },

  async crear(dto: AnimalCrearDto): Promise<AnimalDto> {
    if (!USE_MOCK) {
      await asegurarCatalogosBase();

      const fechaIso = dto.fechaIngreso.includes('T')
        ? dto.fechaIngreso
        : `${dto.fechaIngreso}T00:00:00`;

      const apiPayload = {
        nombre: dto.nombre.trim(),
        codigoIdentificacion: dto.codigoIdentificacion.trim().toUpperCase(),
        fechaIngreso: fechaIso,
        castrado: Boolean(dto.castrado),
        idEspecie: Number(dto.idEspecie),
        idRaza: dto.idRaza && Number(dto.idRaza) > 0 ? Number(dto.idRaza) : null,
        idSexo: dto.idSexo ? Number(dto.idSexo) : 1,
        idEstado: dto.idEstado ? Number(dto.idEstado) : 1,
      };

      const res = await axiosClient.post<AnimalDto>(BASE_PATH, apiPayload);
      const creado = res.data;

      // Persistir foto en FotosAnimalesController si fue provista
      if (dto.fotoUrl?.trim() && creado?.idAnimal) {
        try {
          await axiosClient.post('/api/FotosAnimales', {
            idAnimal: creado.idAnimal,
            ruta: dto.fotoUrl.trim().slice(0, 255),
            esPrincipal: true,
            fecha: fechaIso,
          });
        } catch {
          // No bloquear el alta principal si la tabla secundaria falla
        }
      }

      // Persistir ingreso/observaciones en IngresosAnimalesController si fue provisto
      if (dto.observaciones?.trim() && creado?.idAnimal) {
        try {
          await axiosClient.post('/api/IngresosAnimales', {
            idAnimal: creado.idAnimal,
            fecha: fechaIso,
            motivo: 'Ingreso administrativo',
            tipoIngreso: 'Registro Directo',
            lugarOrigen: 'Valles Calchaquíes',
            observacion: dto.observaciones.trim(),
          });
        } catch {
          // No bloquear el alta principal si la tabla secundaria falla
        }
      }

      const [enriquecido] = await enriquecerAnimales([
        {
          ...creado,
          fotoUrl: dto.fotoUrl?.trim() || undefined,
          observaciones: dto.observaciones?.trim() || undefined,
        },
      ]);
      return enriquecido;
    }

    await new Promise((r) => setTimeout(r, 250));
    const lista = obtenerAlmacenados();
    const nuevoId = lista.length > 0 ? Math.max(...lista.map((x) => x.idAnimal)) + 1 : 1;
    const estadoObj = ESTADOS_ANIMAL.find((e) => e.idEstado === dto.idEstado);

    const nuevo: AnimalDto = {
      ...dto,
      idAnimal: nuevoId,
      estadoNombre: estadoObj?.nombre || 'Disponible para Adopción',
      fotoUrl:
        dto.fotoUrl ||
        (dto.idEspecie === 2
          ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80'
          : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80'),
      alojamiento: {
        idAlojamiento: Date.now(),
        idAnimal: nuevoId,
        idSector: dto.idEspecie === 2 ? 2 : 1,
        sectorNombre:
          dto.idEspecie === 2 ? 'Sector B · Gatera Calchaquí' : 'Sector A · Caniles de Sol',
        predioNombre: 'Predio Central Ruta 40 · Cafayate',
        fechaIngreso: dto.fechaIngreso,
      },
    };
    lista.unshift(nuevo);
    guardarAlmacenados(lista);
    return nuevo;
  },

  async actualizar(id: number, dto: AnimalActualizarDto): Promise<AnimalDto> {
    if (!USE_MOCK) {
      await asegurarCatalogosBase();

      const fechaIso = dto.fechaIngreso.includes('T')
        ? dto.fechaIngreso
        : `${dto.fechaIngreso}T00:00:00`;

      const apiPayload = {
        idAnimal: Number(id),
        nombre: dto.nombre.trim(),
        codigoIdentificacion: dto.codigoIdentificacion.trim().toUpperCase(),
        fechaIngreso: fechaIso,
        castrado: Boolean(dto.castrado),
        idEspecie: Number(dto.idEspecie),
        idRaza: dto.idRaza && Number(dto.idRaza) > 0 ? Number(dto.idRaza) : null,
        idSexo: dto.idSexo ? Number(dto.idSexo) : 1,
        idEstado: dto.idEstado ? Number(dto.idEstado) : 1,
      };

      const res = await axiosClient.put<AnimalDto>(`${BASE_PATH}/${id}`, apiPayload);

      // Sincronizar foto si fue provista
      if (dto.fotoUrl?.trim()) {
        try {
          const fotos = await safeGetList<FotoAnimalApiDto>('/api/FotosAnimales');
          const existenteFoto = fotos.find((f) => f.idAnimal === Number(id));
          if (existenteFoto) {
            await axiosClient.put(`/api/FotosAnimales/${existenteFoto.idFotoAnimal}`, {
              idFotoAnimal: existenteFoto.idFotoAnimal,
              idAnimal: Number(id),
              ruta: dto.fotoUrl.trim().slice(0, 255),
              esPrincipal: true,
              fecha: fechaIso,
            });
          } else {
            await axiosClient.post('/api/FotosAnimales', {
              idAnimal: Number(id),
              ruta: dto.fotoUrl.trim().slice(0, 255),
              esPrincipal: true,
              fecha: fechaIso,
            });
          }
        } catch {
          // Ignorar error secundario
        }
      }

      // Sincronizar observaciones en IngresosAnimales si fueron provistas
      if (dto.observaciones !== undefined) {
        try {
          const ingresos = await safeGetList<IngresoAnimalDto>('/api/IngresosAnimales');
          const existenteIngreso = ingresos.find((i) => i.idAnimal === Number(id));
          if (existenteIngreso) {
            await axiosClient.put(`/api/IngresosAnimales/${existenteIngreso.idIngresoAnimal}`, {
              idIngresoAnimal: existenteIngreso.idIngresoAnimal,
              idAnimal: Number(id),
              fecha: existenteIngreso.fecha || fechaIso,
              motivo: (existenteIngreso.motivo || 'Ingreso administrativo').slice(0, 50),
              tipoIngreso: (existenteIngreso.tipoIngreso || 'Registro Directo').slice(0, 50),
              lugarOrigen: (existenteIngreso.lugarOrigen || 'Valles Calchaquíes').slice(0, 50),
              observacion: dto.observaciones?.trim() || null,
            });
          } else if (dto.observaciones?.trim()) {
            await axiosClient.post('/api/IngresosAnimales', {
              idAnimal: Number(id),
              fecha: fechaIso,
              motivo: 'Ingreso administrativo',
              tipoIngreso: 'Registro Directo',
              lugarOrigen: 'Valles Calchaquíes',
              observacion: dto.observaciones.trim(),
            });
          }
        } catch {
          // Ignorar error secundario
        }
      }

      const [enriquecido] = await enriquecerAnimales([
        {
          ...res.data,
          fotoUrl: dto.fotoUrl?.trim() || undefined,
          observaciones: dto.observaciones?.trim() || undefined,
        },
      ]);
      return enriquecido;
    }

    await new Promise((r) => setTimeout(r, 250));
    const lista = obtenerAlmacenados();
    const index = lista.findIndex((x) => x.idAnimal === id);
    if (index === -1) throw new Error(`No se encontró el animal con ID ${id}`);

    const estadoObj = ESTADOS_ANIMAL.find((e) => e.idEstado === dto.idEstado);
    const actualizado: AnimalDto = {
      ...lista[index],
      ...dto,
      estadoNombre: estadoObj?.nombre || lista[index].estadoNombre,
    };
    lista[index] = actualizado;
    guardarAlmacenados(lista);
    return actualizado;
  },

  async eliminar(id: number): Promise<void> {
    if (!USE_MOCK) {
      await axiosClient.delete(`${BASE_PATH}/${id}`);
      return;
    }
    await new Promise((r) => setTimeout(r, 200));
    const lista = obtenerAlmacenados().filter((x) => x.idAnimal !== id);
    guardarAlmacenados(lista);
  },
};
