import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  RefreshCw,
  CheckCircle2,
  X,
  ArrowLeft,
  Pill,
} from 'lucide-react';
import {
  Button,
  Input,
  Skeleton,
  ErrorAlert,
  EmptyState,
  ConfirmModal,
} from '../components/ui';
import { medicamentoService } from '../services/medicamentoService';
import { extractApiErrorMessage } from '../api/axiosClient';
import { MedicamentoDto, MedicamentoCrearDto } from '../types/medicamento.types';

type VistaActiva = 'listado' | 'formulario';

interface ErroresFormularioMedicamento {
  nombre?: string;
  descripcion?: string;
}

const FORM_INICIAL: MedicamentoCrearDto = {
  nombre: '',
  descripcion: '',
};

export const MedicamentosPage: React.FC = () => {
  const [medicamentos, setMedicamentos] = useState<MedicamentoDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorRed, setErrorRed] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const [terminoBusqueda, setTerminoBusqueda] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const [vistaActiva, setVistaActiva] = useState<VistaActiva>('listado');
  const [medicamentoSeleccionado, setMedicamentoSeleccionado] = useState<MedicamentoDto | null>(null);
  const [formData, setFormData] = useState<MedicamentoCrearDto>(FORM_INICIAL);
  const [erroresForm, setErroresForm] = useState<ErroresFormularioMedicamento>({});
  const [errorSubmit, setErrorSubmit] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [medicamentoAEliminar, setMedicamentoAEliminar] = useState<MedicamentoDto | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const mostrarExitoTemporal = (mensaje: string) => {
    setMensajeExito(mensaje);
    window.setTimeout(() => {
      setMensajeExito((actual) => (actual === mensaje ? null : actual));
    }, 4000);
  };

  const cargarMedicamentos = useCallback(async () => {
    setIsLoading(true);
    setErrorRed(null);
    try {
      const data = await medicamentoService.getAll();
      setMedicamentos(data);
    } catch (err: unknown) {
      setErrorRed(extractApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarMedicamentos();
  }, [cargarMedicamentos]);

  const ejecutarBusqueda = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = terminoBusqueda.trim();
    if (!query) {
      await cargarMedicamentos();
      return;
    }

    setIsSearching(true);
    setErrorRed(null);
    try {
      const resultados = await medicamentoService.buscar(query);
      setMedicamentos(resultados);
    } catch (err: unknown) {
      setErrorRed(extractApiErrorMessage(err));
    } finally {
      setIsSearching(false);
    }
  };

  const limpiarBusqueda = async () => {
    setTerminoBusqueda('');
    await cargarMedicamentos();
  };

  const abrirFormularioCrear = () => {
    setMedicamentoSeleccionado(null);
    setFormData(FORM_INICIAL);
    setErroresForm({});
    setErrorSubmit(null);
    setVistaActiva('formulario');
  };

  const abrirFormularioEditar = (medicamento: MedicamentoDto) => {
    setMedicamentoSeleccionado(medicamento);
    setFormData({
      nombre: medicamento.nombre,
      descripcion: medicamento.descripcion || '',
    });
    setErroresForm({});
    setErrorSubmit(null);
    setVistaActiva('formulario');
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorSubmit(null);

    const errores: ErroresFormularioMedicamento = {};
    if (!formData.nombre.trim()) {
      errores.nombre = 'El nombre del medicamento es obligatorio.';
    } else if (formData.nombre.trim().length > 50) {
      errores.nombre = 'El nombre no puede tener más de 50 caracteres.';
    }

    if (Object.keys(errores).length > 0) {
      setErroresForm(errores);
      return;
    }

    setIsSubmitting(true);
    try {
      if (medicamentoSeleccionado) {
        await medicamentoService.actualizar(medicamentoSeleccionado.idMedicamento, {
          idMedicamento: medicamentoSeleccionado.idMedicamento,
          nombre: formData.nombre,
          descripcion: formData.descripcion,
        });
        mostrarExitoTemporal(`Medicamento "${formData.nombre}" actualizado.`);
      } else {
        await medicamentoService.crear(formData);
        mostrarExitoTemporal(`Medicamento "${formData.nombre}" registrado con éxito.`);
      }
      await cargarMedicamentos();
      setVistaActiva('listado');
    } catch (err: unknown) {
      setErrorSubmit(extractApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEliminar = async () => {
    if (!medicamentoAEliminar) return;
    setIsDeleting(true);
    try {
      await medicamentoService.eliminar(medicamentoAEliminar.idMedicamento);
      const nombreBorrado = medicamentoAEliminar.nombre;
      setMedicamentoAEliminar(null);
      mostrarExitoTemporal(`Medicamento "${nombreBorrado}" eliminado del catálogo.`);
      await cargarMedicamentos();
    } catch (err: unknown) {
      setErrorRed(extractApiErrorMessage(err));
      setMedicamentoAEliminar(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // VISTA FORMULARIO
  if (vistaActiva === 'formulario') {
    const esEdicion = Boolean(medicamentoSeleccionado);
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
            {esEdicion ? 'Editar Medicamento' : 'Registrar Medicamento'}
          </h2>
        </div>

        {errorSubmit && (
          <ErrorAlert title="Error al guardar medicamento" message={errorSubmit} />
        )}

        <form
          onSubmit={handleGuardar}
          noValidate
          className="bg-white rounded-xl border border-[#E5DFD7] p-5 sm:p-6 space-y-5"
        >
          <Input
            label="Nombre del Medicamento *"
            placeholder="Ej. Cefalexina 500mg, Meloxicam, Enrofloxacina..."
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
              htmlFor="medicamento-descripcion"
              className="block text-xs sm:text-sm font-semibold text-stone-800"
            >
              Descripción / Vía de Administración (Opcional)
            </label>
            <textarea
              id="medicamento-descripcion"
              rows={3}
              maxLength={100}
              placeholder="Ej. Antibiótico de amplio espectro, vía oral cada 12 horas con comida."
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
            Catálogo de Medicamentos
          </h2>
          <p className="text-sm text-stone-600 mt-0.5">
            Fármacos e insumos terapéuticos para tratamientos veterinarios (api/Medicamento).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => void cargarMedicamentos()}
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
            Nuevo Medicamento
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
            placeholder="Buscar medicamento por nombre..."
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
          title="Error de conexión con MedicamentoController"
          message={errorRed}
          onRetry={() => void cargarMedicamentos()}
        />
      )}

      {isLoading ? (
        <div className="bg-white rounded-xl border border-[#E5DFD7] divide-y divide-[#E5DFD7]">
          {[1, 2, 3].map((n) => (
            <div key={n} className="p-4 sm:p-5 flex items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-44" />
                <Skeleton className="h-4 w-72" />
              </div>
              <Skeleton className="h-9 w-20 shrink-0" />
            </div>
          ))}
        </div>
      ) : medicamentos.length === 0 ? (
        <EmptyState
          icon={Pill}
          title={
            terminoBusqueda.trim()
              ? 'No se encontraron medicamentos con ese término'
              : 'El catálogo de medicamentos está vacío'
          }
          description="Registra fármacos para asociarlos a los tratamientos médicos y recetas del refugio."
          actionLabel={terminoBusqueda.trim() ? 'Ver todos los medicamentos' : 'Registrar Primer Medicamento'}
          onAction={terminoBusqueda.trim() ? () => void limpiarBusqueda() : abrirFormularioCrear}
        />
      ) : (
        <div className="bg-white rounded-xl border border-[#E5DFD7] overflow-hidden divide-y divide-[#E5DFD7]">
          {medicamentos.map((medicamento) => (
            <div
              key={medicamento.idMedicamento}
              className="p-4 sm:px-5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF8F5] transition-colors"
            >
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-base text-stone-900 tracking-tight">
                    {medicamento.nombre}
                  </span>
                  <span className="text-xs text-stone-500 tabular-data">
                    ID #{medicamento.idMedicamento}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600">
                  {medicamento.descripcion || 'Sin descripción adicional'}
                </p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => abrirFormularioEditar(medicamento)}
                  leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                >
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMedicamentoAEliminar(medicamento)}
                  className="border-red-200 text-red-700 hover:bg-red-50"
                  aria-label={`Eliminar medicamento ${medicamento.nombre}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(medicamentoAEliminar)}
        title="¿Eliminar este medicamento del catálogo?"
        description={
          medicamentoAEliminar
            ? `Se eliminará permanentemente "${medicamentoAEliminar.nombre}" (ID #${medicamentoAEliminar.idMedicamento}).`
            : ''
        }
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleEliminar}
        onClose={() => setMedicamentoAEliminar(null)}
      />
    </div>
  );
};
