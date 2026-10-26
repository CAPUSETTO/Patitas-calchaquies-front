/**
 * Tipos de Autenticación y Autorización.
 * Espejo de las entidades C# en PatitasCalchaquies.Core.Entities:
 * - Usuario.cs (IdUsuario, User, PasswordHash, Activo, FechaCreacion, UltimoAcceso)
 * - Rol.cs (IdRol, Nombre, descripcion)
 * - Usuario_Rol.cs (IdRol, IdUsuario)
 */

export interface RolDto {
  idRol: number;
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
}
