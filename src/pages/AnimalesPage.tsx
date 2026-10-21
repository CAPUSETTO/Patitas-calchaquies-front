import React, { useState, useEffect, useCallback } from 'react';
import {
  Dog,
  Cat,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  X,
  Filter,
  Check,
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
import { animalService } from '../services/animalService';
import { razaService } from '../services/razaService';
import {
  AnimalDto,
  AnimalCrearDto,
  ESTADOS_ANIMAL,
  SEXOS_ANIMAL,
} from '../types/animal.types';
import { RazaDto, ESPECIES_REFUGIO } from '../types/raza.types';
import { extractApiErrorMessage } from '../api/axiosClient';

type VistaActiva = 'listado' | 'formulario' | 'detalle';

const FORM_INICIAL: AnimalCrearDto = {
  nombre: '',
  codigoIdentificacion: '',
  fechaIngreso: new Date().toISOString().split('T')[0],
  castrado: false,
  idEspecie: 1, // Canino por defecto
  idRaza: null,
  idSexo: 1, // Macho por defecto
  idEstado: 1, // Disponible
  fotoUrl: '',
  observaciones: '',
};

export const AnimalesPage: React.FC = () => {
  const [animales, setAnimales] = useState<AnimalDto[]>([]);
  const [razas, setRazas] = useState<RazaDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorRed, setErrorRed] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Filtros
  const [filtroTexto, setFiltroTexto] = useState<string>('');
  const [filtroEspecie, setFiltroEspecie] = useState<number>(0); // 0 = Todas
  const [filtroEstado, setFiltroEstado] = useState<number>(0); // 0 = Todos

  // Navegación interna
  const [vistaActiva, setVistaActiva] = useState<VistaActiva>('listado');
  const [animalSeleccionado, setAnimalSeleccionado] = useState<AnimalDto | null>(null);

  // Formulario
  const [formData, setFormData] = useState<AnimalCrearDto>(FORM_INICIAL);
  const [erroresForm, setErroresForm] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Eliminación
  const [animalAEliminar, setAnimalAEliminar] = useState<AnimalDto | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

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
      const [dataAnimales, dataRazas] = await Promise.all([
        animalService.getAll(),
        razaService.getAll().catch(() => []),
      ]);
      setAnimales(dataAnimales);
      setRazas(dataRazas);
    } catch (err: unknown) {
      setErrorRed(extractApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarDatos();
  }, [cargarDatos]);

  const abrirFormularioCrear = () => {
    setAnimalSeleccionado(null);
    const anio = new Date().getFullYear();
    const cant = animales.length + 1;
    const prefijo = formData.idEspecie === 2 ? 'FEL' : 'CAN';
    setFormData({
      ...FORM_INICIAL,
      codigoIdentificacion: `${prefijo}-${anio}-${String(cant).padStart(3, '0')}`,
    });
    setErroresForm({});
    setVistaActiva('formulario');
  };

  const abrirFormularioEditar = (animal: AnimalDto) => {
    setAnimalSeleccionado(animal);
    setFormData({
      nombre: animal.nombre,
      codigoIdentificacion: animal.codigoIdentificacion,
      fechaIngreso: animal.fechaIngreso,
      castrado: animal.castrado,
      idEspecie: animal.idEspecie,
      idRaza: animal.idRaza ?? null,
      idSexo: animal.idSexo ?? 1,
      idEstado: animal.idEstado ?? 1,
      fotoUrl: animal.fotoUrl || '',
      observaciones: animal.observaciones || '',
    });
    setErroresForm({});
    setVistaActiva('formulario');
  };

  const abrirDetalle = (animal: AnimalDto) => {
    setAnimalSeleccionado(animal);
    setVistaActiva('detalle');
  };

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    const errores: Record<string, string> = {};

    if (!formData.nombre.trim()) {
      errores.nombre = 'El nombre es obligatorio.';
    }
    if (!formData.codigoIdentificacion.trim()) {
      errores.codigoIdentificacion = 'El código identificatorio es obligatorio.';
    }

    if (Object.keys(errores).length > 0) {
      setErroresForm(errores);
      return;
    }

    setIsSubmitting(true);
    try {
      if (animalSeleccionado) {
        await animalService.actualizar(animalSeleccionado.idAnimal, {
          ...formData,
          idAnimal: animalSeleccionado.idAnimal,
        });
        mostrarExitoTemporal(`Ficha de "${formData.nombre}" actualizada correctamente.`);
      } else {
        await animalService.crear(formData);
        mostrarExitoTemporal(`Animal "${formData.nombre}" ingresado al refugio.`);
      }
      await cargarDatos();
      setVistaActiva('listado');
    } catch (err: unknown) {
      setErrorRed(extractApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEliminar = async () => {
    if (!animalAEliminar) return;
    setIsDeleting(true);
    try {
      await animalService.eliminar(animalAEliminar.idAnimal);
      const nombreBorrado = animalAEliminar.nombre;
      setAnimalAEliminar(null);
      if (vistaActiva === 'detalle') setVistaActiva('listado');
      mostrarExitoTemporal(`"${nombreBorrado}" fue retirado del censo.`);
      await cargarDatos();
    } catch (err: unknown) {
      setErrorRed(extractApiErrorMessage(err));
      setAnimalAEliminar(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtrado
  const animalesFiltrados = animales.filter((a) => {
    const coincideTexto =
      a.nombre.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      a.codigoIdentificacion.toLowerCase().includes(filtroTexto.toLowerCase());
    const coincideEspecie = filtroEspecie === 0 || a.idEspecie === filtroEspecie;
    const coincideEstado = filtroEstado === 0 || a.idEstado === filtroEstado;
    return coincideTexto && coincideEspecie && coincideEstado;
  });

  const getEstadoBadge = (idEstado?: number | null) => {
    const est = ESTADOS_ANIMAL.find((e) => e.idEstado === idEstado);
    if (!est) return <Badge variant="neutral">Sin estado</Badge>;
    return (
      <Badge variant={est.variant} dot>
        {est.nombre}
      </Badge>
    );
  };

  // ============================================================================
  // VISTA FORMULARIO
  // ============================================================================
  if (vistaActiva === 'formulario') {
    const esEdicion = Boolean(animalSeleccionado);
    const razasDisponibles = razas.filter((r) => r.idEspecie === formData.idEspecie);

    return (
      <div className="max-w-2xl mx-auto space-y-6">
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
            {esEdicion ? 'Editar Ficha del Animal' : 'Ingreso de Animal al Refugio'}
          </h2>
        </div>

        <form
          onSubmit={handleGuardar}
          noValidate
          className="bg-white rounded-xl border border-[#E5DFD7] p-5 sm:p-6 space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nombre del Animal *"
              placeholder="Ej. Manchitas, Canela..."
              value={formData.nombre}
              onChange={(e) => {
                setFormData({ ...formData, nombre: e.target.value });
                if (erroresForm.nombre) setErroresForm({ ...erroresForm, nombre: '' });
              }}
              error={erroresForm.nombre}
            />

            <Input
              label="Código de Identificación *"
              placeholder="Ej. CAN-2026-005"
              value={formData.codigoIdentificacion}
              onChange={(e) => {
                setFormData({ ...formData, codigoIdentificacion: e.target.value });
                if (erroresForm.codigoIdentificacion)
                  setErroresForm({ ...erroresForm, codigoIdentificacion: '' });
              }}
              error={erroresForm.codigoIdentificacion}
              className="tabular-data font-mono uppercase"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Especie */}
            <div className="space-y-1.5">
              <label htmlFor="animal-especie" className="block text-xs sm:text-sm font-semibold text-stone-800">
                Especie *
              </label>
              <select
                id="animal-especie"
                value={formData.idEspecie}
                onChange={(e) => {
                  const nuevaEsp = Number(e.target.value);
                  const anio = new Date().getFullYear();
                  const cant = animales.length + 1;
                  const prefijo = nuevaEsp === 2 ? 'FEL' : 'CAN';
                  setFormData({
                    ...formData,
                    idEspecie: nuevaEsp,
                    idRaza: null,
                    codigoIdentificacion: `${prefijo}-${anio}-${String(cant).padStart(3, '0')}`,
                  });
                }}
                className="w-full rounded-lg bg-white border border-[#E5DFD7] px-3 py-2.5 text-sm text-stone-900 min-h-[44px]"
              >
                {ESPECIES_REFUGIO.map((esp) => (
                  <option key={esp.idEspecie} value={esp.idEspecie}>
                    {esp.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Sexo */}
            <div className="space-y-1.5">
              <label htmlFor="animal-sexo" className="block text-xs sm:text-sm font-semibold text-stone-800">
                Sexo *
              </label>
              <select
                id="animal-sexo"
                value={formData.idSexo || 1}
                onChange={(e) => setFormData({ ...formData, idSexo: Number(e.target.value) })}
                className="w-full rounded-lg bg-white border border-[#E5DFD7] px-3 py-2.5 text-sm text-stone-900 min-h-[44px]"
              >
                {SEXOS_ANIMAL.map((s) => (
                  <option key={s.idSexo} value={s.idSexo}>
                    {s.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Raza */}
            <div className="space-y-1.5">
              <label htmlFor="animal-raza" className="block text-xs sm:text-sm font-semibold text-stone-800">
                Raza
              </label>
              <select
                id="animal-raza"
                value={formData.idRaza ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    idRaza: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="w-full rounded-lg bg-white border border-[#E5DFD7] px-3 py-2.5 text-sm text-stone-900 min-h-[44px]"
              >
                <option value="">(Sin raza / Mestizo)</option>
                {razasDisponibles.map((r) => (
                  <option key={r.idRaza} value={r.idRaza}>
                    {r.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Estado */}
            <div className="space-y-1.5">
              <label htmlFor="animal-estado" className="block text-xs sm:text-sm font-semibold text-stone-800">
                Estado Actual *
              </label>
              <select
                id="animal-estado"
                value={formData.idEstado || 1}
                onChange={(e) => setFormData({ ...formData, idEstado: Number(e.target.value) })}
                className="w-full rounded-lg bg-white border border-[#E5DFD7] px-3 py-2.5 text-sm text-stone-900 min-h-[44px]"
              >
                {ESTADOS_ANIMAL.map((est) => (
                  <option key={est.idEstado} value={est.idEstado}>
                    {est.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha Ingreso */}
            <Input
              label="Fecha de Ingreso *"
              type="date"
              value={formData.fechaIngreso}
              onChange={(e) => setFormData({ ...formData, fechaIngreso: e.target.value })}
              className="tabular-data"
            />
          </div>

          {/* Castrado */}
          <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E5DFD7]">
            <label className="flex items-center justify-between cursor-pointer select-none">
              <span className="text-sm font-semibold text-stone-900">
                ¿Se encuentra castrado / esterilizado?
              </span>
              <input
                type="checkbox"
                checked={formData.castrado}
                onChange={(e) => setFormData({ ...formData, castrado: e.target.checked })}
                className="w-5 h-5 accent-[#B84A27] rounded cursor-pointer"
              />
            </label>
          </div>

          <Input
            label="URL de Foto (Opcional)"
            placeholder="https://..."
            value={formData.fotoUrl || ''}
            onChange={(e) => setFormData({ ...formData, fotoUrl: e.target.value })}
            helperText="Pega el enlace de una foto para la ficha"
          />

          <div className="space-y-1.5">
            <label htmlFor="animal-observaciones" className="block text-xs sm:text-sm font-semibold text-stone-800">
              Observaciones de Ingreso y Comportamiento
            </label>
            <textarea
              id="animal-observaciones"
              rows={3}
              placeholder="Detalles sobre su rescate, temperamento con otros animales, requerimientos especiales..."
              value={formData.observaciones || ''}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              className="w-full rounded-lg bg-white border border-[#E5DFD7] px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-500 focus:outline-hidden focus:ring-2 focus:ring-[#B84A27]/20 focus:border-[#B84A27]"
            />
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
              {esEdicion ? 'Guardar Cambios' : 'Ingresar Animal'}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // ============================================================================
  // VISTA DETALLE
  // ============================================================================
  if (vistaActiva === 'detalle' && animalSeleccionado) {
    const esCanino = animalSeleccionado.idEspecie === 1;

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5DFD7] pb-4">
          <div className="flex items-center gap-3">
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
              {animalSeleccionado.nombre}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => abrirFormularioEditar(animalSeleccionado)}
              leftIcon={<Edit3 className="w-4 h-4" />}
            >
              Editar Ficha
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => setAnimalAEliminar(animalSeleccionado)}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Retirar
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E5DFD7] overflow-hidden">
          {animalSeleccionado.fotoUrl && (
            <div className="h-64 sm:h-72 w-full bg-stone-100 overflow-hidden relative">
              <img
                src={animalSeleccionado.fotoUrl}
                alt={animalSeleccionado.nombre}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3">
                {getEstadoBadge(animalSeleccionado.idEstado)}
              </div>
            </div>
          )}

          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between gap-2 border-b border-[#E5DFD7] pb-3">
              <div className="flex items-center gap-2">
                {esCanino ? (
                  <Dog className="w-5 h-5 text-[#B84A27]" />
                ) : (
                  <Cat className="w-5 h-5 text-[#B84A27]" />
                )}
                <span className="font-bold text-lg text-stone-900">
                  {animalSeleccionado.nombre}
                </span>
              </div>
              <span className="font-mono text-xs bg-[#F3EFEA] px-2 py-1 rounded text-stone-700">
                {animalSeleccionado.codigoIdentificacion}
              </span>
            </div>

            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs font-semibold text-stone-500">Especie</dt>
                <dd className="font-medium text-stone-900 mt-0.5">
                  {esCanino ? 'Canino (Perro)' : 'Felino (Gato)'}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold text-stone-500">Sexo</dt>
                <dd className="font-medium text-stone-900 mt-0.5">
                  {animalSeleccionado.idSexo === 1 ? 'Macho' : 'Hembra'}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold text-stone-500">Raza</dt>
                <dd className="font-medium text-stone-900 mt-0.5">
                  {animalSeleccionado.razaNombre || 'Mestizo'}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold text-stone-500">Castrado</dt>
                <dd className="font-medium text-stone-900 mt-0.5 flex items-center gap-1">
                  {animalSeleccionado.castrado ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Sí, esterilizado</span>
                    </>
                  ) : (
                    <span className="text-amber-700">Pendiente de castración</span>
                  )}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold text-stone-500">Fecha de Ingreso</dt>
                <dd className="font-medium text-stone-900 mt-0.5 tabular-data">
                  {animalSeleccionado.fechaIngreso}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold text-stone-500">Estado de Adopción</dt>
                <dd className="mt-0.5">{getEstadoBadge(animalSeleccionado.idEstado)}</dd>
              </div>
            </dl>

            {animalSeleccionado.observaciones && (
              <div className="pt-3 border-t border-[#E5DFD7]">
                <h4 className="text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1">
                  Observaciones y Notas
                </h4>
                <p className="text-sm text-stone-800 leading-relaxed bg-[#FAF8F5] p-3 rounded-lg border border-[#E5DFD7]">
                  {animalSeleccionado.observaciones}
                </p>
              </div>
            )}
          </div>
        </div>

        <ConfirmModal
          isOpen={Boolean(animalAEliminar)}
          title="¿Retirar del censo a este animal?"
          description={
            animalAEliminar
              ? `Se dará de baja el registro de "${animalAEliminar.nombre}" (${animalAEliminar.codigoIdentificacion}).`
              : ''
          }
          confirmLabel="Sí, retirar"
          cancelLabel="Cancelar"
          variant="danger"
          isLoading={isDeleting}
          onConfirm={handleEliminar}
          onClose={() => setAnimalAEliminar(null)}
        />
      </div>
    );
  }

  // ============================================================================
  // VISTA LISTADO PRINCIPAL
  // ============================================================================
  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DFD7] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
            Censo de Animales
          </h2>
          <p className="text-sm text-stone-600 mt-0.5">
            Registro, fichas de rescate, salud y estado de adopción del refugio.
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
            onClick={abrirFormularioCrear}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Ingresar Animal
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

      {/* Barra de Filtros */}
      <section
        aria-label="Filtros del censo de animales"
        className="bg-white rounded-xl border border-[#E5DFD7] p-4 space-y-3.5"
      >
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 min-w-0">
            <Input
              placeholder="Buscar por nombre o código (ej. CAN-2026-001)..."
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Filtro Especie */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setFiltroEspecie(0)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filtroEspecie === 0
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'bg-[#F3EFEA] text-stone-700 hover:bg-[#EAE4DC]'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setFiltroEspecie(1)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                filtroEspecie === 1
                  ? 'bg-[#B84A27] text-white shadow-2xs'
                  : 'bg-[#F3EFEA] text-stone-700 hover:bg-[#EAE4DC]'
              }`}
            >
              <Dog className="w-3.5 h-3.5" />
              Perros
            </button>
            <button
              type="button"
              onClick={() => setFiltroEspecie(2)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                filtroEspecie === 2
                  ? 'bg-[#B84A27] text-white shadow-2xs'
                  : 'bg-[#F3EFEA] text-stone-700 hover:bg-[#EAE4DC]'
              }`}
            >
              <Cat className="w-3.5 h-3.5" />
              Gatos
            </button>
          </div>
        </div>

        {/* Filtros de Estado */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E5DFD7]/70 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-stone-600 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" />
              Estado:
            </span>
            <button
              type="button"
              onClick={() => setFiltroEstado(0)}
              className={`px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                filtroEstado === 0
                  ? 'bg-stone-800 text-white'
                  : 'bg-[#F3EFEA] text-stone-700 hover:bg-[#EAE4DC]'
              }`}
            >
              Todos
            </button>
            {ESTADOS_ANIMAL.map((est) => (
              <button
                key={est.idEstado}
                type="button"
                onClick={() => setFiltroEstado(est.idEstado)}
                className={`px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                  filtroEstado === est.idEstado
                    ? 'bg-stone-800 text-white'
                    : 'bg-[#F3EFEA] text-stone-700 hover:bg-[#EAE4DC]'
                }`}
              >
                {est.nombre}
              </button>
            ))}
          </div>

          <span className="text-stone-600 font-medium tabular-data">
            {animalesFiltrados.length} de {animales.length} animales
          </span>
        </div>
      </section>

      {errorRed && (
        <ErrorAlert
          title="Error en la consulta de animales"
          message={errorRed}
          onRetry={() => void cargarDatos()}
        />
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white rounded-xl border border-[#E5DFD7] p-4 space-y-3">
              <Skeleton className="h-44 w-full rounded-lg" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : animalesFiltrados.length === 0 ? (
        <EmptyState
          icon={Dog}
          title="No se encontraron animales"
          description={
            filtroTexto.trim() || filtroEspecie !== 0 || filtroEstado !== 0
              ? 'Prueba cambiar los filtros seleccionados o limpiar la búsqueda.'
              : 'Aún no hay animales registrados en el censo del refugio.'
          }
          actionLabel="Ingresar Primer Animal"
          onAction={abrirFormularioCrear}
        />
      ) : (
        /* Cuadrícula de Fichas de Animales */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {animalesFiltrados.map((animal) => {
            const esCanino = animal.idEspecie === 1;
            return (
              <div
                key={animal.idAnimal}
                className="bg-white rounded-xl border border-[#E5DFD7] overflow-hidden flex flex-col hover:border-[#B84A27]/50 transition-colors shadow-2xs"
              >
                {/* Foto */}
                <div className="h-48 bg-stone-100 relative overflow-hidden">
                  {animal.fotoUrl ? (
                    <img
                      src={animal.fotoUrl}
                      alt={animal.nombre}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400">
                      {esCanino ? <Dog className="w-12 h-12" /> : <Cat className="w-12 h-12" />}
                    </div>
                  )}
                  <div className="absolute top-2.5 right-2.5">
                    {getEstadoBadge(animal.idEstado)}
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 bg-stone-900/70 text-white font-mono text-[11px] px-2 py-0.5 rounded backdrop-blur-xs">
                    {animal.codigoIdentificacion}
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-base text-stone-900 tracking-tight">
                        {animal.nombre}
                      </h3>
                      <span className="text-xs text-stone-500 font-medium">
                        {animal.idSexo === 1 ? 'Macho' : 'Hembra'}
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 mt-1">
                      {animal.razaNombre || (esCanino ? 'Perro mestizo' : 'Gato mestizo')}
                      {animal.castrado ? ' • Castrado' : ''}
                    </p>

                    {animal.observaciones && (
                      <p className="text-xs text-stone-700 line-clamp-2 mt-2 leading-relaxed">
                        {animal.observaciones}
                      </p>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="pt-2 border-t border-[#E5DFD7] flex items-center justify-between gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => abrirDetalle(animal)}
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                      className="flex-1"
                    >
                      Ver Ficha
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => abrirFormularioEditar(animal)}
                      aria-label={`Editar ficha de ${animal.nombre}`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setAnimalAEliminar(animal)}
                      className="border-red-200 text-red-700 hover:bg-red-50"
                      aria-label={`Retirar a ${animal.nombre}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(animalAEliminar)}
        title="¿Retirar del censo a este animal?"
        description={
          animalAEliminar
            ? `Se eliminará la ficha de "${animalAEliminar.nombre}" (${animalAEliminar.codigoIdentificacion}).`
            : ''
        }
        confirmLabel="Sí, retirar"
        cancelLabel="Cancelar"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleEliminar}
        onClose={() => setAnimalAEliminar(null)}
      />
    </div>
  );
};
