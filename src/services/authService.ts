import { axiosClient } from '../api/axiosClient';
import type { AuthSession, DemoAccount, LoginRequestDto } from '../types/auth.types';

/**
 * Cambia USE_MOCK a false cuando implementes AuthController o UsuarioController
 * en tu API C# (por ejemplo: POST /api/Auth/login).
 */
const USE_MOCK = true;
const SESSION_STORAGE_KEY = 'patitas_auth_session_v1';

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
   * Inicia sesión validando contra el Mock local o contra el endpoint C# POST /api/Auth/login.
   */
  async login(credentials: LoginRequestDto): Promise<AuthSession> {
    const cleanUser = credentials.user.trim().toLowerCase();
    const cleanPass = credentials.password.trim();

    if (!cleanUser || !cleanPass) {
      throw new Error('Ingresa tu nombre de usuario y contraseña para continuar.');
    }

    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 250));

      const matched = DEMO_ACCOUNTS.find(
        (acc) => acc.user.toLowerCase() === cleanUser && acc.password === cleanPass
      );

      if (!matched) {
        throw new Error(
          'Credenciales incorrectas. Puedes usar cualquiera de los perfiles de prueba con un solo toque.'
        );
      }

      if (!matched.usuario.activo) {
        throw new Error('Esta cuenta de usuario se encuentra inactiva en el sistema.');
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

    // Llamada real para cuando agregues AuthController en tu API C#
    const { data } = await axiosClient.post<AuthSession>('/Auth/login', {
      user: credentials.user.trim(),
      password: credentials.password,
    });

    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data));
    return data;
  },

  /**
   * Cierra la sesión actual limpiando el almacenamiento local.
   */
  logout(): void {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  },
};
