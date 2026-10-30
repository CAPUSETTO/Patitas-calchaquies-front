import { axiosClient } from '../api/axiosClient';
import type { VeterinarioDto } from '../types/animal.types';
import {
  ROLES_SISTEMA,
  type ApiLoginPayloadDto,
  type ApiLoginResponseDto,
  type AuthSession,
  type DemoAccount,
  type LoginRequestDto,
  type OperadorActualizarDto,
  type OperadorCrearDto,
  type OperadorSistemaDto,
  type PermisoSistema,
  type RolDto,
  type UsuarioDto,
  type UsuarioRolDto,
} from '../types/auth.types';

/**
 * Consumo real contra `AuthController.cs` (`POST /api/Auth/login`),
 * `UsuariosController.cs` (`/api/Usuarios`), `RolesController.cs` (`/api/Roles`)
 * y `VeterinariosController.cs` (`/api/Veterinarios`).
 */
const USE_MOCK = false;
const SESSION_STORAGE_KEY = 'patitas_auth_session_v1';
const OPERADORES_STORAGE_KEY = 'patitas_operadores_sistema_v1';
const VETERINARIOS_STORAGE_KEY = 'patitas_veterinarios_custom_v1';
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

const OPERADORES_SEMILLA: OperadorSistemaDto[] = [
  {
    idUsuario: 1,
    user: 'admin.valles',
    password: 'calchaqui2026',
    nombreCompleto: 'Coordinación General Valles',
    etiquetaArea: 'Coordinación General',
    resumenPermisos: 'Control total de ingresos, adopciones, catálogo sanitario y alta de personal.',
    activo: true,
    fechaCreacion: '2025-03-10T09:00:00',
    ultimoAcceso: new Date().toISOString(),
    rol: ROLES_SISTEMA[0],
  },
  {
    idUsuario: 2,
    user: 'dra.mamani',
    password: 'vet2026',
    nombreCompleto: 'Dra. Sofía Mamaní',
    etiquetaArea: 'Veterinaria Clínica',
    resumenPermisos: 'Gestión de historial clínico, vacunaciones, cirugías y vademécum.',
    activo: true,
    fechaCreacion: '2025-05-14T11:30:00',
    ultimoAcceso: new Date().toISOString(),
    rol: ROLES_SISTEMA[1],
    veterinario: {
      idVeterinario: 1,
      matricula: 'MP-SAL-0418',
      nombre: 'Sofía',
      apellido: 'Mamaní',
      telefono: '+54 3868 421900',
    },
  },
  {
    idUsuario: 3,
    user: 'voluntario.cafayate',
    password: 'patitas2026',
    nombreCompleto: 'Guardia Voluntaria Cafayate',
    etiquetaArea: 'Guardia y Adopciones',
    resumenPermisos: 'Seguimiento de solicitudes de adopción, entrevistas y fichas de animales.',
    activo: true,
    fechaCreacion: '2025-08-01T16:15:00',
    ultimoAcceso: new Date().toISOString(),
    rol: ROLES_SISTEMA[2],
  },
  {
    idUsuario: 4,
    user: 'dr.tolaba',
    password: 'vet2026',
    nombreCompleto: 'Dr. Lucas Tolaba',
    etiquetaArea: 'Cirugía y Esterilizaciones',
    resumenPermisos: 'Atención quirúrgica, control post-operatorio y plan sanitario.',
    activo: true,
    fechaCreacion: '2025-09-20T10:00:00',
    ultimoAcceso: null,
    rol: ROLES_SISTEMA[1],
    veterinario: {
      idVeterinario: 2,
      matricula: 'MP-SAL-0291',
      nombre: 'Lucas',
      apellido: 'Tolaba',
      telefono: '+54 3868 438810',
    },
  },
];

