import { axiosClient } from '../api/axiosClient';
import {
  AnimalDto,
  AnimalCrearDto,
  AnimalActualizarDto,
  SectorDto,
  VeterinarioDto,
  ESTADOS_ANIMAL,
} from '../types/animal.types';

const BASE_PATH = '/api/Animal';
const STORAGE_KEY = 'patitas_calchaquies_animales_v2';

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

// Bandera para alternar entre Mock y API real cuando el usuario termine su AnimalController
const USE_MOCK = true;

export const animalService = {
  getSectores(): SectorDto[] {
    return SECTORES_REFUGIO;
  },

  getVeterinarios(): VeterinarioDto[] {
    return EQUIPO_VETERINARIO;
  },

  async getAll(): Promise<AnimalDto[]> {
    if (!USE_MOCK) {
      const res = await axiosClient.get<AnimalDto[]>(BASE_PATH);
      return res.data;
    }
    await new Promise((r) => setTimeout(r, 200));
    return obtenerAlmacenados();
  },

  async getById(id: number): Promise<AnimalDto> {
    if (!USE_MOCK) {
      const res = await axiosClient.get<AnimalDto>(`${BASE_PATH}/${id}`);
      return res.data;
    }
    await new Promise((r) => setTimeout(r, 150));
    const lista = obtenerAlmacenados();
    const item = lista.find((a) => a.idAnimal === id);
    if (!item) throw new Error(`Animal con ID ${id} no encontrado.`);
    return item;
  },

  async crear(dto: AnimalCrearDto): Promise<AnimalDto> {
    if (!USE_MOCK) {
      const res = await axiosClient.post<AnimalDto>(BASE_PATH, dto);
      return res.data;
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
      const res = await axiosClient.put<AnimalDto>(`${BASE_PATH}/${id}`, dto);
      return res.data;
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
