import React, { useState, useEffect, useCallback } from 'react';
import {
  Dog,
  Plus,
  RefreshCw,
  CheckCircle2,
  X,
  ArrowLeft,
  Filter,
} from 'lucide-react';
import {
  Button,
  Input,
  Badge,
  Skeleton,
  ErrorAlert,
  EmptyState,
} from '../components/ui';
import { razaService } from '../services/razaService';
import { extractApiErrorMessage } from '../api/axiosClient';
import {
  RazaDto,
  RazaCrearDto,
  ESPECIES_REFUGIO,
  EspecieCatalogItem,
} from '../types/raza.types';

type VistaActiva = 'listado' | 'formulario';

interface ErroresFormularioRaza {
  nombre?: string;
  idEspecie?: string;
}

const FORM_INICIAL: RazaCrearDto = {
  idEspecie: 1, // Por defecto Canino
  nombre: '',
};

export const RazasPage: React.FC = () => {
  const [razas, setRazas] = useState<RazaDto[]>([]);
  const [especies, setEspecies] = useState<EspecieCatalogItem[]>(ESPECIES_REFUGIO);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorRed, setErrorRed] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Filtro por especie (0 = Todas, 1 = Canino, 2 = Felino, etc.)
  const [filtroEspecie, setFiltroEspecie] = useState<number>(0);
  const [filtroTexto, setFiltroTexto] = useState<string>('');

  const [vistaActiva, setVistaActiva] = useState<VistaActiva>('listado');
  const [formData, setFormData] = useState<RazaCrearDto>(FORM_INICIAL);
  const [erroresForm, setErroresForm] = useState<ErroresFormularioRaza>({});
  const [errorSubmit, setErrorSubmit] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const mostrarExitoTemporal = (mensaje: string) => {
    setMensajeExito(mensaje);
    window.setTimeout(() => {
      setMensajeExito((actual) => (actual === mensaje ? null : actual));
    }, 4000);
  };

  const cargarRazas = useCallback(async (idEspecie?: number) => {
    setIsLoading(true);
    setErrorRed(null);
    try {
      const [especiesData, razasData] = await Promise.all([
        razaService.getEspecies(),
        idEspecie && idEspecie > 0 ? razaService.getByEspecie(idEspecie) : razaService.getAll(),
      ]);
      setEspecies(especiesData);
      setRazas(razasData);
    } catch (err: unknown) {
      setErrorRed(extractApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarRazas(filtroEspecie);
  }, [filtroEspecie, cargarRazas]);

  const abrirFormularioCrear = () => {
    setFormData({
      idEspecie: filtroEspecie > 0 ? filtroEspecie : 1,
      nombre: '',
    });
    setErroresForm({});
    setErrorSubmit(null);
    setVistaActiva('formulario');
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorSubmit(null);

    const errores: ErroresFormularioRaza = {};
    if (!formData.nombre.trim()) {
      errores.nombre = 'El nombre de la raza es obligatorio.';
    } else if (formData.nombre.trim().length > 50) {
      errores.nombre = 'El nombre no puede tener más de 50 caracteres.';
    }

    if (!formData.idEspecie || formData.idEspecie <= 0) {
      errores.idEspecie = 'Debes seleccionar una especie válida.';
    }

    if (Object.keys(errores).length > 0) {
      setErroresForm(errores);
      return;
    }

    setIsSubmitting(true);
    try {
      await razaService.crear(formData);
      mostrarExitoTemporal(`Raza "${formData.nombre}" registrada correctamente.`);
      await cargarRazas(filtroEspecie);
      setVistaActiva('listado');
    } catch (err: unknown) {
      setErrorSubmit(extractApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrado local por nombre
  const razasFiltradas = razas.filter((r) =>
    r.nombre.toLowerCase().includes(filtroTexto.trim().toLowerCase())
  );

  const getNombreEspecie = (id: number) => {
    const esp = especies.find((e) => e.idEspecie === id);
    return esp ? esp.nombre : `Especie #${id}`;
  };

  // VISTA FORMULARIO
  if (vistaActiva === 'formulario') {
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
            Registrar Nueva Raza
          </h2>
        </div>

        {errorSubmit && (
          <ErrorAlert title="Error al guardar raza" message={errorSubmit} />
        )}

        <form
          onSubmit={handleGuardar}
          noValidate
          className="bg-white rounded-xl border border-[#E5DFD7] p-5 sm:p-6 space-y-5"
        >
          <div className="space-y-1.5">
            <label
              htmlFor="raza-especie"
              className="block text-xs sm:text-sm font-semibold text-stone-800"
            >
              Especie Animal *
            </label>
            <select
              id="raza-especie"
              value={formData.idEspecie}
              onChange={(e) =>
                setFormData({ ...formData, idEspecie: Number(e.target.value) })
              }
              className="w-full rounded-lg bg-white border border-[#E5DFD7] px-3.5 py-2.5 text-base sm:text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-[#B84A27]/20 focus:border-[#B84A27] min-h-[44px]"
            >
              {especies.map((esp) => (
                <option key={esp.idEspecie} value={esp.idEspecie}>
                  {esp.nombre}
                </option>
              ))}
            </select>
            {erroresForm.idEspecie && (
              <p className="text-xs text-red-600 font-medium">{erroresForm.idEspecie}</p>
            )}
          </div>

          <Input
            label="Nombre de la Raza *"
            placeholder="Ej. Mestizo, Labrador, Siamés, Criollo..."
            maxLength={50}
            value={formData.nombre}
            onChange={(e) => {
              setFormData({ ...formData, nombre: e.target.value });
              if (erroresForm.nombre) setErroresForm({ ...erroresForm, nombre: undefined });
            }}
            error={erroresForm.nombre}
            helperText="Máximo 50 caracteres"
          />

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
              Registrar Raza
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
            Catálogo de Razas
          </h2>
          <p className="text-sm text-stone-600 mt-0.5">
            Clasificación genealógica por especie para las fichas de animales (api/Raza).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => void cargarRazas(filtroEspecie)}
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
            Nueva Raza
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

      {/* Barra de Filtros por Especie y Búsqueda */}
      <section
        aria-label="Filtro de razas por especie"
        className="bg-white rounded-xl border border-[#E5DFD7] p-4 space-y-3"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-stone-600 flex items-center gap-1.5 mr-1">
            <Filter className="w-3.5 h-3.5" />
            Especie:
          </span>
          <button
            type="button"
            onClick={() => setFiltroEspecie(0)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              filtroEspecie === 0
                ? 'bg-stone-900 text-white shadow-2xs'
                : 'bg-[#F3EFEA] text-stone-700 hover:bg-[#EAE4DC]'
            }`}
          >
            Todas las especies
          </button>
          {especies.map((esp) => (
            <button
              key={esp.idEspecie}
              type="button"
              onClick={() => setFiltroEspecie(esp.idEspecie)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                filtroEspecie === esp.idEspecie
                  ? 'bg-[#B84A27] text-white shadow-2xs'
                  : 'bg-[#F3EFEA] text-stone-700 hover:bg-[#EAE4DC]'
              }`}
            >
              {esp.nombre}
            </button>
          ))}
        </div>

        <Input
          placeholder="Filtrar raza por nombre..."
          value={filtroTexto}
          onChange={(e) => setFiltroTexto(e.target.value)}
        />
      </section>

      {errorRed && (
        <ErrorAlert
          title="Error de conexión con RazaController"
          message={errorRed}
          onRetry={() => void cargarRazas(filtroEspecie)}
        />
      )}

      {isLoading ? (
        <div className="bg-white rounded-xl border border-[#E5DFD7] divide-y divide-[#E5DFD7]">
          {[1, 2, 3].map((n) => (
            <div key={n} className="p-4 sm:p-5 flex items-center justify-between gap-4">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
          ))}
        </div>
      ) : razasFiltradas.length === 0 ? (
        <EmptyState
          icon={Dog}
          title="No se encontraron razas"
          description={
            filtroTexto.trim()
              ? 'Prueba limpiar el filtro de texto o seleccionar otra especie.'
              : 'Registra las razas correspondientes para asignarlas al ingresar un nuevo animal.'
          }
          actionLabel="Registrar Raza"
          onAction={abrirFormularioCrear}
        />
      ) : (
        <div className="bg-white rounded-xl border border-[#E5DFD7] overflow-hidden divide-y divide-[#E5DFD7]">
          {razasFiltradas.map((raza) => (
            <div
              key={raza.idRaza}
              className="p-4 sm:px-5 sm:py-3.5 flex items-center justify-between gap-3 hover:bg-[#FAF8F5] transition-colors"
            >
              <div className="min-w-0">
                <span className="font-bold text-base text-stone-900 tracking-tight block">
                  {raza.nombre}
                </span>
                <span className="text-xs text-stone-500 tabular-data">
                  ID #{raza.idRaza}
                </span>
              </div>

              <Badge variant={raza.idEspecie === 1 ? 'warning' : 'info'}>
                {getNombreEspecie(raza.idEspecie)}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
