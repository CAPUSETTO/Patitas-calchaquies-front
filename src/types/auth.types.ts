/**
 * Tipos de Autenticación, Autorización por Roles (RBAC) y Gestión de Operadores.
 * Espejo de las entidades C# en PatitasCalchaquies.Core.Entities:
 * - Usuario.cs (IdUsuario, User, PasswordHash, Activo, FechaCreacion, UltimoAcceso)
 * - Rol.cs (IdRol, Nombre, descripcion)
 * - Usuario_Rol.cs (IdRol, IdUsuario)
 * - Veterinario.cs (IdVeterinario, Matricula, Nombre, Apellido, Telefono)
 */

export type PermisoSistema =
  | 'GESTIONAR_EQUIPO'
  | 'GESTIONAR_CLINICA'
  | 'GESTIONAR_ADOPCIONES'
  | 'GESTIONAR_CENSO'
  | 'GESTIONAR_CATALOGOS';

export interface RolDto {
  idRol: number; // 1: Administrador, 2: Veterinario, 3: Voluntario
  nombre: string;
  descripcion?: string | null;
}

export interface UsuarioDto {
  idUsuario: number;
  user: string;
  activo: boolean;
  fechaCreacion: string;
  ultimoAcceso?: string | null;
}

export interface UsuarioRolDto {
  idRol: number;
  idUsuario: number;
}

export interface DatosProfesionalesVeterinario {
  idVeterinario?: number;
  matricula: string;
  nombre: string;
  apellido: string;
  telefono: string;
}

export interface LoginRequestDto {
  user: string;
  password: string;
}

/**
 * Payload exacto esperado por AuthController.cs (`POST /api/Auth/login`).
 */
export interface ApiLoginPayloadDto {
  usuario: string;
  password: string;
}

/**
 * Respuesta de `POST /api/Auth/login` (`Ok(new { Token = token })`).
 */
export interface ApiLoginResponseDto {
  token?: string;
  Token?: string;
}

export interface UsuarioCrearDto {
  user: string;
  passwordHash: string;
  activo: boolean;
  fechaCreacion: string;
  ultimoAcceso?: string | null;
}

export interface AuthSession {
  usuario: UsuarioDto;
  rol: RolDto;
  token?: string;
  modo: 'mock' | 'api';
}

export interface DemoAccount {
  user: string;
  password: string;
  etiqueta: string;
  resumenPermisos: string;
  rol: RolDto;
  usuario: UsuarioDto;
  veterinario?: DatosProfesionalesVeterinario;
}

export interface OperadorSistemaDto {
  idUsuario: number;
  user: string;
  password?: string;
  nombreCompleto: string;
  etiquetaArea: string;
  resumenPermisos: string;
  activo: boolean;
  fechaCreacion: string;
  ultimoAcceso?: string | null;
  rol: RolDto;
  veterinario?: DatosProfesionalesVeterinario;
}

export interface OperadorCrearDto {
  user: string;
  password: string;
  idRol: number; // 1: Administrador, 2: Veterinario, 3: Voluntario
  nombre: string;
  apellido: string;
  etiquetaArea?: string;
  activo?: boolean;
  // Campos específicos cuando idRol === 2 (Veterinario)
  matricula?: string;
  telefono?: string;
}

export interface OperadorActualizarDto {
  idUsuario: number;
  user: string;
  password?: string; // Opcional al editar si no desea cambiar la clave
  idRol: number;
  nombre: string;
  apellido: string;
  etiquetaArea?: string;
  activo: boolean;
  matricula?: string;
  telefono?: string;
}

export const ROLES_SISTEMA: RolDto[] = [
  {
    idRol: 1,
    nombre: 'Administrador',
    descripcion: 'Coordinación General · Control total de ingresos, adopciones, clínica y alta de personal',
  },
  {
    idRol: 2,
    nombre: 'Veterinario',
    descripcion: 'Veterinaria Clínica · Gestión de historial clínico, vacunaciones, cirugías y vademécum',
  },
  {
    idRol: 3,
    nombre: 'Voluntario',
    descripcion: 'Guardia y Adopciones · Seguimiento de solicitudes de adopción, entrevistas y fichas',
  },
];
