import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Stethoscope,
  HeartHandshake,
  UserPlus,
  Search,
  Edit3,
  Trash2,
  RefreshCw,
  CheckCircle2,
  ArrowLeft,
  Eye,
  EyeOff,
  Phone,
  Lock,
  Power,
  KeyRound,
  X,
} from 'lucide-react';
import {
  Button,
  Input,
  Badge,
  Skeleton,
  ErrorAlert,
  EmptyState,
  ConfirmModal,
} from '../components/ui';
import { authService } from '../services/authService';
import {
  ROLES_SISTEMA,
  type OperadorSistemaDto,
  type OperadorCrearDto,
} from '../types/auth.types';

type VistaActiva = 'listado' | 'formulario';
type FiltroRol = 'todos' | 1 | 2 | 3;

interface ErroresFormularioOperador {
  nombre?: string;
  apellido?: string;
  user?: string;
  password?: string;
  matricula?: string;
  telefono?: string;
}

const ESTADO_INICIAL_FORM: OperadorCrearDto = {
  user: '',
  password: '',
  idRol: 2,
  nombre: '',
  apellido: '',
  etiquetaArea: 'Veterinaria Clínica',
  activo: true,
  matricula: '',
  telefono: '',
};

function formatearFechaHora(fechaIso?: string | null): string {
  if (!fechaIso) return 'Sin ingresos previos';
  const fecha = new Date(fechaIso);
  if (Number.isNaN(fecha.getTime())) return 'Sin ingresos previos';
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(fecha);
}

