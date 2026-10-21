import React, { useState, useEffect, useCallback } from 'react';
import {
  HeartHandshake,
  Plus,
  RefreshCw,
  CheckCircle2,
  X,
  User,
  Dog,
  Check,
  FileCheck,
} from 'lucide-react';
import {
  Button,
  Badge,
  Skeleton,
  ErrorAlert,
  EmptyState,
} from '../components/ui';
import { adopcionService } from '../services/adopcionService';
import { personaService } from '../services/personaService';
import { animalService } from '../services/animalService';
import {
  SolicitudAdopcionDto,
  SolicitudAdopcionCrearDto,
  EstadoSolicitudAdopcion,
} from '../types/adopcion.types';
import { PersonaDto } from '../types/persona.types';
import { AnimalDto } from '../types/animal.types';
import { extractApiErrorMessage } from '../api/axiosClient';

export const AdopcionesPage: React.FC = () => {
  const [solicitudes, setSolicitudes] = useState<SolicitudAdopcionDto[]>([]);
  const [personas, setPersonas] = useState<PersonaDto[]>([]);
  const [animales, setAnimales] = useState<AnimalDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorRed, setErrorRed] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const [filtroEstado, setFiltroEstado] = useState<string>('Todas');

  // Modal / Formulario Nueva Solicitud
  const [mostrarModalCrear, setMostrarModalCrear] = useState<boolean>(false);
  const [nuevaSolicitud, setNuevaSolicitud] = useState<SolicitudAdopcionCrearDto>({
    idPersona: 0,
    idAnimal: 0,
    observacion: '',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const mostrarExitoTemporal = (mensaje: string) => {
    setMensajeExito(mensaje);
    window.setTimeout(() => {
      setMensajeExito((actual) => (actual === mensaje ? null : actual));
    }, 4000);
  };

  const cargarDatos = useCallback(async () => {
    setIsLoading(true);
    setErrorRed(null);
    try {
      const [dataSolicitudes, dataPersonas, dataAnimales] = await Promise.all([
        adopcionService.getAll(),
        personaService.getAll().catch(() => []),
        animalService.getAll().catch(() => []),
      ]);
      setSolicitudes(dataSolicitudes);
      setPersonas(dataPersonas);
      setAnimales(dataAnimales);
    } catch (err: unknown) {
      setErrorRed(extractApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarDatos();
  }, [cargarDatos]);

  const handleCrearSolicitud = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaSolicitud.idPersona || !nuevaSolicitud.idAnimal) {
      alert('Debes seleccionar tanto la persona adoptante como el animal.');
      return;
    }

    setIsSubmitting(true);
    try {
      const personaObj = personas.find((p) => p.idPersona === Number(nuevaSolicitud.idPersona));
      const animalObj = animales.find((a) => a.idAnimal === Number(nuevaSolicitud.idAnimal));

      await adopcionService.crear(nuevaSolicitud, {
        personaNombre: personaObj ? `${personaObj.nombre} ${personaObj.apellido}` : undefined,
        animalNombre: animalObj?.nombre,
      });

      mostrarExitoTemporal('Solicitud de adopción registrada con éxito.');
      setMostrarModalCrear(false);
      setNuevaSolicitud({ idPersona: 0, idAnimal: 0, observacion: '' });
      await cargarDatos();
    } catch (err: unknown) {
      setErrorRed(extractApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const cambiarEstado = async (idSolicitud: number, nuevoEstado: EstadoSolicitudAdopcion) => {
    try {
      await adopcionService.cambiarEstado(idSolicitud, nuevoEstado);
      mostrarExitoTemporal(`Solicitud #${idSolicitud} actualizada a "${nuevoEstado}".`);
      await cargarDatos();
    } catch (err: unknown) {
      setErrorRed(extractApiErrorMessage(err));
    }
  };

  const solicitudesFiltradas = solicitudes.filter((s) => {
    if (filtroEstado === 'Todas') return true;
    return s.estado === filtroEstado;
  });

  const getBadgeEstado = (estado: EstadoSolicitudAdopcion) => {
    switch (estado) {
      case 'Pendiente':
        return <Badge variant="warning" dot>Pendiente de Revisión</Badge>;
      case 'Aprobada':
        return <Badge variant="info" dot>Aprobada (Listo para entrega)</Badge>;
      case 'Concretada':
        return <Badge variant="success" dot>Adopción Concretada</Badge>;
      case 'Rechazada':
        return <Badge variant="danger" dot>Rechazada</Badge>;
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DFD7] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
            Gestión de Adopciones
          </h2>
          <p className="text-sm text-stone-600 mt-0.5">
            Control de solicitudes, entrevistas y formalización de entregas responsables.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => void cargarDatos()}
            disabled={isLoading}
            leftIcon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Actualizar
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => setMostrarModalCrear(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Nueva Solicitud
          </Button>
        </div>
      </div>

      {mensajeExito && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900"
        >
          <div className="flex items-center gap-2 min-w-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="truncate">{mensajeExito}</span>
          </div>
          <button
            type="button"
            onClick={() => setMensajeExito(null)}
            className="text-emerald-700 hover:text-emerald-950 p-1"
            aria-label="Cerrar notificación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filtros por estado */}
      <div className="flex flex-wrap items-center gap-2 bg-white rounded-xl border border-[#E5DFD7] p-3">
        <span className="text-xs font-semibold text-stone-600 mr-1">Filtrar por:</span>
        {(['Todas', 'Pendiente', 'Aprobada', 'Concretada', 'Rechazada'] as const).map((est) => (
          <button
            key={est}
            type="button"
            onClick={() => setFiltroEstado(est)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              filtroEstado === est
                ? 'bg-stone-900 text-white shadow-2xs'
                : 'bg-[#F3EFEA] text-stone-700 hover:bg-[#EAE4DC]'
            }`}
          >
            {est}
          </button>
        ))}
      </div>

      {errorRed && (
        <ErrorAlert
          title="Error en la gestión de adopciones"
          message={errorRed}
          onRetry={() => void cargarDatos()}
        />
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-xl border border-[#E5DFD7] p-5 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-72" />
            </div>
          ))}
        </div>
      ) : solicitudesFiltradas.length === 0 ? (
        <EmptyState
          icon={HeartHandshake}
          title="No hay solicitudes en esta categoría"
          description="Inicia una nueva solicitud vinculando un adoptante del padrón de personas con un animal disponible."
          actionLabel="Registrar Solicitud"
          onAction={() => setMostrarModalCrear(true)}
        />
      ) : (
        <div className="space-y-3.5">
          {solicitudesFiltradas.map((solicitud) => (
            <div
              key={solicitud.idSolicitudAdopcion}
              className="bg-white rounded-xl border border-[#E5DFD7] p-4 sm:p-5 space-y-3 hover:border-stone-400 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5DFD7] pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-stone-900">
                    Solicitud #{solicitud.idSolicitudAdopcion}
                  </span>
                  <span className="text-xs text-stone-500 tabular-data">
                    • Fecha: {solicitud.fecha}
                  </span>
                </div>
                <div>{getBadgeEstado(solicitud.estado)}</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3 bg-[#FAF8F5] p-3 rounded-lg border border-[#E5DFD7]">
                  <User className="w-5 h-5 text-[#B84A27] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-semibold text-stone-900">
                      {solicitud.personaNombre || `Persona #${solicitud.idPersona}`}
                    </p>
                    {solicitud.personaDni && (
                      <p className="text-stone-600 tabular-data">DNI: {solicitud.personaDni}</p>
                    )}
                    {solicitud.personaTelefono && (
                      <p className="text-stone-600 tabular-data">Tel: {solicitud.personaTelefono}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-[#FAF8F5] p-3 rounded-lg border border-[#E5DFD7]">
                  <Dog className="w-5 h-5 text-[#B84A27] shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-semibold text-stone-900">
                      {solicitud.animalNombre || `Animal #${solicitud.idAnimal}`}
                    </p>
                    {solicitud.animalCodigo && (
                      <p className="text-stone-600 font-mono text-xs">{solicitud.animalCodigo}</p>
                    )}
                  </div>
                </div>
              </div>

              {solicitud.observacion && (
                <p className="text-xs sm:text-sm text-stone-700 bg-white p-2.5 rounded border border-[#E5DFD7]">
                  <span className="font-semibold text-stone-800">Notas de entrevista: </span>
                  {solicitud.observacion}
                </p>
              )}

              {/* Botones de cambio de estado */}
              <div className="pt-2 flex flex-wrap items-center justify-end gap-2 border-t border-[#E5DFD7]/60">
                {solicitud.estado === 'Pendiente' && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void cambiarEstado(solicitud.idSolicitudAdopcion, 'Rechazada')}
                      className="text-red-700 border-red-200 hover:bg-red-50"
                      leftIcon={<X className="w-3.5 h-3.5" />}
                    >
                      Rechazar
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => void cambiarEstado(solicitud.idSolicitudAdopcion, 'Aprobada')}
                      leftIcon={<Check className="w-3.5 h-3.5" />}
                    >
                      Aprobar Solicitud
                    </Button>
                  </>
                )}

                {solicitud.estado === 'Aprobada' && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => void cambiarEstado(solicitud.idSolicitudAdopcion, 'Concretada')}
                    leftIcon={<FileCheck className="w-3.5 h-3.5" />}
                    className="bg-emerald-700 hover:bg-emerald-800"
                  >
                    Concretar Entrega de Adopción
                  </Button>
                )}

                {solicitud.estado === 'Concretada' && (
                  <span className="text-xs text-emerald-800 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Proceso de adopción finalizado exitosamente
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal / Formulario Nueva Solicitud */}
      {mostrarModalCrear && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs"
            onClick={() => setMostrarModalCrear(false)}
            aria-hidden="true"
          />

          <div className="relative w-full max-w-lg bg-white rounded-2xl border border-[#E5DFD7] p-5 sm:p-6 shadow-xl z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5DFD7] pb-3">
              <h3 className="font-bold text-lg text-stone-900">
                Nueva Solicitud de Adopción
              </h3>
              <button
                type="button"
                onClick={() => setMostrarModalCrear(false)}
                className="text-stone-400 hover:text-stone-700 p-1"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCrearSolicitud} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="adopcion-persona" className="block text-xs sm:text-sm font-semibold text-stone-800">
                  Adoptante / Postulante (del Padrón de Personas) *
                </label>
                <select
                  id="adopcion-persona"
                  value={nuevaSolicitud.idPersona}
                  onChange={(e) =>
                    setNuevaSolicitud({ ...nuevaSolicitud, idPersona: Number(e.target.value) })
                  }
                  required
                  className="w-full rounded-lg bg-white border border-[#E5DFD7] px-3 py-2.5 text-sm text-stone-900 min-h-[44px]"
                >
                  <option value={0}>Selecciona una persona...</option>
                  {personas.map((p) => (
                    <option key={p.idPersona} value={p.idPersona}>
                      {p.nombre} {p.apellido} (DNI: {p.dni})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="adopcion-animal" className="block text-xs sm:text-sm font-semibold text-stone-800">
                  Animal a Adoptar *
                </label>
                <select
                  id="adopcion-animal"
                  value={nuevaSolicitud.idAnimal}
                  onChange={(e) =>
                    setNuevaSolicitud({ ...nuevaSolicitud, idAnimal: Number(e.target.value) })
                  }
                  required
                  className="w-full rounded-lg bg-white border border-[#E5DFD7] px-3 py-2.5 text-sm text-stone-900 min-h-[44px]"
                >
                  <option value={0}>Selecciona un animal...</option>
                  {animales.map((a) => (
                    <option key={a.idAnimal} value={a.idAnimal}>
                      {a.nombre} ({a.codigoIdentificacion} - {a.estadoNombre || 'Disponible'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="adopcion-observacion" className="block text-xs sm:text-sm font-semibold text-stone-800">
                  Observaciones de la entrevista o del hogar
                </label>
                <textarea
                  id="adopcion-observacion"
                  rows={3}
                  placeholder="Detalles sobre el patio, cerramiento, otros animales en la casa, etc."
                  value={nuevaSolicitud.observacion || ''}
                  onChange={(e) =>
                    setNuevaSolicitud({ ...nuevaSolicitud, observacion: e.target.value })
                  }
                  className="w-full rounded-lg bg-white border border-[#E5DFD7] px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-500"
                />
              </div>

              <div className="pt-3 border-t border-[#E5DFD7] flex justify-end gap-2.5">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setMostrarModalCrear(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" isLoading={isSubmitting}>
                  Registrar Solicitud
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
