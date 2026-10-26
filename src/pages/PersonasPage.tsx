import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Edit3,
  Trash2,
  Eye,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  X,
  Hash,
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
import { personaService } from '../services/personaService';
import { extractApiErrorMessage } from '../api/axiosClient';
import {
  PersonaDto,
  PersonaCrearDto,
  PersonaActualizarDto,
  ModoBusquedaPersona,
  FiltroEstadoPersona,
  formatNombreCompleto,
} from '../types/persona.types';

type VistaActiva = 'listado' | 'formulario' | 'detalle';

interface ErroresFormularioPersona {
  apellido?: string;
  nombre?: string;
  dni?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}

const ESTADO_INICIAL_FORM: PersonaCrearDto & { activo: boolean } = {
  apellido: '',
  nombre: '',
  dni: '',
  telefono: '',
  email: '',
  direccion: '',
  activo: true,
};

/**
 * Formatea una fecha ISO proveniente de C# (`DateTime`) al formato local argentino (`dd/mm/aaaa`).
 */
function formatearFecha(fechaIso?: string | null): string {
  if (!fechaIso) return 'Sin registro';
  const fecha = new Date(fechaIso);
  if (Number.isNaN(fecha.getTime())) return 'Sin registro';
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(fecha);
}

/**
 * Validación en cliente espejo de `PersonaCreateValidator.cs` (FluentValidation en tu API C#).
 */
function validarFormularioPersona(
  datos: PersonaCrearDto
): ErroresFormularioPersona {
  const errores: ErroresFormularioPersona = {};

  if (!datos.apellido.trim()) {
    errores.apellido = 'El apellido no puede estar vacío.';
  } else if (datos.apellido.trim().length > 50) {
    errores.apellido = 'El apellido no puede superar los 50 caracteres.';
  }

  if (!datos.nombre.trim()) {
    errores.nombre = 'El nombre no puede estar vacío.';
  } else if (datos.nombre.trim().length > 50) {
    errores.nombre = 'El nombre no puede superar los 50 caracteres.';
  }

  if (!datos.dni.trim()) {
    errores.dni = 'El DNI es obligatorio.';
  } else if (!/^\d{7,8}$/.test(datos.dni.trim())) {
    errores.dni = 'El DNI debe contener entre 7 y 8 dígitos numéricos.';
  }

  if (!datos.telefono.trim()) {
    errores.telefono = 'El número de teléfono es obligatorio.';
  } else if (!/^\+?\d{1,15}$/.test(datos.telefono.trim())) {
    errores.telefono = 'Solo dígitos (hasta 15) y prefijo "+" opcional.';
  }

  if (datos.email && datos.email.trim().length > 0) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(datos.email.trim())) {
      errores.email = 'El email no tiene un formato válido.';
    }
  }

  if (!datos.direccion.trim()) {
    errores.direccion = 'La dirección es obligatoria.';
  } else if (datos.direccion.trim().length > 100) {
    errores.direccion = 'La dirección no puede superar los 100 caracteres.';
  }

  return errores;
}

/**
 * PersonasPage - Módulo completo de Gestión de Personas (Adoptantes, Voluntarios y Contactos).
 *
 * TUTORÍA PARA DESARROLLADORES C#:
 * - `useEffect`: Se ejecuta automáticamente al montar la vista en pantalla (como un evento `OnLoaded`)
 *   y dispara `cargarPersonas()` hacia `GET /api/Personas`.
 * - `useCallback`: Memoriza la función `cargarPersonas` para que no se recree en cada renderizado
 *   y pueda ser invocada tanto por `useEffect` como por el botón de "Reintentar".
 */
