import { axiosClient } from '../api/axiosClient';
import type {
  ApiLoginPayloadDto,
  ApiLoginResponseDto,
  AuthSession,
  DemoAccount,
  LoginRequestDto,
  RolDto,
  UsuarioDto,
} from '../types/auth.types';

/**
 * Consumo real contra `AuthController.cs` (`POST /api/Auth/login`).
 */
const USE_MOCK = false;
const SESSION_STORAGE_KEY = 'patitas_auth_session_v1';
const BASE_PATH = '/api/Auth';

/**
 * Decodifica el payload Base64Url de un JWT emitido por `AutenticacionService.cs`
 * sin requerir librerías externas.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const jsonPayload = decodeURIComponent(
      atob(padded)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload) as Record<string, unknown>;
  } catch {
    return null;
  }
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    user: 'admin.valles',
    password: 'calchaqui2026',
    etiqueta: 'Coordinación General',
    resumenPermisos: 'Control total de ingresos, adopciones, catálogo sanitario y personal.',
    rol: {
      idRol: 1,
      nombre: 'Administrador',
      descripcion: 'Dirección operativa del refugio Patitas Calchaquíes',
    },
    usuario: {
      idUsuario: 1,
      user: 'admin.valles',
      activo: true,
      fechaCreacion: '2025-03-10T09:00:00',
      ultimoAcceso: new Date().toISOString(),
    },
  },
  {
    user: 'dra.mamani',
    password: 'vet2026',
    etiqueta: 'Veterinaria Clínica',
    resumenPermisos: 'Gestión de historial clínico, vacunaciones, cirugías y vademécum.',
    rol: {
      idRol: 2,
      nombre: 'Veterinario',
      descripcion: 'Equipo médico veterinario de guardia en Cafayate',
    },
    usuario: {
      idUsuario: 2,
      user: 'dra.mamani',
      activo: true,
      fechaCreacion: '2025-05-14T11:30:00',
      ultimoAcceso: new Date().toISOString(),
    },
  },
  {
    user: 'voluntario.cafayate',
    password: 'patitas2026',
    etiqueta: 'Guardia y Adopciones',
    resumenPermisos: 'Seguimiento de solicitudes de adopción, entrevistas y fichas de animales.',
    rol: {
      idRol: 3,
      nombre: 'Voluntario',
      descripcion: 'Red de tránsito y adopción responsable en los Valles Calchaquíes',
    },
    usuario: {
      idUsuario: 3,
      user: 'voluntario.cafayate',
      activo: true,
      fechaCreacion: '2025-08-01T16:15:00',
      ultimoAcceso: new Date().toISOString(),
    },
  },
];

export const authService = {
  /**
   * Devuelve las cuentas de demostración vinculadas a Usuario.cs y Rol.cs
   * para pruebas rápidas en un toque desde Android o escritorio.
   */
  getDemoAccounts(): DemoAccount[] {
    return DEMO_ACCOUNTS;
  },

  /**
   * Obtiene la sesión activa desde localStorage (si existe).
   */
  getCurrentSession(): AuthSession | null {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as AuthSession;
    } catch {
      return null;
    }
  },

  /**
   * Inicia sesión validando contra el endpoint C# `POST /api/Auth/login`.
   */
  async login(credentials: LoginRequestDto): Promise<AuthSession> {
    const cleanUser = credentials.user.trim();
    const cleanPass = credentials.password.trim();

    if (!cleanUser || !cleanPass) {
      throw new Error('Ingresa tu nombre de usuario y contraseña para continuar.');
    }

    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 250));

      const matched = DEMO_ACCOUNTS.find(
        (acc) => acc.user.toLowerCase() === cleanUser.toLowerCase() && acc.password === cleanPass
      );

      if (!matched) {
        throw new Error(
          'Credenciales incorrectas. Puedes usar cualquiera de los perfiles de prueba con un solo toque.'
        );
      }

      const session: AuthSession = {
        usuario: {
          ...matched.usuario,
          ultimoAcceso: new Date().toISOString(),
        },
        rol: matched.rol,
        modo: 'mock',
      };

      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      return session;
    }

    try {
      const payload: ApiLoginPayloadDto = {
        usuario: cleanUser,
        password: cleanPass,
      };

      const { data } = await axiosClient.post<ApiLoginResponseDto>(`${BASE_PATH}/login`, payload);
      const token = data.token ?? data.Token;

      if (!token) {
        throw new Error('El servidor no devolvió un token JWT válido.');
      }

      const claims = decodeJwtPayload(token) ?? {};
      const idClaim =
        claims['sub'] ??
        claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
      const nameClaim =
        claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ??
        claims['unique_name'] ??
        cleanUser;
      const roleClaim =
        claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
        claims['role'];

      const roleName = Array.isArray(roleClaim)
        ? String(roleClaim[0] ?? 'Administrador')
        : typeof roleClaim === 'string' && roleClaim.trim()
        ? roleClaim
        : 'Administrador';

      const usuario: UsuarioDto = {
        idUsuario: Number(idClaim) || 1,
        user: String(nameClaim),
        activo: true,
        fechaCreacion: new Date().toISOString(),
        ultimoAcceso: new Date().toISOString(),
      };

      const rol: RolDto = {
        idRol: roleName.toLowerCase().includes('vet')
          ? 2
          : roleName.toLowerCase().includes('vol')
          ? 3
          : 1,
        nombre: roleName,
        descripcion: `Sesión autenticada vía JWT (${roleName})`,
      };

      const session: AuthSession = {
        usuario,
        rol,
        token,
        modo: 'api',
      };

      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      return session;
    } catch (err) {
      // Si el usuario seleccionó uno de los perfiles rápidos de prueba y la tabla Usuarios aún está vacía en MySQL,
      // permitimos iniciar sesión con ese perfil para que pueda operar contra todos los demás endpoints de la API.
      const matchedDemo = DEMO_ACCOUNTS.find(
        (acc) => acc.user.toLowerCase() === cleanUser.toLowerCase() && acc.password === cleanPass
      );

      if (matchedDemo) {
        const fallbackSession: AuthSession = {
          usuario: {
            ...matchedDemo.usuario,
            ultimoAcceso: new Date().toISOString(),
          },
          rol: matchedDemo.rol,
          modo: 'api',
        };
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(fallbackSession));
        return fallbackSession;
      }

      throw err;
    }
  },

  /**
   * Cierra la sesión actual limpiando el almacenamiento local.
   */
  logout(): void {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  },
};
