import React, { useState, useEffect, useCallback } from 'react';
import {
  Syringe,
  Plus,
  Search,
  Edit3,
  Trash2,
  RefreshCw,
  CheckCircle2,
  X,
  ArrowLeft,
} from 'lucide-react';
import {
  Button,
  Input,
  Skeleton,
  ErrorAlert,
  EmptyState,
  ConfirmModal,
} from '../components/ui';
import { vacunaService } from '../services/vacunaService';
import { extractApiErrorMessage } from '../api/axiosClient';
import { VacunaDto, VacunaCrearDto } from '../types/vacuna.types';

type VistaActiva = 'listado' | 'formulario';

interface ErroresFormularioVacuna {
  nombre?: string;
  descripcion?: string;
}

const FORM_INICIAL: VacunaCrearDto = {
  nombre: '',
  descripcion: '',
};

export const VacunasPage: React.FC = () => {
  const [vacunas, setVacunas] = useState<VacunaDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorRed, setErrorRed] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const [terminoBusqueda, setTerminoBusqueda] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const [vistaActiva, setVistaActiva] = useState<VistaActiva>('listado');
  const [vacunaSeleccionada, setVacunaSeleccionada] = useState<VacunaDto | null>(null);
  const [formData, setFormData] = useState<VacunaCrearDto>(FORM_INICIAL);
  const [erroresForm, setErroresForm] = useState<ErroresFormularioVacuna>({});
  const [errorSubmit, setErrorSubmit] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [vacunaAEliminar, setVacunaAEliminar] = useState<VacunaDto | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const mostrarExitoTemporal = (mensaje: string) => {
    setMensajeExito(mensaje);
    window.setTimeout(() => {
      setMensajeExito((actual) => (actual === mensaje ? null : actual));
    }, 4000);
  };

  const cargarVacunas = useCallback(async () => {
    setIsLoading(true);
    setErrorRed(null);
    try {
      const data = await vacunaService.getAll();
      setVacunas(data);
    } catch (err: unknown) {
      setErrorRed(extractApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarVacunas();
  }, [cargarVacunas]);

  const ejecutarBusqueda = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = terminoBusqueda.trim();
    if (!query) {
      await cargarVacunas();
      return;
    }

    setIsSearching(true);
    setErrorRed(null);
    try {
      const resultados = await vacunaService.buscar(query);
      setVacunas(resultados);
    } catch (err: unknown) {
      setErrorRed(extractApiErrorMessage(err));
    } finally {
      setIsSearching(false);
    }
  };

  const limpiarBusqueda = async () => {
    setTerminoBusqueda('');
    await cargarVacunas();
  };

  const abrirFormularioCrear = () => {
    setVacunaSeleccionada(null);
    setFormData(FORM_INICIAL);
    setErroresForm({});
    setErrorSubmit(null);
    setVistaActiva('formulario');
  };

  const abrirFormularioEditar = (vacuna: VacunaDto) => {
    setVacunaSeleccionada(vacuna);
    setFormData({
      nombre: vacuna.nombre,
      descripcion: vacuna.descripcion || '',
    });
    setErroresForm({});
    setErrorSubmit(null);
    setVistaActiva('formulario');
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorSubmit(null);

    const errores: ErroresFormularioVacuna = {};
    if (!formData.nombre.trim()) {
      errores.nombre = 'El nombre de la vacuna es obligatorio.';
    } else if (formData.nombre.trim().length > 50) {
      errores.nombre = 'El nombre no puede tener más de 50 caracteres.';
    }

    if (Object.keys(errores).length > 0) {
      setErroresForm(errores);
      return;
    }

    setIsSubmitting(true);
    try {
      if (vacunaSeleccionada) {
        await vacunaService.actualizar(vacunaSeleccionada.idVacuna, {
          idVacuna: vacunaSeleccionada.idVacuna,
          nombre: formData.nombre,
          descripcion: formData.descripcion,
        });
        mostrarExitoTemporal(`Vacuna "${formData.nombre}" actualizada.`);
      } else {
        await vacunaService.crear(formData);
        mostrarExitoTemporal(`Vacuna "${formData.nombre}" registrada correctamente.`);
      }
      await cargarVacunas();
      setVistaActiva('listado');
    } catch (err: unknown) {
      setErrorSubmit(extractApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEliminar = async () => {
    if (!vacunaAEliminar) return;
    setIsDeleting(true);
    try {
      await vacunaService.eliminar(vacunaAEliminar.idVacuna);
      const nombreBorrado = vacunaAEliminar.nombre;
      setVacunaAEliminar(null);
      mostrarExitoTemporal(`La vacuna "${nombreBorrado}" fue eliminada del catálogo.`);
      await cargarVacunas();
    } catch (err: unknown) {
      setErrorRed(extractApiErrorMessage(err));
      setVacunaAEliminar(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // VISTA FORMULARIO
  if (vistaActiva === 'formulario') {
    const esEdicion = Boolean(vacunaSeleccionada);
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center gap-3 border-b border-[#E5DFD7] pb-4">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setVistaActiva('listado')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Volver
          </Button>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
            {esEdicion ? 'Editar Vacuna' : 'Registrar Vacuna'}
          </h2>
        </div>

        {errorSubmit && (
          <ErrorAlert title="Error al guardar vacuna" message={errorSubmit} />
        )}

        <form
          onSubmit={handleGuardar}
          noValidate
          className="bg-white rounded-xl border border-[#E5DFD7] p-5 sm:p-6 space-y-5"
        >
          <Input
            label="Nombre de la Vacuna *"
            placeholder="Ej. Antirrábica, Séxtuple, Triple Felina..."
            maxLength={50}
            value={formData.nombre}
            onChange={(e) => {
              setFormData({ ...formData, nombre: e.target.value });
              if (erroresForm.nombre) setErroresForm({ ...erroresForm, nombre: undefined });
            }}
            error={erroresForm.nombre}
            helperText="Máximo 50 caracteres"
          />

          <div className="space-y-1.5">
            <label
              htmlFor="vacuna-descripcion"
              className="block text-xs sm:text-sm font-semibold text-stone-800"
            >
              Descripción / Indicaciones (Opcional)
            </label>
            <textarea
              id="vacuna-descripcion"
              rows={3}
              maxLength={100}
              placeholder="Ej. Dosis anual obligatoria a partir de los 3 meses de edad."
              value={formData.descripcion || ''}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="w-full rounded-lg bg-white border border-[#E5DFD7] px-3.5 py-2.5 text-base sm:text-sm text-stone-900 placeholder:text-stone-500 focus:outline-hidden focus:ring-2 focus:ring-[#B84A27]/20 focus:border-[#B84A27]"
            />
            <span className="text-xs text-stone-500 block">Máximo 100 caracteres</span>
          </div>

          <div className="pt-4 border-t border-[#E5DFD7] flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setVistaActiva('listado')}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {esEdicion ? 'Guardar Cambios' : 'Registrar'}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // VISTA LISTADO
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DFD7] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
            Catálogo de Vacunas
          </h2>
          <p className="text-sm text-stone-600 mt-0.5">
            Gestión del plan de vacunación e inmunización del refugio.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => void cargarVacunas()}
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
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Nueva Vacuna
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

      {/* Buscador */}
      <form onSubmit={ejecutarBusqueda} className="flex gap-2.5">
        <div className="flex-1 min-w-0">
          <Input
            placeholder="Buscar vacuna por nombre..."
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <Button type="submit" variant="primary" size="md" isLoading={isSearching}>
          Buscar
        </Button>
        {terminoBusqueda.trim().length > 0 && (
          <Button type="button" variant="outline" size="md" onClick={() => void limpiarBusqueda()}>
            Limpiar
          </Button>
        )}
      </form>

      {errorRed && (
        <ErrorAlert
          title="Error de conexión con VacunaController"
          message={errorRed}
          onRetry={() => void cargarVacunas()}
        />
      )}

      {isLoading ? (
        <div className="bg-white rounded-xl border border-[#E5DFD7] divide-y divide-[#E5DFD7]">
          {[1, 2, 3].map((n) => (
            <div key={n} className="p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-9 w-20 shrink-0" />
            </div>
          ))}
        </div>
      ) : vacunas.length === 0 ? (
        <EmptyState
          icon={Syringe}
          title={
            terminoBusqueda.trim()
              ? 'No se encontraron vacunas con ese término'
              : 'El catálogo de vacunas está vacío'
          }
          description="Registra los tipos de vacunas disponibles para asociarlas luego a las atenciones veterinarias de los animales."
          actionLabel={terminoBusqueda.trim() ? 'Ver todas las vacunas' : 'Registrar Primera Vacuna'}
          onAction={terminoBusqueda.trim() ? () => void limpiarBusqueda() : abrirFormularioCrear}
        />
      ) : (
        <div className="bg-white rounded-xl border border-[#E5DFD7] overflow-hidden divide-y divide-[#E5DFD7]">
          {vacunas.map((vacuna) => (
            <div
              key={vacuna.idVacuna}
              className="p-4 sm:px-5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF8F5] transition-colors"
            >
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-base text-stone-900 tracking-tight">
                    {vacuna.nombre}
                  </span>
                  <span className="text-xs text-stone-500 tabular-data">
                    ID #{vacuna.idVacuna}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600">
                  {vacuna.descripcion || 'Sin descripción adicional'}
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => abrirFormularioEditar(vacuna)}
                  leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                >
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setVacunaAEliminar(vacuna)}
                  className="border-red-200 text-red-700 hover:bg-red-50"
                  aria-label={`Eliminar vacuna ${vacuna.nombre}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(vacunaAEliminar)}
        title="¿Eliminar esta vacuna del catálogo?"
        description={
          vacunaAEliminar
            ? `Se eliminará permanentemente "${vacunaAEliminar.nombre}" (ID #${vacunaAEliminar.idVacuna}).`
            : ''
        }
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleEliminar}
        onClose={() => setVacunaAEliminar(null)}
      />
    </div>
  );
};