export const PersonasPage: React.FC = () => {
  // 1. Estados de Datos y Red
  const [personas, setPersonas] = useState<PersonaDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorRed, setErrorRed] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // 2. Estados de Búsqueda y Filtros (Rutas custom de PersonasController)
  const [modoBusqueda, setModoBusqueda] = useState<ModoBusquedaPersona>('nombre');
  const [terminoBusqueda, setTerminoBusqueda] = useState<string>('');
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstadoPersona>('todos');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // 3. Estados de Navegación Interna (Listado / Formulario Alta-Edición / Detalle)
  const [vistaActiva, setVistaActiva] = useState<VistaActiva>('listado');
  const [personaSeleccionada, setPersonaSeleccionada] = useState<PersonaDto | null>(null);
  const [isLoadingDetalle, setIsLoadingDetalle] = useState<boolean>(false);

  // 4. Estados del Formulario (Alta y Edición)
  const [formData, setFormData] = useState<PersonaCrearDto & { activo: boolean }>(
    ESTADO_INICIAL_FORM
  );
  const [erroresForm, setErroresForm] = useState<ErroresFormularioPersona>({});
  const [errorSubmit, setErrorSubmit] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 5. Estados del Modal de Baja (DELETE)
  const [personaAEliminar, setPersonaAEliminar] = useState<PersonaDto | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Notificación temporal de éxito (se limpia a los 4 segundos)
  const mostrarExitoTemporal = (mensaje: string) => {
    setMensajeExito(mensaje);
    window.setTimeout(() => {
      setMensajeExito((actual) => (actual === mensaje ? null : actual));
    }, 4000);
  };

  // Carga inicial: GET /api/Personas
  const cargarPersonas = useCallback(async () => {
    setIsLoading(true);
    setErrorRed(null);
    try {
      const data = await personaService.getAll();
      setPersonas(data);
    } catch (err: unknown) {
      setErrorRed(extractApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarPersonas();
  }, [cargarPersonas]);

  // Ejecuta búsqueda contra los endpoints custom de tu API C#
  const ejecutarBusqueda = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const query = terminoBusqueda.trim();
    if (!query) {
      await cargarPersonas();
      return;
    }

    setIsSearching(true);
    setErrorRed(null);

    try {
      if (modoBusqueda === 'dni') {
        // Usa ruta custom: GET /api/Personas/dni/{dni}
        const encontrada = await personaService.getByDni(query);
        setPersonas(encontrada ? [encontrada] : []);
      } else {
        // Usa ruta custom: GET /api/Personas/buscar?nombre={query}
        const resultados = await personaService.buscarPorNombre(query);
        setPersonas(resultados);
      }
    } catch (err: unknown) {
      setErrorRed(extractApiErrorMessage(err));
    } finally {
      setIsSearching(false);
    }
  };

  const limpiarBusqueda = async () => {
    setTerminoBusqueda('');
    await cargarPersonas();
  };

  // Abrir vista de Detalle consultando GET /api/Personas/{id} para traer datos frescos
  const abrirDetalle = async (persona: PersonaDto) => {
    setPersonaSeleccionada(persona);
    setVistaActiva('detalle');
    setIsLoadingDetalle(true);
    try {
      const fresca = await personaService.getById(persona.idPersona);
      setPersonaSeleccionada(fresca);
    } catch {
      // Si falla el refresco individual, mantenemos los datos que ya teníamos en memoria
    } finally {
      setIsLoadingDetalle(false);
    }
  };

  // Abrir Formulario para Crear (POST)
  const abrirFormularioCrear = () => {
    setPersonaSeleccionada(null);
    setFormData(ESTADO_INICIAL_FORM);
    setErroresForm({});
    setErrorSubmit(null);
    setVistaActiva('formulario');
  };

  // Abrir Formulario para Editar (PUT)
  const abrirFormularioEditar = (persona: PersonaDto) => {
    setPersonaSeleccionada(persona);
    setFormData({
      apellido: persona.apellido ?? '',
      nombre: persona.nombre ?? '',
      dni: persona.dni ?? '',
      telefono: persona.telefono ?? '',
      email: persona.email ?? '',
      direccion: persona.direccion ?? '',
      activo: persona.activo !== false,
    });
    setErroresForm({});
    setErrorSubmit(null);
    setVistaActiva('formulario');
  };

  // Guardar (POST o PUT)
  const handleGuardarFormulario = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorSubmit(null);

    const erroresDetectados = validarFormularioPersona(formData);
    if (Object.keys(erroresDetectados).length > 0) {
      setErroresForm(erroresDetectados);
      return;
    }

    setIsSubmitting(true);
    try {
      if (personaSeleccionada) {
        // Edición: PUT /api/Personas/{id}
        const dtoActualizar: PersonaActualizarDto = {
          idPersona: personaSeleccionada.idPersona,
          apellido: formData.apellido,
          nombre: formData.nombre,
          dni: formData.dni,
          telefono: formData.telefono,
          email: formData.email,
          direccion: formData.direccion,
          activo: formData.activo,
        };
        await personaService.actualizar(personaSeleccionada.idPersona, dtoActualizar);
        mostrarExitoTemporal(
          `Se actualizaron los datos de ${formData.nombre} ${formData.apellido}.`
        );
      } else {
        // Alta: POST /api/Personas
        const dtoCrear: PersonaCrearDto = {
          apellido: formData.apellido,
          nombre: formData.nombre,
          dni: formData.dni,
          telefono: formData.telefono,
          email: formData.email,
          direccion: formData.direccion,
        };
        await personaService.crear(dtoCrear);
        mostrarExitoTemporal(
          `Se registró a ${formData.nombre} ${formData.apellido} correctamente.`
        );
      }

      await cargarPersonas();
      setVistaActiva('listado');
    } catch (err: unknown) {
      setErrorSubmit(extractApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirmar eliminación (DELETE /api/Personas/{id})
  const handleConfirmarEliminar = async () => {
    if (!personaAEliminar) return;

    setIsDeleting(true);
    try {
      await personaService.eliminar(personaAEliminar.idPersona);
      const nombreEliminado = formatNombreCompleto(personaAEliminar);
      setPersonaAEliminar(null);
      if (vistaActiva === 'detalle') {
        setVistaActiva('listado');
      }
      mostrarExitoTemporal(`El registro de ${nombreEliminado} fue dado de baja.`);
      await cargarPersonas();
    } catch (err: unknown) {
      setErrorRed(extractApiErrorMessage(err));
      setPersonaAEliminar(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtrado en memoria por estado Activo / Inactivo
  const personasFiltradas = personas.filter((p) => {
    const esActivo = p.activo !== false;
    if (filtroEstado === 'activos') return esActivo;
    if (filtroEstado === 'inactivos') return !esActivo;
    return true;
  });

  // ============================================================================
  // VISTA 1: FORMULARIO DE ALTA / EDICIÓN
  // ============================================================================
  if (vistaActiva === 'formulario') {
    const esEdicion = Boolean(personaSeleccionada);

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4 border-b border-[#E5DFD7] pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setVistaActiva('listado')}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Volver
            </Button>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 truncate tracking-tight">
              {esEdicion ? 'Editar Ficha de Persona' : 'Registrar Nueva Persona'}
            </h2>
          </div>
          {esEdicion && personaSeleccionada && (
            <span className="text-xs font-medium text-stone-600 tabular-data shrink-0">
              ID #{personaSeleccionada.idPersona}
            </span>
          )}
        </div>

        {errorSubmit && (
          <ErrorAlert
            title="No se pudo guardar el registro"
            message={errorSubmit}
          />
        )}

        <form
          onSubmit={handleGuardarFormulario}
          noValidate
          className="bg-white rounded-xl border border-[#E5DFD7] p-5 sm:p-6 space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nombre *"
              placeholder="Ej. María Belén"
              value={formData.nombre}
              maxLength={50}
              onChange={(e) => {
                setFormData({ ...formData, nombre: e.target.value });
                if (erroresForm.nombre) setErroresForm({ ...erroresForm, nombre: undefined });
              }}
              error={erroresForm.nombre}
            />

            <Input
              label="Apellido *"
              placeholder="Ej. Gutiérrez"
              value={formData.apellido}
              maxLength={50}
              onChange={(e) => {
                setFormData({ ...formData, apellido: e.target.value });
                if (erroresForm.apellido) setErroresForm({ ...erroresForm, apellido: undefined });
              }}
              error={erroresForm.apellido}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="DNI (sin puntos) *"
              placeholder="Ej. 38451290"
              inputMode="numeric"
              maxLength={8}
              value={formData.dni}
              onChange={(e) => {
                const soloDigitos = e.target.value.replace(/[^\d]/g, '');
                setFormData({ ...formData, dni: soloDigitos });
                if (erroresForm.dni) setErroresForm({ ...erroresForm, dni: undefined });
              }}
              error={erroresForm.dni}
              helperText="7 u 8 dígitos numéricos"
              className="tabular-data"
            />

            <Input
              label="Teléfono / Celular *"
              placeholder="Ej. +543815001122"
              inputMode="tel"
              maxLength={16}
              value={formData.telefono}
              onChange={(e) => {
                setFormData({ ...formData, telefono: e.target.value });
                if (erroresForm.telefono) setErroresForm({ ...erroresForm, telefono: undefined });
              }}
              error={erroresForm.telefono}
              helperText="Solo números y signo + opcional"
              className="tabular-data"
            />
          </div>

          <Input
            label="Correo Electrónico (Opcional)"
            type="email"
            placeholder="nombre@correo.com"
            maxLength={100}
            value={formData.email ?? ''}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              if (erroresForm.email) setErroresForm({ ...erroresForm, email: undefined });
            }}
            error={erroresForm.email}
          />

          <Input
            label="Dirección / Domicilio *"
            placeholder="Ej. Av. Calchaquí 450, Tafí del Valle"
            maxLength={100}
            value={formData.direccion}
            onChange={(e) => {
              setFormData({ ...formData, direccion: e.target.value });
              if (erroresForm.direccion) setErroresForm({ ...erroresForm, direccion: undefined });
            }}
            error={erroresForm.direccion}
          />

          {esEdicion && (
            <div className="pt-2 border-t border-[#E5DFD7]">
              <label className="flex items-center justify-between gap-4 py-2 cursor-pointer select-none">
                <div>
                  <span className="text-sm font-semibold text-stone-900 block">
                    Estado del registro en el sistema
                  </span>
                  <span className="text-xs text-stone-600">
                    Las personas activas pueden ser vinculadas a nuevas solicitudes de adopción.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="w-5 h-5 accent-[#B84A27] rounded cursor-pointer"
                />
              </label>
            </div>
          )}

          <div className="pt-4 border-t border-[#E5DFD7] flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setVistaActiva('listado')}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              className="w-full sm:w-auto"
            >
              {esEdicion ? 'Guardar Cambios' : 'Registrar Persona'}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // ============================================================================
  // VISTA 2: DETALLE DE FICHA DE PERSONA
  // ============================================================================
  if (vistaActiva === 'detalle' && personaSeleccionada) {
    const esActivo = personaSeleccionada.activo !== false;

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5DFD7] pb-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setVistaActiva('listado')}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Listado
            </Button>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 truncate tracking-tight">
              {formatNombreCompleto(personaSeleccionada)}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => abrirFormularioEditar(personaSeleccionada)}
              leftIcon={<Edit3 className="w-4 h-4" />}
            >
              Editar
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => setPersonaAEliminar(personaSeleccionada)}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Dar de Baja
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E5DFD7] overflow-hidden">
          <div className="px-5 py-4 bg-[#F3EFEA]/60 border-b border-[#E5DFD7] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-stone-800 tabular-data">
              <Hash className="w-4 h-4 text-[#B84A27]" />
              <span>Registro #{personaSeleccionada.idPersona}</span>
              {isLoadingDetalle && (
                <span className="text-xs font-normal text-stone-600">(verificando...)</span>
              )}
            </div>
            <Badge variant={esActivo ? 'success' : 'neutral'} dot>
              {esActivo ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>

          <dl className="divide-y divide-[#E5DFD7] text-sm">
            <div className="px-5 py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-1">
              <dt className="font-medium text-stone-600">Nombre Completo</dt>
              <dd className="sm:col-span-2 font-semibold text-stone-900">
                {formatNombreCompleto(personaSeleccionada)}
              </dd>
            </div>

            <div className="px-5 py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-1">
              <dt className="font-medium text-stone-600">Documento (DNI)</dt>
              <dd className="sm:col-span-2 font-semibold text-stone-900 tabular-data">
                {personaSeleccionada.dni}
              </dd>
            </div>

            <div className="px-5 py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-1">
              <dt className="font-medium text-stone-600 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-stone-500" />
                Teléfono
              </dt>
              <dd className="sm:col-span-2 tabular-data">
                {personaSeleccionada.telefono ? (
                  <a
                    href={`tel:${personaSeleccionada.telefono}`}
                    className="font-semibold text-[#B84A27] underline underline-offset-4 hover:text-[#9C3B1E]"
                  >
                    {personaSeleccionada.telefono}
                  </a>
                ) : (
                  <span className="text-stone-500">No especificado</span>
                )}
              </dd>
            </div>

            <div className="px-5 py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-1">
              <dt className="font-medium text-stone-600 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-stone-500" />
                Correo Electrónico
              </dt>
              <dd className="sm:col-span-2 break-all">
                {personaSeleccionada.email ? (
                  <a
                    href={`mailto:${personaSeleccionada.email}`}
                    className="font-medium text-[#B84A27] underline underline-offset-4 hover:text-[#9C3B1E]"
                  >
                    {personaSeleccionada.email}
                  </a>
                ) : (
                  <span className="text-stone-500">No registrado</span>
                )}
              </dd>
            </div>

            <div className="px-5 py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-1">
              <dt className="font-medium text-stone-600 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-stone-500" />
                Dirección
              </dt>
              <dd className="sm:col-span-2 text-stone-900">
                {personaSeleccionada.direccion || 'No especificada'}
              </dd>
            </div>

            <div className="px-5 py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-1">
              <dt className="font-medium text-stone-600 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-stone-500" />
                Fecha de Alta
              </dt>
              <dd className="sm:col-span-2 text-stone-800 tabular-data">
                {formatearFecha(personaSeleccionada.fechaAlta)}
              </dd>
            </div>
          </dl>
        </div>

        <ConfirmModal
          isOpen={Boolean(personaAEliminar)}
          title="¿Dar de baja a esta persona?"
          description={
            personaAEliminar
              ? `Estás por eliminar el registro de ${formatNombreCompleto(personaAEliminar)} (DNI ${personaAEliminar.dni}).`
              : ''
          }
          confirmLabel="Sí, dar de baja"
          cancelLabel="Cancelar"
          variant="danger"
          isLoading={isDeleting}
          onConfirm={handleConfirmarEliminar}
          onClose={() => setPersonaAEliminar(null)}
        />
      </div>
    );
  }

  // ============================================================================
  // VISTA 3: LISTADO PRINCIPAL Y BUSCADOR OPERATIVO
  // ============================================================================
  return (
    <div className="space-y-5">
      {/* Cabecera de Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DFD7] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
            Padrones de Personas
          </h2>
          <p className="text-sm text-stone-600 mt-0.5">
            Adoptantes, postulantes, tránsito y contactos vinculados al refugio.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => void cargarPersonas()}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Actualizar
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={abrirFormularioCrear}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Nueva Persona
          </Button>
        </div>
      </div>

      {/* Aviso de Éxito Temporal */}
      {mensajeExito && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="truncate">{mensajeExito}</span>
          </div>
          <button
            type="button"
            onClick={() => setMensajeExito(null)}
            className="text-emerald-700 hover:text-emerald-950 p-1 rounded cursor-pointer"
            aria-label="Cerrar notificación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Barra de Búsqueda (Conectada a /api/Personas/buscar y /api/Personas/dni/{dni}) */}
      <section
        aria-label="Buscador y filtros de personas"
        className="bg-white rounded-xl border border-[#E5DFD7] p-4 space-y-3.5"
      >
        <form onSubmit={ejecutarBusqueda} className="flex flex-col md:flex-row gap-3">
          {/* Selector de Modo de Búsqueda */}
          <div className="inline-flex rounded-lg bg-[#F3EFEA] p-1 border border-[#E5DFD7] shrink-0">
            <button
              type="button"
              onClick={() => setModoBusqueda('nombre')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                modoBusqueda === 'nombre'
                  ? 'bg-white text-[#B84A27] shadow-2xs'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              Por Nombre
            </button>
            <button
              type="button"
              onClick={() => setModoBusqueda('dni')}
              className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                modoBusqueda === 'dni'
                  ? 'bg-white text-[#B84A27] shadow-2xs'
                  : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              Por DNI Exacto
            </button>
          </div>

          {/* Input de Búsqueda */}
          <div className="flex-1 min-w-0">
            <Input
              placeholder={
                modoBusqueda === 'dni'
                  ? 'Ingresa los 7 u 8 dígitos del DNI...'
                  : 'Buscar por nombre o apellido...'
              }
              inputMode={modoBusqueda === 'dni' ? 'numeric' : 'text'}
              value={terminoBusqueda}
              onChange={(e) => setTerminoBusqueda(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              className={modoBusqueda === 'dni' ? 'tabular-data' : ''}
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSearching}
              className="flex-1 sm:flex-initial"
            >
              Buscar
            </Button>
            {terminoBusqueda.trim().length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => void limpiarBusqueda()}
              >
                Limpiar
              </Button>
            )}
          </div>
        </form>

        {/* Filtros rápidos de estado y contador */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E5DFD7]/70 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-stone-600 mr-1">Estado:</span>
            {(['todos', 'activos', 'inactivos'] as FiltroEstadoPersona[]).map((estado) => (
              <button
                key={estado}
                type="button"
                onClick={() => setFiltroEstado(estado)}
                className={`px-2.5 py-1 rounded-full font-medium capitalize transition-colors cursor-pointer ${
                  filtroEstado === estado
                    ? 'bg-stone-800 text-white'
                    : 'bg-[#F3EFEA] text-stone-700 hover:bg-[#EAE4DC]'
                }`}
              >
                {estado}
              </button>
            ))}
          </div>

          <span className="text-stone-600 font-medium tabular-data">
            Mostrando {personasFiltradas.length} de {personas.length} registros
          </span>
        </div>
      </section>

      {/* Estado de Error de Red */}
      {errorRed && (
        <ErrorAlert
          title="Error al cargar el padrón de personas"
          message={errorRed}
          onRetry={() => void cargarPersonas()}
        />
      )}

      {/* Estado de Carga (Skeletons estructurales) */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-[#E5DFD7] divide-y divide-[#E5DFD7]">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-72 max-w-full" />
              </div>
              <Skeleton className="h-9 w-24 shrink-0" />
            </div>
          ))}
        </div>
      ) : personasFiltradas.length === 0 ? (
        /* Estado Vacío Pedagógico */
        <EmptyState
          icon={Users}
          title={
            terminoBusqueda.trim().length > 0
              ? 'No se encontraron personas con ese criterio'
              : 'Aún no hay personas registradas en el padrón'
          }
          description={
            terminoBusqueda.trim().length > 0
              ? 'Intenta cambiar entre búsqueda por nombre o por DNI exacto, o limpia el filtro activo.'
              : 'Registra adoptantes, voluntarios o responsables para vincularlos a los procesos del refugio.'
          }
          actionLabel={
            terminoBusqueda.trim().length > 0 ? 'Ver todo el padrón' : 'Registrar Primera Persona'
          }
          onAction={
            terminoBusqueda.trim().length > 0
              ? () => void limpiarBusqueda()
              : abrirFormularioCrear
          }
        />
      ) : (
        /* Contenedor de Resultados: Tabla en Escritorio + Lista Táctil en Android */
        <div className="bg-white rounded-xl border border-[#E5DFD7] overflow-hidden">
          {/* A. Tabla Operativa de Escritorio (md:block) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F3EFEA] border-b border-[#E5DFD7] text-xs font-semibold text-stone-700">
                  <th className="py-3.5 px-4">DNI</th>
                  <th className="py-3.5 px-4">Nombre y Apellido</th>
                  <th className="py-3.5 px-4">Teléfono</th>
                  <th className="py-3.5 px-4">Dirección / Email</th>
                  <th className="py-3.5 px-4">Alta</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DFD7] text-sm">
                {personasFiltradas.map((persona) => {
                  const esActivo = persona.activo !== false;
                  return (
                    <tr
                      key={persona.idPersona}
                      className="hover:bg-[#FAF8F5] transition-colors"
                    >
                      <td className="py-3.5 px-4 font-semibold text-stone-900 tabular-data whitespace-nowrap">
                        {persona.dni}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-stone-900">
                        <button
                          type="button"
                          onClick={() => void abrirDetalle(persona)}
                          className="text-left hover:text-[#B84A27] focus-visible:outline-2 focus-visible:outline-[#B84A27] rounded cursor-pointer"
                        >
                          {formatNombreCompleto(persona)}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 tabular-data whitespace-nowrap">
                        {persona.telefono ? (
                          <a
                            href={`tel:${persona.telefono}`}
                            className="text-stone-800 hover:text-[#B84A27] underline decoration-stone-300 underline-offset-4"
                          >
                            {persona.telefono}
                          </a>
                        ) : (
                          <span className="text-stone-500">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-stone-800 truncate">
                          {persona.direccion || 'Sin dirección'}
                        </p>
                        {persona.email && (
                          <p className="text-xs text-stone-600 truncate">{persona.email}</p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-stone-600 tabular-data whitespace-nowrap">
                        {formatearFecha(persona.fechaAlta)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <Badge variant={esActivo ? 'success' : 'neutral'} dot>
                          {esActivo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => void abrirDetalle(persona)}
                            title="Ver ficha completa"
                            aria-label={`Ver ficha de ${formatNombreCompleto(persona)}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => abrirFormularioEditar(persona)}
                            title="Editar"
                            aria-label={`Editar a ${formatNombreCompleto(persona)}`}
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setPersonaAEliminar(persona)}
                            title="Dar de baja"
                            aria-label={`Dar de baja a ${formatNombreCompleto(persona)}`}
                            className="text-red-700 hover:bg-red-50 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* B. Lista Táctil para Móvil Android (md:hidden) */}
          <div className="md:hidden divide-y divide-[#E5DFD7]">
            {personasFiltradas.map((persona) => {
              const esActivo = persona.activo !== false;
              return (
                <div key={persona.idPersona} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => void abrirDetalle(persona)}
                        className="font-bold text-base text-stone-900 hover:text-[#B84A27] text-left truncate block cursor-pointer"
                      >
                        {formatNombreCompleto(persona)}
                      </button>
                      <span className="text-xs font-semibold text-stone-600 tabular-data block mt-0.5">
                        DNI {persona.dni}
                      </span>
                    </div>
                    <Badge variant={esActivo ? 'success' : 'neutral'} dot>
                      {esActivo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </div>

                  <div className="space-y-1 text-xs text-stone-700">
                    {persona.telefono && (
                      <div className="flex items-center gap-2 tabular-data">
                        <Phone className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                        <a
                          href={`tel:${persona.telefono}`}
                          className="font-semibold text-[#B84A27] underline underline-offset-2"
                        >
                          {persona.telefono}
                        </a>
                      </div>
                    )}
                    {persona.direccion && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                        <span className="truncate">{persona.direccion}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E5DFD7]/60">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => void abrirDetalle(persona)}
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                    >
                      Ficha
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => abrirFormularioEditar(persona)}
                      leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                    >
                      Editar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPersonaAEliminar(persona)}
                      className="border-red-200 text-red-700 hover:bg-red-50"
                      aria-label={`Eliminar a ${formatNombreCompleto(persona)}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de Confirmación para Baja (DELETE /api/Personas/{id}) */}
      <ConfirmModal
        isOpen={Boolean(personaAEliminar)}
        title="¿Dar de baja a esta persona?"
        description={
          personaAEliminar
            ? `Se ejecutará la baja del registro de ${formatNombreCompleto(personaAEliminar)} (DNI ${personaAEliminar.dni}).`
            : ''
        }
        confirmLabel="Sí, dar de baja"
        cancelLabel="Cancelar"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmarEliminar}
        onClose={() => setPersonaAEliminar(null)}
      />
    </div>
  );
};