export const UsuariosPage: React.FC = () => {
  const navigate = useNavigate();
  const session = authService.getCurrentSession();
  const tienePermisoGestion = authService.tienePermiso('GESTIONAR_EQUIPO', session);

  const [operadores, setOperadores] = useState<OperadorSistemaDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const [filtroRol, setFiltroRol] = useState<FiltroRol>('todos');
  const [busqueda, setBusqueda] = useState<string>('');

  const [vistaActiva, setVistaActiva] = useState<VistaActiva>('listado');
  const [operadorEditando, setOperadorEditando] = useState<OperadorSistemaDto | null>(null);
  const [formData, setFormData] = useState<OperadorCrearDto>(ESTADO_INICIAL_FORM);
  const [mostrarPassword, setMostrarPassword] = useState<boolean>(false);
  const [erroresForm, setErroresForm] = useState<ErroresFormularioOperador>({});
  const [errorSubmit, setErrorSubmit] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [operadorAEliminar, setOperadorAEliminar] = useState<OperadorSistemaDto | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const mostrarExitoTemporal = (mensaje: string) => {
    setMensajeExito(mensaje);
    window.setTimeout(() => {
      setMensajeExito((actual) => (actual === mensaje ? null : actual));
    }, 4500);
  };

  const cargarOperadores = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const lista = await authService.getOperadores();
      setOperadores(lista);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'No se pudo cargar el padrón de operadores.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarOperadores();
  }, [cargarOperadores]);

  const abrirAltaPorRol = (idRolPreseleccionado: 1 | 2 | 3) => {
    if (!tienePermisoGestion) {
      setErrorMsg(
        'No tienes los permisos necesarios para dar de alta personal. Se requiere rol Administrador.'
      );
      return;
    }

    const etiquetaPorDefecto =
      idRolPreseleccionado === 1
        ? 'Coordinación General'
        : idRolPreseleccionado === 2
        ? 'Veterinaria Clínica'
        : 'Guardia y Adopciones';

    setOperadorEditando(null);
    setFormData({
      ...ESTADO_INICIAL_FORM,
      idRol: idRolPreseleccionado,
      etiquetaArea: etiquetaPorDefecto,
      matricula:
        idRolPreseleccionado === 2
          ? `MP-SAL-0${Math.floor(100 + Math.random() * 899)}`
          : '',
      telefono: idRolPreseleccionado === 2 ? '+54 3868 ' : '',
    });
    setErroresForm({});
    setErrorSubmit(null);
    setMostrarPassword(false);
    setVistaActiva('formulario');
  };

  const abrirEdicion = (op: OperadorSistemaDto) => {
    if (!tienePermisoGestion) return;

    const limpio = op.nombreCompleto.replace(/^Dr\/a\.\s*/i, '').trim();
    const partes = limpio.split(' ');
    const nombre = op.veterinario?.nombre || partes[0] || op.user;
    const apellido = op.veterinario?.apellido || partes.slice(1).join(' ') || '';

    setOperadorEditando(op);
    setFormData({
      user: op.user,
      password: '',
      idRol: op.rol.idRol,
      nombre,
      apellido,
      etiquetaArea: op.etiquetaArea,
      activo: op.activo,
      matricula: op.veterinario?.matricula || '',
      telefono: op.veterinario?.telefono || '',
    });
    setErroresForm({});
    setErrorSubmit(null);
    setMostrarPassword(false);
    setVistaActiva('formulario');
  };

  const sugerirUsuario = (nombre: string, apellido: string, idRol: number) => {
    if (operadorEditando) return;
    const n = nombre
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');
    const a = apellido
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '');

    if (!n && !a) return;
    const prefijo = idRol === 1 ? 'admin' : idRol === 2 ? 'vet' : 'guardia';
    const sugerido = a ? `${prefijo}.${a}` : `${prefijo}.${n}`;
    setFormData((prev) => ({
      ...prev,
      user: prev.user.trim() === '' ? sugerido : prev.user,
    }));
  };

  const validarFormulario = (): ErroresFormularioOperador => {
    const errores: ErroresFormularioOperador = {};

    if (!formData.nombre.trim()) {
      errores.nombre = 'El nombre es obligatorio.';
    }
    if (!formData.apellido.trim()) {
      errores.apellido = 'El apellido es obligatorio.';
    }
    if (!formData.user.trim() || formData.user.trim().length < 3) {
      errores.user = 'El usuario debe tener al menos 3 caracteres.';
    }
    if (!operadorEditando && (!formData.password || formData.password.trim().length < 6)) {
      errores.password = 'La contraseña inicial debe tener al menos 6 caracteres.';
    }
    if (
      operadorEditando &&
      formData.password &&
      formData.password.trim().length > 0 &&
      formData.password.trim().length < 6
    ) {
      errores.password = 'La nueva contraseña debe tener al menos 6 caracteres.';
    }
    if (Number(formData.idRol) === 2) {
      if (!formData.matricula?.trim()) {
        errores.matricula = 'La matrícula profesional es obligatoria para veterinarios.';
      }
      if (!formData.telefono?.trim()) {
        errores.telefono = 'El teléfono de contacto clínico es obligatorio.';
      }
    }

    return errores;
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorSubmit(null);

    const errores = validarFormulario();
    if (Object.keys(errores).length > 0) {
      setErroresForm(errores);
      return;
    }

    setIsSubmitting(true);
    try {
      if (operadorEditando) {
        const actualizado = await authService.actualizarOperador(operadorEditando.idUsuario, {
          idUsuario: operadorEditando.idUsuario,
          user: formData.user,
          password: formData.password,
          idRol: Number(formData.idRol),
          nombre: formData.nombre,
          apellido: formData.apellido,
          etiquetaArea: formData.etiquetaArea,
          activo: formData.activo ?? true,
          matricula: formData.matricula,
          telefono: formData.telefono,
        });
        mostrarExitoTemporal(
          `Permisos y datos de "${actualizado.nombreCompleto}" (${actualizado.rol.nombre}) actualizados.`
        );
      } else {
        const creado = await authService.crearOperador(formData);
        mostrarExitoTemporal(
          `${creado.rol.nombre} "${creado.nombreCompleto}" habilitado con usuario "${creado.user}".`
        );
      }

      await cargarOperadores();
      setVistaActiva('listado');
    } catch (err: unknown) {
      setErrorSubmit(
        err instanceof Error ? err.message : 'No se pudo guardar el operador.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAlternarEstado = async (op: OperadorSistemaDto) => {
    if (!tienePermisoGestion) return;
    setErrorMsg(null);
    try {
      const actualizado = await authService.cambiarEstadoOperador(op.idUsuario, !op.activo);
      mostrarExitoTemporal(
        actualizado.activo
          ? `Acceso reactivado para ${actualizado.user}.`
          : `Acceso suspendido para ${actualizado.user}.`
      );
      await cargarOperadores();
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'No se pudo cambiar el estado de la cuenta.'
      );
    }
  };

  const handleConfirmarEliminar = async () => {
    if (!operadorAEliminar) return;
    setIsDeleting(true);
    setErrorMsg(null);
    try {
      await authService.eliminarOperador(operadorAEliminar.idUsuario);
      mostrarExitoTemporal(`Cuenta "${operadorAEliminar.user}" eliminada del sistema.`);
      setOperadorAEliminar(null);
      await cargarOperadores();
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'No se pudo eliminar el operador.'
      );
      setOperadorAEliminar(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const operadoresFiltrados = operadores.filter((op) => {
    if (filtroRol !== 'todos' && op.rol.idRol !== filtroRol) {
      return false;
    }
    if (!busqueda.trim()) return true;
    const q = busqueda.trim().toLowerCase();
    return (
      op.user.toLowerCase().includes(q) ||
      op.nombreCompleto.toLowerCase().includes(q) ||
      op.rol.nombre.toLowerCase().includes(q) ||
      (op.veterinario?.matricula.toLowerCase().includes(q) ?? false)
    );
  });

  const totalAdmins = operadores.filter((o) => o.rol.idRol === 1 && o.activo).length;
  const totalVeterinarios = operadores.filter((o) => o.rol.idRol === 2 && o.activo).length;
  const totalVoluntarios = operadores.filter((o) => o.rol.idRol === 3 && o.activo).length;

  const renderBadgeRol = (idRol: number, nombreRol: string) => {
    if (idRol === 1) {
      return <Badge variant="danger">{nombreRol}</Badge>;
    }
    if (idRol === 2) {
      return <Badge variant="success">{nombreRol}</Badge>;
    }
    return <Badge variant="info">{nombreRol}</Badge>;
  };

  if (vistaActiva === 'formulario') {
    const esVeterinario = Number(formData.idRol) === 2;

    return (
      <div className="space-y-6">
        <div className="surface-layered rounded-3xl overflow-hidden bg-white">
          <div className="p-6 sm:p-8 bg-[#0F291E] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1
                className="text-xl sm:text-2xl font-black text-white tracking-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {operadorEditando
                  ? `Editar Operador · ${operadorEditando.nombreCompleto}`
                  : Number(formData.idRol) === 1
                  ? 'Alta de Nuevo Administrador del Sistema'
                  : Number(formData.idRol) === 2
                  ? 'Alta de Nuevo Veterinario con Acceso al Sistema'
                  : 'Alta de Nuevo Voluntario de Guardia'}
              </h1>
              <p className="text-xs sm:text-sm text-[#D1FAE5]">
                Define las credenciales de acceso y el nivel de permisos dentro de Patitas Calchaquíes.
              </p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setVistaActiva('listado')}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Volver al padrón
            </Button>
          </div>

          <form onSubmit={handleGuardar} className="p-6 sm:p-8 space-y-8">
            {errorSubmit && (
              <ErrorAlert
                title="No se pudo registrar el operador"
                message={errorSubmit}
              />
            )}

            {/* 1. Selección de Rol y Nivel de Permisos */}
            <div className="space-y-3">
              <h2
                className="text-base font-black text-[#0F291E]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Nivel de Permisos y Rol en la Aplicación
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {ROLES_SISTEMA.map((rol) => {
                  const activo = Number(formData.idRol) === rol.idRol;
                  const Icono =
                    rol.idRol === 1
                      ? ShieldCheck
                      : rol.idRol === 2
                      ? Stethoscope
                      : HeartHandshake;

                  return (
                    <button
                      key={rol.idRol}
                      type="button"
                      onClick={() => {
                        const nuevaArea =
                          rol.idRol === 1
                            ? 'Coordinación General'
                            : rol.idRol === 2
                            ? 'Veterinaria Clínica'
                            : 'Guardia y Adopciones';
                        setFormData((prev) => ({
                          ...prev,
                          idRol: rol.idRol,
                          etiquetaArea: nuevaArea,
                          matricula:
                            rol.idRol === 2 && !prev.matricula
                              ? `MP-SAL-0${Math.floor(100 + Math.random() * 899)}`
                              : prev.matricula,
                        }));
                      }}
                      className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 min-h-[112px] ${
                        activo
                          ? 'bg-[#F0FDF4] border-[#16A34A] ring-2 ring-[#16A34A]/20'
                          : 'bg-[#F7FAF8] border-[#DCE6DF] hover:border-[#16A34A]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className="font-black text-base text-[#0F291E]"
                          style={{ fontFamily: 'var(--font-display)' }}
                        >
                          {rol.nombre}
                        </span>
                        <Icono
                          className={`w-5 h-5 shrink-0 ${
                            activo ? 'text-[#16A34A]' : 'text-[#527062]'
                          }`}
                        />
                      </div>
                      <p className="text-xs text-[#2D4A3E] leading-relaxed">
                        {rol.descripcion}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Datos Personales y Profesionales */}
            <div className="space-y-4 pt-4 border-t border-[#DCE6DF]">
              <h2
                className="text-base font-black text-[#0F291E]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Identidad del Integrante {esVeterinario ? 'y Matrícula Clínica' : ''}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Input
                  label="Nombre"
                  placeholder={esVeterinario ? 'Ej. Valeria' : 'Ej. Martín'}
                  value={formData.nombre}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((prev) => ({ ...prev, nombre: val }));
                  }}
                  onBlur={() =>
                    sugerirUsuario(formData.nombre, formData.apellido, Number(formData.idRol))
                  }
                  error={erroresForm.nombre}
                  required
                />

                <Input
                  label="Apellido"
                  placeholder={esVeterinario ? 'Ej. Burgos' : 'Ej. Aramayo'}
                  value={formData.apellido}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((prev) => ({ ...prev, apellido: val }));
                  }}
                  onBlur={() =>
                    sugerirUsuario(formData.nombre, formData.apellido, Number(formData.idRol))
                  }
                  error={erroresForm.apellido}
                  required
                />

                <Input
                  label="Área o Guardia Asignada"
                  placeholder="Ej. Coordinación General / Clínica"
                  value={formData.etiquetaArea || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, etiquetaArea: e.target.value }))
                  }
                />
              </div>

              {esVeterinario && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0]">
                  <Input
                    label="Matrícula Profesional (Colegio Veterinario)"
                    placeholder="Ej. MP-SAL-0512"
                    value={formData.matricula || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, matricula: e.target.value }))
                    }
                    error={erroresForm.matricula}
                    helperText="Se vinculará automáticamente a las Atenciones Veterinarias y Esterilizaciones."
                    required
                  />

                  <Input
                    label="Teléfono de Guardia Clínica"
                    placeholder="Ej. +54 3868 451290"
                    value={formData.telefono || ''}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, telefono: e.target.value }))
                    }
                    error={erroresForm.telefono}
                    required
                  />
                </div>
              )}
            </div>

            {/* 3. Credenciales de Acceso al Sistema */}
            <div className="space-y-4 pt-4 border-t border-[#DCE6DF]">
              <h2
                className="text-base font-black text-[#0F291E]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Credenciales de Ingreso a la App
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nombre de Usuario (Login)"
                  placeholder="Ej. vet.burgos o admin.aramayo"
                  value={formData.user}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, user: e.target.value }))
                  }
                  error={erroresForm.user}
                  helperText="Con este usuario ingresará desde la computadora o el celular."
                  required
                />

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="operador-password"
                      className="block text-xs sm:text-sm font-bold text-[#0F291E]"
                    >
                      {operadorEditando
                        ? 'Nueva Contraseña (opcional)'
                        : 'Contraseña de Acceso *'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setMostrarPassword((prev) => !prev)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#16A34A] hover:text-[#15803D] cursor-pointer"
                    >
                      {mostrarPassword ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Ocultar</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5" />
                          <span>Mostrar</span>
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    id="operador-password"
                    type={mostrarPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, password: e.target.value }))
                    }
                    placeholder={
                      operadorEditando
                        ? 'Dejar en blanco para mantener la actual'
                        : 'Mínimo 6 caracteres'
                    }
                    required={!operadorEditando}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#B8CCC0] bg-white text-[#0F291E] text-base sm:text-sm placeholder:text-[#527062] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/25 focus:border-[#16A34A]"
                  />
                  {erroresForm.password && (
                    <p className="text-xs font-semibold text-[#DC2626]">
                      {erroresForm.password}
                    </p>
                  )}
                </div>
              </div>

              <label className="inline-flex items-center gap-3 pt-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.activo ?? true}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, activo: e.target.checked }))
                  }
                  className="w-5 h-5 rounded border-[#B8CCC0] text-[#16A34A] focus:ring-[#16A34A]"
                />
                <span className="text-sm font-bold text-[#0F291E]">
                  Cuenta activa y autorizada para iniciar sesión en la aplicación
                </span>
              </label>
            </div>

            <div className="pt-4 border-t border-[#DCE6DF] flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setVistaActiva('listado')}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                leftIcon={<KeyRound className="w-4 h-4" />}
              >
                {operadorEditando
                  ? 'Guardar Cambios de Permisos'
                  : Number(formData.idRol) === 1
                  ? 'Habilitar Administrador'
                  : Number(formData.idRol) === 2
                  ? 'Habilitar Veterinario'
                  : 'Habilitar Voluntario'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. Cabecera Operativa y Cinta de Resumen de Personal */}
      <div className="surface-layered rounded-3xl overflow-hidden">
        <div className="p-6 sm:p-7 bg-[#0F291E] text-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1
              className="text-xl sm:text-2xl font-black text-white tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Equipo, Veterinarios y Permisos de Acceso
            </h1>
            <p className="text-xs sm:text-sm text-[#D1FAE5]">
              Administración de cuentas habilitadas para manejar la app según nivel de autorización.
            </p>
          </div>

          {tienePermisoGestion ? (
            <div className="flex items-center gap-2.5 flex-wrap">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => abrirAltaPorRol(2)}
                leftIcon={<Stethoscope className="w-4 h-4" />}
              >
                Agregar Veterinario
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => abrirAltaPorRol(1)}
                leftIcon={<UserPlus className="w-4 h-4" />}
              >
                Agregar Administrador
              </Button>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#143325] border border-[#23533D] text-xs font-bold text-[#A7F3D0]">
              <Lock className="w-4 h-4 text-[#FBBF24] shrink-0" />
              <span>Modo lectura · Rol actual: {session?.rol.nombre ?? 'Operador'}</span>
            </div>
          )}
        </div>

        {/* Cinta tabular de contadores por rol */}
        <dl className="grid grid-cols-3 divide-x divide-[#DCE6DF] bg-white">
          <div className="p-4 sm:px-6 flex items-baseline justify-between gap-2">
            <dt className="text-xs font-bold text-[#2D4A3E]">Administradores</dt>
            <dd className="text-2xl font-black text-[#DC2626] tabular-data">{totalAdmins}</dd>
          </div>
          <div className="p-4 sm:px-6 flex items-baseline justify-between gap-2">
            <dt className="text-xs font-bold text-[#2D4A3E]">Veterinarios activos</dt>
            <dd className="text-2xl font-black text-[#16A34A] tabular-data">
              {totalVeterinarios}
            </dd>
          </div>
          <div className="p-4 sm:px-6 flex items-baseline justify-between gap-2">
            <dt className="text-xs font-bold text-[#2D4A3E]">Guardia voluntaria</dt>
            <dd className="text-2xl font-black text-[#0F291E] tabular-data">
              {totalVoluntarios}
            </dd>
          </div>
        </dl>
      </div>

      {/* 2. Aviso de Control de Permisos si el usuario logueado NO es Administrador */}
      {!tienePermisoGestion && (
        <div className="surface-layered rounded-2xl p-5 bg-[#FFFBEB] border border-[#FDE68A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2
              className="text-sm sm:text-base font-black text-[#78350F]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Permisos de Coordinación Requeridos para Modificar Personal
            </h2>
            <p className="text-xs sm:text-sm text-[#92400E] leading-relaxed">
              Estás conectado como <strong>{session?.usuario.user}</strong> con el rol{' '}
              <strong>{session?.rol.nombre}</strong>. Por seguridad, únicamente las cuentas con rol{' '}
              <strong>Administrador</strong> pueden agregar nuevos veterinarios o administradores.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/login', { state: { from: '/admin/usuarios' } })}
            leftIcon={<KeyRound className="w-4 h-4" />}
          >
            Cambiar de Cuenta
          </Button>
        </div>
      )}

      {/* Notificaciones de éxito y error */}
      {mensajeExito && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl bg-[#F0FDF4] border border-[#86EFAC] text-[#14532D] text-sm font-bold"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
            <span>{mensajeExito}</span>
          </div>
          <button
            type="button"
            onClick={() => setMensajeExito(null)}
            className="p-1 rounded-lg hover:bg-[#DCFCE7] text-[#14532D] cursor-pointer"
            aria-label="Cerrar notificación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMsg && <ErrorAlert title="Atención" message={errorMsg} />}

      {/* 3. Directorio y Controles de Filtrado */}
      <section
        aria-label="Padrón de usuarios y veterinarios"
        className="surface-layered rounded-3xl overflow-hidden bg-white"
      >
        <div className="p-5 sm:px-6 border-b border-[#DCE6DF] flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#F7FAF8]">
          {/* Pestañas de filtro por Rol */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {(
              [
                { id: 'todos', label: `Todos (${operadores.length})` },
                { id: 1, label: 'Administradores' },
                { id: 2, label: 'Veterinarios' },
                { id: 3, label: 'Voluntarios' },
              ] as const
            ).map((tab) => {
              const active = filtroRol === tab.id;
              return (
                <button
                  key={String(tab.id)}
                  type="button"
                  onClick={() => setFiltroRol(tab.id)}
                  className={`px-3.5 min-h-[38px] rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#0F291E] text-white'
                      : 'bg-white text-[#2D4A3E] border border-[#DCE6DF] hover:border-[#0F291E]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Buscador y actualización */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-[#527062] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar usuario, nombre o matrícula..."
                className="w-full min-h-[40px] pl-9 pr-3.5 py-2 rounded-xl bg-white border border-[#B8CCC0] text-sm text-[#0F291E] placeholder:text-[#527062] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/20 focus:border-[#16A34A]"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void cargarOperadores()}
              leftIcon={<RefreshCw className="w-4 h-4" />}
              title="Actualizar lista"
            >
              Actualizar
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        ) : operadoresFiltrados.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={ShieldCheck}
              title="No se encontraron operadores con ese criterio"
              description="Prueba limpiando el filtro de búsqueda o agrega un nuevo integrante al equipo."
              actionLabel={tienePermisoGestion ? 'Agregar Veterinario' : undefined}
              onAction={tienePermisoGestion ? () => abrirAltaPorRol(2) : undefined}
            />
          </div>
        ) : (
          <>
            {/* Tabla en Escritorio */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#DCE6DF] text-[11px] font-bold uppercase text-[#527062] bg-[#F7FAF8]">
                    <th className="py-3.5 px-6">Integrante y Usuario</th>
                    <th className="py-3.5 px-4">Rol y Permisos</th>
                    <th className="py-3.5 px-4">Matrícula / Guardia</th>
                    <th className="py-3.5 px-4">Estado</th>
                    <th className="py-3.5 px-4">Último Acceso</th>
                    {tienePermisoGestion && (
                      <th className="py-3.5 px-6 text-right">Acciones de Permiso</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE6DF] text-sm">
                  {operadoresFiltrados.map((op) => {
                    const esSesionActual = session?.usuario.idUsuario === op.idUsuario;

                    return (
                      <tr
                        key={op.idUsuario}
                        className="hover:bg-[#F7FAF8] transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="font-bold text-[#0F291E] flex items-center gap-2">
                            <span>{op.nombreCompleto}</span>
                            {esSesionActual && (
                              <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#DCFCE7] text-[#14532D]">
                                Tú
                              </span>
                            )}
                          </div>
                          <div className="font-mono text-xs text-[#16A34A] font-semibold mt-0.5">
                            @{op.user}
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            {renderBadgeRol(op.rol.idRol, op.rol.nombre)}
                            <span className="text-xs font-semibold text-[#2D4A3E]">
                              {op.etiquetaArea}
                            </span>
                          </div>
                          <p className="text-xs text-[#527062] mt-1 max-w-xs">
                            {op.resumenPermisos}
                          </p>
                        </td>

                        <td className="py-4 px-4 tabular-data">
                          {op.veterinario ? (
                            <div className="space-y-0.5">
                              <span className="font-mono text-xs font-bold text-[#0F291E] block">
                                {op.veterinario.matricula}
                              </span>
                              <a
                                href={`tel:${op.veterinario.telefono}`}
                                className="inline-flex items-center gap-1 text-xs text-[#16A34A] hover:underline font-medium"
                              >
                                <Phone className="w-3 h-3" />
                                <span>{op.veterinario.telefono}</span>
                              </a>
                            </div>
                          ) : (
                            <span className="text-xs text-[#527062]">
                              Gestión administrativa
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4">
                          <Badge variant={op.activo ? 'success' : 'neutral'}>
                            {op.activo ? 'Habilitado' : 'Suspendido'}
                          </Badge>
                        </td>

                        <td className="py-4 px-4 text-xs text-[#2D4A3E] tabular-data">
                          {formatearFechaHora(op.ultimoAcceso)}
                        </td>

                        {tienePermisoGestion && (
                          <td className="py-4 px-6 text-right">
                            <div className="inline-flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => abrirEdicion(op)}
                                className="inline-flex items-center gap-1 px-2.5 min-h-[36px] rounded-xl text-xs font-bold text-[#0F291E] bg-[#EDF4F0] hover:bg-[#DCE6DF] transition-colors cursor-pointer"
                                title="Editar rol, clave o datos"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Editar</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => void handleAlternarEstado(op)}
                                disabled={esSesionActual}
                                className={`inline-flex items-center gap-1 px-2.5 min-h-[36px] rounded-xl text-xs font-bold transition-colors ${
                                  esSesionActual
                                    ? 'opacity-40 cursor-not-allowed bg-[#EDF4F0] text-[#527062]'
                                    : op.activo
                                    ? 'bg-[#FEF3C7] text-[#92400E] hover:bg-[#FDE68A] cursor-pointer'
                                    : 'bg-[#DCFCE7] text-[#14532D] hover:bg-[#BBF7D0] cursor-pointer'
                                }`}
                                title={
                                  op.activo
                                    ? 'Suspender permiso de acceso'
                                    : 'Reactivar permiso de acceso'
                                }
                              >
                                <Power className="w-3.5 h-3.5" />
                                <span>{op.activo ? 'Suspender' : 'Activar'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setOperadorAEliminar(op)}
                                disabled={esSesionActual}
                                className={`inline-flex items-center justify-center min-h-[36px] min-w-[36px] rounded-xl text-xs font-bold transition-colors ${
                                  esSesionActual
                                    ? 'opacity-40 cursor-not-allowed bg-[#EDF4F0] text-[#527062]'
                                    : 'bg-[#FEE2E2] text-[#B91C1C] hover:bg-[#DC2626] hover:text-white cursor-pointer'
                                }`}
                                title="Eliminar cuenta"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Vista Móvil Táctil (Android / iOS) */}
            <div className="md:hidden divide-y divide-[#DCE6DF]">
              {operadoresFiltrados.map((op) => {
                const esSesionActual = session?.usuario.idUsuario === op.idUsuario;

                return (
                  <div key={op.idUsuario} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-base text-[#0F291E] flex items-center gap-2">
                          <span>{op.nombreCompleto}</span>
                          {esSesionActual && (
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#DCFCE7] text-[#14532D]">
                              Tú
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-xs text-[#16A34A] font-bold">
                          @{op.user}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {renderBadgeRol(op.rol.idRol, op.rol.nombre)}
                        <Badge variant={op.activo ? 'success' : 'neutral'}>
                          {op.activo ? 'Activo' : 'Suspendido'}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-xs text-[#2D4A3E] leading-relaxed">
                      {op.resumenPermisos}
                    </p>

                    {op.veterinario && (
                      <div className="flex items-center justify-between text-xs bg-[#F7FAF8] px-3 py-2 rounded-xl border border-[#DCE6DF] tabular-data">
                        <span className="font-mono font-bold text-[#0F291E]">
                          Matrícula: {op.veterinario.matricula}
                        </span>
                        <a
                          href={`tel:${op.veterinario.telefono}`}
                          className="inline-flex items-center gap-1 font-bold text-[#16A34A]"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{op.veterinario.telefono}</span>
                        </a>
                      </div>
                    )}

                    {tienePermisoGestion && (
                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => abrirEdicion(op)}
                          leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                        >
                          Editar
                        </Button>
                        {!esSesionActual && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => void handleAlternarEstado(op)}
                              leftIcon={<Power className="w-3.5 h-3.5" />}
                            >
                              {op.activo ? 'Suspender' : 'Activar'}
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => setOperadorAEliminar(op)}
                              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                            >
                              Baja
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* Modal de confirmación para eliminar operador */}
      <ConfirmModal
        isOpen={Boolean(operadorAEliminar)}
        onClose={() => setOperadorAEliminar(null)}
        onConfirm={() => void handleConfirmarEliminar()}
        title="Eliminar Cuenta de Operador"
        description={
          operadorAEliminar
            ? `¿Confirmas la baja definitiva de "${operadorAEliminar.nombreCompleto}" (@${operadorAEliminar.user}) con rol ${operadorAEliminar.rol.nombre}? Esta cuenta ya no podrá ingresar al sistema.`
            : ''
        }
        confirmLabel="Eliminar cuenta"
        isLoading={isDeleting}
      />
    </div>
  );
};