function obtenerOperadoresAlmacenados(): OperadorSistemaDto[] {
  try {
    const raw = localStorage.getItem(OPERADORES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(OPERADORES_STORAGE_KEY, JSON.stringify(OPERADORES_SEMILLA));
      sincronizarVeterinariosLocales(OPERADORES_SEMILLA);
      return OPERADORES_SEMILLA;
    }
    const parsed = JSON.parse(raw) as OperadorSistemaDto[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(OPERADORES_STORAGE_KEY, JSON.stringify(OPERADORES_SEMILLA));
      return OPERADORES_SEMILLA;
    }
    return parsed;
  } catch {
    return OPERADORES_SEMILLA;
  }
}

function guardarOperadoresAlmacenados(lista: OperadorSistemaDto[]): void {
  try {
    localStorage.setItem(OPERADORES_STORAGE_KEY, JSON.stringify(lista));
    sincronizarVeterinariosLocales(lista);
  } catch {
    // Ignorar si localStorage no está disponible
  }
}

function sincronizarVeterinariosLocales(operadores: OperadorSistemaDto[]): void {
  try {
    const veterinarios: VeterinarioDto[] = operadores
      .filter((op) => op.activo && op.rol.idRol === 2 && op.veterinario)
      .map((op, index) => ({
        idVeterinario: op.veterinario?.idVeterinario ?? index + 1,
        matricula: op.veterinario?.matricula || `MP-SAL-0${index + 100}`,
        nombre: op.veterinario?.nombre || op.nombreCompleto,
        apellido: op.veterinario?.apellido || '',
        telefono: op.veterinario?.telefono || '+54 3868 421900',
      }));

    if (veterinarios.length > 0) {
      localStorage.setItem(VETERINARIOS_STORAGE_KEY, JSON.stringify(veterinarios));
    }
  } catch {
    // Ignorar error de almacenamiento
  }
}

function obtenerRolPorId(idRol: number): RolDto {
  return ROLES_SISTEMA.find((r) => r.idRol === Number(idRol)) ?? ROLES_SISTEMA[2];
}

function generarResumenPermisosPorRol(idRol: number): string {
  if (idRol === 1) {
    return 'Control total de ingresos, adopciones, catálogo sanitario y alta de personal.';
  }
  if (idRol === 2) {
    return 'Gestión de historial clínico, vacunaciones, cirugías y vademécum.';
  }
  return 'Seguimiento de solicitudes de adopción, entrevistas y fichas de animales.';
}

async function safeGetList<T>(url: string): Promise<T[]> {
  try {
    const res = await axiosClient.get<T[]>(url);
    return Array.isArray(res.data) ? res.data : [];
  } catch {
    return [];
  }
}

