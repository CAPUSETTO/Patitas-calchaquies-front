import { axiosClient } from '../api/axiosClient';
import {
  AnimalDto,
  AnimalCrearDto,
  AnimalActualizarDto,
  ESTADOS_ANIMAL,
} from '../types/animal.types';

const BASE_PATH = '/api/Animal';
const STORAGE_KEY = 'patitas_calchaquies_animales_v1';

// Semilla inicial realista de animales del refugio
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
    fotoUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
    observaciones: 'Rescatado cerca de la plaza de Cafayate. Es juguetón, sociable con niños y dócil.',
  },
  {
    idAnimal: 2,
    nombre: 'Luna',
    codigoIdentificacion: 'FEL-2026-002',
    fechaIngreso: '2026-09-04',
    castrado: true,
    idEspecie: 2,
    idRaza: 2,
    razaNombre: 'Común Europeo',
    idSexo: 2,
    idEstado: 1,
    estadoNombre: 'Disponible para Adopción',
    fotoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
    observaciones: 'Gatita tranquila, ronronea mucho. Acostumbrada a vivir en interiores.',
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
    fotoUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=600&q=80',
    observaciones: 'Ingresó con renguera en pata delantera derecha. En tratamiento con analgésicos.',
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
    fotoUrl: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=600&q=80',
    observaciones: 'Adoptada por familia en Tafí del Valle. Seguimiento activo excelente.',
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
  async getAll(): Promise<AnimalDto[]> {
    if (!USE_MOCK) {
      const res = await axiosClient.get<AnimalDto[]>(BASE_PATH);
      return res.data;
    }
    await new Promise((r) => setTimeout(r, 250)); // Simula latencia de red
    return obtenerAlmacenados();
  },

  async getById(id: number): Promise<AnimalDto> {
    if (!USE_MOCK) {
      const res = await axiosClient.get<AnimalDto>(`${BASE_PATH}/${id}`);
      return res.data;
    }
    await new Promise((r) => setTimeout(r, 200));
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
    await new Promise((r) => setTimeout(r, 300));
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
          ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80'
          : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80'),
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
    await new Promise((r) => setTimeout(r, 300));
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
    await new Promise((r) => setTimeout(r, 250));
    const lista = obtenerAlmacenados().filter((x) => x.idAnimal !== id);
    guardarAlmacenados(lista);
  },
};