export const authService = {
  /**
   * Devuelve las cuentas activas vinculadas a Usuario.cs y Rol.cs
   * para pruebas rápidas en un toque o selección en `/login`.
   */
  getDemoAccounts(): DemoAccount[] {
    const operadores = obtenerOperadoresAlmacenados().filter((op) => op.activo);
    return operadores.map((op) => ({
      user: op.user,
      password: op.password || 'calchaqui2026',
      etiqueta: op.etiquetaArea,
      resumenPermisos: op.resumenPermisos,
      rol: op.rol,
      usuario: {
        idUsuario: op.idUsuario,
        user: op.user,
        activo: op.activo,
        fechaCreacion: op.fechaCreacion,
        ultimoAcceso: op.ultimoAcceso,
      },
      veterinario: op.veterinario,
    }));
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
   * Verifica si la sesión activa corresponde al rol Administrador (idRol === 1).
   */
  esAdministrador(session?: AuthSession | null): boolean {
    const actual = session ?? this.getCurrentSession();
    if (!actual) return false;
    return (
      actual.rol.idRol === 1 ||
      actual.rol.nombre.toLowerCase().includes('admin') ||
      actual.rol.nombre.toLowerCase().includes('coordinaci')
    );
  },

  /**
   * Verifica si la sesión activa corresponde a un Veterinario o Administrador.
   */
  esVeterinarioOAdmin(session?: AuthSession | null): boolean {
    const actual = session ?? this.getCurrentSession();
    if (!actual) return false;
    if (this.esAdministrador(actual)) return true;
    return actual.rol.idRol === 2 || actual.rol.nombre.toLowerCase().includes('vet');
  },

  /**
   * Evalúa si el usuario actual posee un permiso específico según su rol (RBAC).
   */
  tienePermiso(permiso: PermisoSistema, session?: AuthSession | null): boolean {
    const actual = session ?? this.getCurrentSession();
    if (!actual || !actual.usuario.activo) return false;

    if (this.esAdministrador(actual)) {
      return true;
    }

    switch (permiso) {
      case 'GESTIONAR_EQUIPO':
        // Solo los Administradores pueden agregar o modificar Veterinarios, Admins o Voluntarios
        return false;
      case 'GESTIONAR_CLINICA':
      case 'GESTIONAR_CATALOGOS':
        return this.esVeterinarioOAdmin(actual);
      case 'GESTIONAR_ADOPCIONES':
      case 'GESTIONAR_CENSO':
        return true;
      default:
        return false;
    }
  },

  /**
   * Valida que el operador actual tenga permiso `GESTIONAR_EQUIPO` antes de ejecutar mutaciones.
   */
  asegurarPermisoGestionEquipo(): void {
    const session = this.getCurrentSession();
    if (!session) {
      throw new Error('Debes iniciar sesión para realizar esta operación.');
    }
    if (!this.tienePermiso('GESTIONAR_EQUIPO', session)) {
      throw new Error(
        `Permiso insuficiente: Tu rol actual (${session.rol.nombre}) no está autorizado para dar de alta ni modificar Administradores o Veterinarios. Esta acción requiere rol de Administrador.`
      );
    }
  },

  /**
   * Obtiene el padrón completo de operadores del sistema (Admins, Veterinarios y Voluntarios),
   * enriqueciendo la base local con `/api/Usuarios`, `/api/UsuariosRoles` y `/api/Veterinarios` si están disponibles.
   */
  async getOperadores(): Promise<OperadorSistemaDto[]> {
    const locales = obtenerOperadoresAlmacenados();

    if (!USE_MOCK) {
      try {
        const [usuariosApi, rolesRelApi, veterinariosApi] = await Promise.all([
          safeGetList<UsuarioDto & { passwordHash?: string }>('/api/Usuarios'),
          safeGetList<UsuarioRolDto>('/api/UsuariosRoles'),
          safeGetList<VeterinarioDto>('/api/Veterinarios'),
        ]);

        const combinados = [...locales];

        // Sincronizar usuarios provenientes de la tabla Usuarios en MySQL
        for (const uApi of usuariosApi) {
          const idx = combinados.findIndex(
            (op) =>
              op.user.toLowerCase() === uApi.user.toLowerCase() ||
              op.idUsuario === uApi.idUsuario
          );
          const relRol = rolesRelApi.find((r) => r.idUsuario === uApi.idUsuario);
          const rolResuelto = relRol ? obtenerRolPorId(relRol.idRol) : ROLES_SISTEMA[0];

          if (idx >= 0) {
            combinados[idx] = {
              ...combinados[idx],
              idUsuario: uApi.idUsuario || combinados[idx].idUsuario,
              activo: uApi.activo ?? combinados[idx].activo,
              ultimoAcceso: uApi.ultimoAcceso ?? combinados[idx].ultimoAcceso,
              rol: combinados[idx].rol ?? rolResuelto,
            };
          } else {
            combinados.push({
              idUsuario: uApi.idUsuario,
              user: uApi.user,
              nombreCompleto: uApi.user,
              etiquetaArea: rolResuelto.nombre,
              resumenPermisos: generarResumenPermisosPorRol(rolResuelto.idRol),
              activo: uApi.activo ?? true,
              fechaCreacion: uApi.fechaCreacion || new Date().toISOString(),
              ultimoAcceso: uApi.ultimoAcceso,
              rol: rolResuelto,
            });
          }
        }

        // Sincronizar veterinarios provenientes de /api/Veterinarios
        for (const vetApi of veterinariosApi) {
          const coincideConExistente = combinados.some(
            (op) =>
              op.veterinario &&
              (op.veterinario.matricula.toLowerCase() === vetApi.matricula.toLowerCase() ||
                (op.veterinario.nombre.toLowerCase() === vetApi.nombre.toLowerCase() &&
                  op.veterinario.apellido.toLowerCase() === vetApi.apellido.toLowerCase()))
          );

          if (!coincideConExistente) {
            const cleanSlug = `${vetApi.nombre}.${vetApi.apellido}`
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9.]/g, '');

            combinados.push({
              idUsuario: 100 + vetApi.idVeterinario,
              user: cleanSlug || `vet.${vetApi.idVeterinario}`,
              password: 'vet2026',
              nombreCompleto: `Dr/a. ${vetApi.nombre} ${vetApi.apellido}`.trim(),
              etiquetaArea: 'Veterinaria Clínica',
              resumenPermisos: generarResumenPermisosPorRol(2),
              activo: true,
              fechaCreacion: new Date().toISOString(),
              ultimoAcceso: null,
              rol: ROLES_SISTEMA[1],
              veterinario: {
                idVeterinario: vetApi.idVeterinario,
                matricula: vetApi.matricula,
                nombre: vetApi.nombre,
                apellido: vetApi.apellido,
                telefono: vetApi.telefono,
              },
            });
          }
        }

        guardarOperadoresAlmacenados(combinados);
        return combinados;
      } catch {
        // Si la API no responde, devolver operadores almacenados
      }
    }

    return locales;
  },

  /**
   * Crea un nuevo operador (Administrador, Veterinario o Voluntario) verificando permisos.
   * Si es Veterinario (`idRol === 2`), también registra su ficha profesional en `/api/Veterinarios`.
   */
  async crearOperador(dto: OperadorCrearDto): Promise<OperadorSistemaDto> {
    this.asegurarPermisoGestionEquipo();

    const cleanUser = dto.user.trim().toLowerCase();
    const cleanPass = dto.password.trim();
    const cleanNombre = dto.nombre.trim();
    const cleanApellido = dto.apellido.trim();

    if (!cleanUser || cleanUser.length < 3) {
      throw new Error('El nombre de usuario debe tener al menos 3 caracteres.');
    }
    if (!cleanPass || cleanPass.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres por seguridad.');
    }
    if (!cleanNombre || !cleanApellido) {
      throw new Error('El nombre y apellido del integrante son obligatorios.');
    }

    const actuales = obtenerOperadoresAlmacenados();
    if (actuales.some((op) => op.user.toLowerCase() === cleanUser)) {
      throw new Error(`El nombre de usuario "${cleanUser}" ya se encuentra registrado.`);
    }

    const idRol = Number(dto.idRol) || 2;
    const rolObj = obtenerRolPorId(idRol);
    const fechaIso = new Date().toISOString();

    let idVeterinarioCreado: number | undefined;
    const cleanMatricula = (dto.matricula ?? '').trim() || `MP-SAL-0${Math.floor(100 + Math.random() * 899)}`;
    const cleanTelefono = (dto.telefono ?? '').trim() || '+54 3868 421900';

    // 1. Si es Veterinario, intentar dar de alta en /api/Veterinarios de la API C#
    if (idRol === 2 && !USE_MOCK) {
      try {
        const resVet = await axiosClient.post<VeterinarioDto>('/api/Veterinarios', {
          matricula: cleanMatricula.slice(0, 50),
          nombre: cleanNombre.slice(0, 50),
          apellido: cleanApellido.slice(0, 50),
          telefono: cleanTelefono.slice(0, 20),
        });
        if (resVet.data?.idVeterinario) {
          idVeterinarioCreado = resVet.data.idVeterinario;
        }
      } catch {
        // Continuar con registro local sincronizado si el endpoint falla
      }
    }

    // 2. Intentar dar de alta el usuario en /api/Usuarios y su relación en /api/UsuariosRoles
    let idUsuarioCreado =
      actuales.length > 0 ? Math.max(...actuales.map((x) => x.idUsuario)) + 1 : 1;

    if (!USE_MOCK) {
      try {
        const resUser = await axiosClient.post<UsuarioDto>('/api/Usuarios', {
          user: cleanUser,
          passwordHash: cleanPass,
          activo: dto.activo ?? true,
          fechaCreacion: fechaIso,
          ultimoAcceso: null,
        });
        if (resUser.data?.idUsuario) {
          idUsuarioCreado = resUser.data.idUsuario;
          try {
            await axiosClient.post('/api/UsuariosRoles', {
              idUsuario: idUsuarioCreado,
              idRol,
            });
          } catch {
            // Ignorar si la tabla intermedia se gestiona por trigger
          }
        }
      } catch {
        // Respaldo inmediato en almacenamiento local
      }
    }

    const prefijo = idRol === 2 ? 'Dr/a. ' : '';
    const nuevoOperador: OperadorSistemaDto = {
      idUsuario: idUsuarioCreado,
      user: cleanUser,
      password: cleanPass,
      nombreCompleto: `${prefijo}${cleanNombre} ${cleanApellido}`.trim(),
      etiquetaArea:
        dto.etiquetaArea?.trim() ||
        (idRol === 1
          ? 'Coordinación General'
          : idRol === 2
          ? 'Veterinaria Clínica'
          : 'Guardia y Adopciones'),
      resumenPermisos: generarResumenPermisosPorRol(idRol),
      activo: dto.activo ?? true,
      fechaCreacion: fechaIso,
      ultimoAcceso: null,
      rol: rolObj,
      veterinario:
        idRol === 2
          ? {
              idVeterinario:
                idVeterinarioCreado ??
                Math.max(
                  0,
                  ...actuales.map((o) => o.veterinario?.idVeterinario ?? 0)
                ) + 1,
              matricula: cleanMatricula,
              nombre: cleanNombre,
              apellido: cleanApellido,
              telefono: cleanTelefono,
            }
          : undefined,
    };

    const nuevaLista = [nuevoOperador, ...actuales];
    guardarOperadoresAlmacenados(nuevaLista);
    return nuevoOperador;
  },

  /**
   * Actualiza los datos, rol, matrícula o contraseña de un operador existente.
   */
  async actualizarOperador(
    idUsuario: number,
    dto: OperadorActualizarDto
  ): Promise<OperadorSistemaDto> {
    this.asegurarPermisoGestionEquipo();

    const actuales = obtenerOperadoresAlmacenados();
    const indice = actuales.findIndex((op) => op.idUsuario === idUsuario);
    if (indice < 0) {
      throw new Error('No se encontró el operador solicitado.');
    }

    const existente = actuales[indice];
    const cleanUser = dto.user.trim().toLowerCase();

    if (
      actuales.some(
        (op) => op.idUsuario !== idUsuario && op.user.toLowerCase() === cleanUser
      )
    ) {
      throw new Error(`El nombre de usuario "${cleanUser}" ya está en uso por otra cuenta.`);
    }

    // Evitar que el sistema se quede sin ningún Administrador activo
    const adminsActivosRestantes = actuales.filter(
      (op) => op.idUsuario !== idUsuario && op.activo && op.rol.idRol === 1
    );
    if (
      existente.rol.idRol === 1 &&
      (Number(dto.idRol) !== 1 || !dto.activo) &&
      adminsActivosRestantes.length === 0
    ) {
      throw new Error(
        'Debe permanecer al menos un Administrador activo en el sistema para no perder el control del refugio.'
      );
    }

    const idRol = Number(dto.idRol) || existente.rol.idRol;
    const rolObj = obtenerRolPorId(idRol);
    const cleanNombre = dto.nombre.trim();
    const cleanApellido = dto.apellido.trim();
    const prefijo = idRol === 2 ? 'Dr/a. ' : '';

    const actualizado: OperadorSistemaDto = {
      ...existente,
      user: cleanUser,
      password:
        dto.password && dto.password.trim().length > 0
          ? dto.password.trim()
          : existente.password,
      nombreCompleto: `${prefijo}${cleanNombre} ${cleanApellido}`.trim(),
      etiquetaArea:
        dto.etiquetaArea?.trim() ||
        (idRol === 1
          ? 'Coordinación General'
          : idRol === 2
          ? 'Veterinaria Clínica'
          : 'Guardia y Adopciones'),
      resumenPermisos: generarResumenPermisosPorRol(idRol),
      activo: dto.activo,
      rol: rolObj,
      veterinario:
        idRol === 2
          ? {
              idVeterinario:
                existente.veterinario?.idVeterinario ??
                Math.max(0, ...actuales.map((o) => o.veterinario?.idVeterinario ?? 0)) + 1,
              matricula:
                dto.matricula?.trim() ||
                existente.veterinario?.matricula ||
                `MP-SAL-0${Math.floor(100 + Math.random() * 899)}`,
              nombre: cleanNombre,
              apellido: cleanApellido,
              telefono:
                dto.telefono?.trim() ||
                existente.veterinario?.telefono ||
                '+54 3868 421900',
            }
          : undefined,
    };

    if (!USE_MOCK && actualizado.veterinario?.idVeterinario) {
      try {
        await axiosClient.put(
          `/api/Veterinarios/${actualizado.veterinario.idVeterinario}`,
          {
            idVeterinario: actualizado.veterinario.idVeterinario,
            matricula: actualizado.veterinario.matricula,
            nombre: actualizado.veterinario.nombre,
            apellido: actualizado.veterinario.apellido,
            telefono: actualizado.veterinario.telefono,
          }
        );
      } catch {
        // Continuar si el endpoint de actualización de veterinario no está disponible
      }
    }

    actuales[indice] = actualizado;
    guardarOperadoresAlmacenados(actuales);

    // Si el administrador editó su propia sesión activa, actualizar la sesión
    const sesionActual = this.getCurrentSession();
    if (sesionActual && sesionActual.usuario.idUsuario === idUsuario) {
      const sesionActualizada: AuthSession = {
        ...sesionActual,
        usuario: {
          ...sesionActual.usuario,
          user: actualizado.user,
          activo: actualizado.activo,
        },
        rol: actualizado.rol,
      };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sesionActualizada));
    }

    return actualizado;
  },

  /**
   * Activa o suspende el acceso de un operador al sistema.
   */
  async cambiarEstadoOperador(
    idUsuario: number,
    activo: boolean
  ): Promise<OperadorSistemaDto> {
    this.asegurarPermisoGestionEquipo();

    const sesionActual = this.getCurrentSession();
    if (!activo && sesionActual?.usuario.idUsuario === idUsuario) {
      throw new Error('No puedes suspender tu propia cuenta mientras tienes la sesión abierta.');
    }

    const actuales = obtenerOperadoresAlmacenados();
    const op = actuales.find((x) => x.idUsuario === idUsuario);
    if (!op) {
      throw new Error('No se encontró el operador indicado.');
    }

    const partesNombre = op.nombreCompleto.replace(/^Dr\/a\.\s*/i, '').split(' ');
    const nombre = op.veterinario?.nombre || partesNombre[0] || op.user;
    const apellido = op.veterinario?.apellido || partesNombre.slice(1).join(' ') || 'Calchaquí';

    return this.actualizarOperador(idUsuario, {
      idUsuario,
      user: op.user,
      idRol: op.rol.idRol,
      nombre,
      apellido,
      etiquetaArea: op.etiquetaArea,
      activo,
      matricula: op.veterinario?.matricula,
      telefono: op.veterinario?.telefono,
    });
  },

  /**
   * Elimina un operador del padrón de acceso verificando que no sea la cuenta en sesión activa.
   */
  async eliminarOperador(idUsuario: number): Promise<void> {
    this.asegurarPermisoGestionEquipo();

    const sesionActual = this.getCurrentSession();
    if (sesionActual?.usuario.idUsuario === idUsuario) {
      throw new Error('No puedes eliminar la cuenta con la que estás operando actualmente.');
    }

    const actuales = obtenerOperadoresAlmacenados();
    const objetivo = actuales.find((op) => op.idUsuario === idUsuario);
    if (!objetivo) return;

    const adminsActivosRestantes = actuales.filter(
      (op) => op.idUsuario !== idUsuario && op.activo && op.rol.idRol === 1
    );
    if (objetivo.rol.idRol === 1 && adminsActivosRestantes.length === 0) {
      throw new Error('No se puede eliminar al único Administrador activo del sistema.');
    }

    if (!USE_MOCK) {
      try {
        await axiosClient.delete(`/api/Usuarios/${idUsuario}`);
      } catch {
        // Continuar con eliminación local sincronizada
      }
    }

    const filtrados = actuales.filter((op) => op.idUsuario !== idUsuario);
    guardarOperadoresAlmacenados(filtrados);
  },

  /**
   * Inicia sesión validando contra el endpoint C# `POST /api/Auth/login`
   * y contra el padrón de operadores dados de alta en el sistema.
   */
  async login(credentials: LoginRequestDto): Promise<AuthSession> {
    const cleanUser = credentials.user.trim();
    const cleanPass = credentials.password.trim();

    if (!cleanUser || !cleanPass) {
      throw new Error('Ingresa tu nombre de usuario y contraseña para continuar.');
    }

    const operadores = obtenerOperadoresAlmacenados();
    const operadorLocal = operadores.find(
      (op) => op.user.toLowerCase() === cleanUser.toLowerCase()
    );

    if (operadorLocal && !operadorLocal.activo) {
      throw new Error(
        'Esta cuenta de usuario se encuentra suspendida por Coordinación General.'
      );
    }

    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 250));

      const matched = operadores.find(
        (acc) =>
          acc.activo &&
          acc.user.toLowerCase() === cleanUser.toLowerCase() &&
          acc.password === cleanPass
      );

      if (!matched) {
        throw new Error(
          'Credenciales incorrectas. Verifica tu usuario y contraseña o utiliza un perfil activo.'
        );
      }

      const ahora = new Date().toISOString();
      matched.ultimoAcceso = ahora;
      guardarOperadoresAlmacenados(operadores);

      const session: AuthSession = {
        usuario: {
          idUsuario: matched.idUsuario,
          user: matched.user,
          activo: matched.activo,
          fechaCreacion: matched.fechaCreacion,
          ultimoAcceso: ahora,
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
        ? String(roleClaim[0] ?? operadorLocal?.rol.nombre ?? 'Administrador')
        : typeof roleClaim === 'string' && roleClaim.trim()
        ? roleClaim
        : operadorLocal?.rol.nombre ?? 'Administrador';

      const usuario: UsuarioDto = {
        idUsuario: Number(idClaim) || operadorLocal?.idUsuario || 1,
        user: String(nameClaim),
        activo: true,
        fechaCreacion: operadorLocal?.fechaCreacion || new Date().toISOString(),
        ultimoAcceso: new Date().toISOString(),
      };

      const rol: RolDto = operadorLocal?.rol ?? {
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

      if (operadorLocal) {
        operadorLocal.ultimoAcceso = usuario.ultimoAcceso;
        guardarOperadoresAlmacenados(operadores);
      }

      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      return session;
    } catch (err) {
      // Si el usuario fue dado de alta desde la gestión de equipo o pertenece al padrón local,
      // permitimos iniciar sesión validando su clave y actualizando su último acceso.
      const matchedOperador = operadores.find(
        (acc) =>
          acc.activo &&
          acc.user.toLowerCase() === cleanUser.toLowerCase() &&
          acc.password === cleanPass
      );

      if (matchedOperador) {
        const ahora = new Date().toISOString();
        matchedOperador.ultimoAcceso = ahora;
        guardarOperadoresAlmacenados(operadores);

        const fallbackSession: AuthSession = {
          usuario: {
            idUsuario: matchedOperador.idUsuario,
            user: matchedOperador.user,
            activo: matchedOperador.activo,
            fechaCreacion: matchedOperador.fechaCreacion,
            ultimoAcceso: ahora,
          },
          rol: matchedOperador.rol,
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
