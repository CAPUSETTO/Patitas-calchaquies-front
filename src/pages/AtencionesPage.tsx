import React, { useState, useEffect, useCallback } from 'react';
import {
  Stethoscope,
  Plus,
  RefreshCw,
  CheckCircle2,
  X,
  Syringe,
  Pill,
  Calendar,
  Dog,
} from 'lucide-react';
import {
  Button,
  Input,
  Skeleton,
  ErrorAlert,
  EmptyState,
} from '../components/ui';
import { atencionService } from '../services/atencionService';
import { animalService } from '../services/animalService';
import { vacunaService } from '../services/vacunaService';
import { medicamentoService } from '../services/medicamentoService';
import {
  AtencionVeterinariaDto,
  AtencionVeterinariaCrearDto,
} from '../types/atencion.types';
import { AnimalDto, VeterinarioDto } from '../types/animal.types';
import { VacunaDto } from '../types/vacuna.types';
import { MedicamentoDto } from '../types/medicamento.types';
import { extractApiErrorMessage } from '../api/axiosClient';

export const AtencionesPage: React.FC = () => {
  const [atenciones, setAtenciones] = useState<AtencionVeterinariaDto[]>([]);
  const [animales, setAnimales] = useState<AnimalDto[]>([]);
  const [veterinarios, setVeterinarios] = useState<VeterinarioDto[]>([]);
  const [vacunas, setVacunas] = useState<VacunaDto[]>([]);
  const [medicamentos, setMedicamentos] = useState<MedicamentoDto[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorRed, setErrorRed] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Modal / Formulario Nueva Atención
  const [mostrarModalCrear, setMostrarModalCrear] = useState<boolean>(false);
  const [nuevaAtencion, setNuevaAtencion] = useState<AtencionVeterinariaCrearDto>({
    idAnimal: 0,
    idVeterinario: 0,
    motivo: '',
    diagnostico: '',
    veterinarioNombre: '',
    idVacunaAplicada: null,
    idMedicamentoRecetado: null,
    indicaciones: '',
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
      const [dataAtenciones, dataAnimales, dataVeterinarios, dataVacunas, dataMedicamentos] =
        await Promise.all([
          atencionService.getAll(),
          animalService.getAll().catch(() => []),
          animalService.fetchVeterinarios().catch(() => animalService.getVeterinarios()),
          vacunaService.getAll().catch(() => []),
          medicamentoService.getAll().catch(() => []),
        ]);
      setAtenciones(dataAtenciones);
      setAnimales(dataAnimales);
      setVeterinarios(dataVeterinarios);
      setVacunas(dataVacunas);
      setMedicamentos(dataMedicamentos);
    } catch (err: unknown) {
      setErrorRed(extractApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarDatos();
  }, [cargarDatos]);

  const handleCrearAtencion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaAtencion.idAnimal || !nuevaAtencion.motivo.trim()) {
      alert('Debes seleccionar un animal e indicar el motivo de la consulta.');
      return;
    }

    setIsSubmitting(true);
    try {
      const animalObj = animales.find((a) => a.idAnimal === Number(nuevaAtencion.idAnimal));
      const vacunaObj = vacunas.find((v) => v.idVacuna === Number(nuevaAtencion.idVacunaAplicada));
      const medObj = medicamentos.find(
        (m) => m.idMedicamento === Number(nuevaAtencion.idMedicamentoRecetado)
      );

      await atencionService.crear(nuevaAtencion, {
        animalNombre: animalObj?.nombre,
        vacunaNombre: vacunaObj?.nombre,
        medicamentoNombre: medObj?.nombre,
      });

      mostrarExitoTemporal('Atención veterinaria registrada correctamente.');
      setMostrarModalCrear(false);
      setNuevaAtencion({
        idAnimal: 0,
        motivo: '',
        diagnostico: '',
        veterinarioNombre: '',
        idVacunaAplicada: null,
        idMedicamentoRecetado: null,
        indicaciones: '',
      });
      await cargarDatos();
    } catch (err: unknown) {
      setErrorRed(extractApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5DFD7] pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
            Historial Veterinario y Atenciones
          </h2>
          <p className="text-sm text-stone-600 mt-0.5">
            Registro clínico de consultas, diagnósticos, vacunas aplicadas y recetas.
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
            Nueva Atención
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

      {errorRed && (
        <ErrorAlert
          title="Error en el módulo de atenciones"
          message={errorRed}
          onRetry={() => void cargarDatos()}
        />
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-xl border border-[#E5DFD7] p-5 space-y-2">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-4 w-80" />
            </div>
          ))}
        </div>
      ) : atenciones.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          title="No hay atenciones clínicas registradas"
          description="Registra la primera consulta, vacunación o tratamiento para iniciar el historial médico del refugio."
          actionLabel="Registrar Atención Médica"
          onAction={() => setMostrarModalCrear(true)}
        />
      ) : (
        <div className="space-y-3.5">
          {atenciones.map((atencion) => (
            <div
              key={atencion.idAtencionVeterinaria}
              className="bg-white rounded-xl border border-[#E5DFD7] p-4 sm:p-5 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5DFD7] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-red-50 text-red-700 flex items-center justify-center shrink-0">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-stone-900">
                      {atencion.motivo}
                    </h3>
                    <p className="text-xs text-stone-500 flex items-center gap-1.5 tabular-data">
                      <Calendar className="w-3.5 h-3.5" />
                      {atencion.fecha}
                      {atencion.veterinarioNombre && (
                        <span>• Profesional: {atencion.veterinarioNombre}</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 bg-[#FAF8F5] px-3 py-1.5 rounded-lg border border-[#E5DFD7] text-xs font-semibold text-stone-800">
                  <Dog className="w-4 h-4 text-[#B84A27]" />
                  <span>Paciente: {atencion.animalNombre || `Animal #${atencion.idAnimal}`}</span>
                </div>
              </div>

              {atencion.diagnostico && (
                <div className="text-xs sm:text-sm text-stone-800 bg-[#FAF8F5] p-3 rounded-lg border border-[#E5DFD7]">
                  <span className="font-semibold text-stone-900">Diagnóstico: </span>
                  {atencion.diagnostico}
                </div>
              )}

              <div className="flex flex-wrap gap-2 text-xs">
                {atencion.vacunaNombre && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-900 font-medium">
                    <Syringe className="w-3.5 h-3.5 text-blue-700" />
                    Vacuna aplicada: {atencion.vacunaNombre}
                  </span>
                )}
                {atencion.medicamentoNombre && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200 text-amber-900 font-medium">
                    <Pill className="w-3.5 h-3.5 text-amber-700" />
                    Fármaco recetado: {atencion.medicamentoNombre}
                  </span>
                )}
              </div>

              {atencion.indicaciones && (
                <p className="text-xs text-stone-600 italic">
                  Indicaciones: {atencion.indicaciones}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal Nueva Atención */}
      {mostrarModalCrear && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs"
            onClick={() => setMostrarModalCrear(false)}
            aria-hidden="true"
          />

          <div className="relative w-full max-w-lg bg-white rounded-2xl border border-[#E5DFD7] p-5 sm:p-6 shadow-xl z-10 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E5DFD7] pb-3">
              <h3 className="font-bold text-lg text-stone-900">
                Registrar Atención Veterinaria
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

            <form onSubmit={handleCrearAtencion} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="atencion-animal" className="block text-xs sm:text-sm font-semibold text-stone-800">
                  Paciente (Animal) *
                </label>
                <select
                  id="atencion-animal"
                  value={nuevaAtencion.idAnimal}
                  onChange={(e) =>
                    setNuevaAtencion({ ...nuevaAtencion, idAnimal: Number(e.target.value) })
                  }
                  required
                  className="w-full rounded-lg bg-white border border-[#E5DFD7] px-3 py-2.5 text-sm text-stone-900 min-h-[44px]"
                >
                  <option value={0}>Selecciona un animal...</option>
                  {animales.map((a) => (
                    <option key={a.idAnimal} value={a.idAnimal}>
                      {a.nombre} ({a.codigoIdentificacion})
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Motivo de la Consulta *"
                placeholder="Ej. Chequeo de rutina, vacunación, renguera..."
                value={nuevaAtencion.motivo}
                onChange={(e) => setNuevaAtencion({ ...nuevaAtencion, motivo: e.target.value })}
                required
              />

              <div className="space-y-1.5">
                <label
                  htmlFor="atencion-veterinario"
                  className="block text-xs sm:text-sm font-semibold text-stone-800"
                >
                  Veterinario Interviniente
                </label>
                <select
                  id="atencion-veterinario"
                  value={nuevaAtencion.idVeterinario || ''}
                  onChange={(e) => {
                    const idVet = e.target.value ? Number(e.target.value) : 0;
                    const vetObj = veterinarios.find((v) => v.idVeterinario === idVet);
                    setNuevaAtencion({
                      ...nuevaAtencion,
                      idVeterinario: idVet,
                      veterinarioNombre: vetObj
                        ? `${vetObj.nombre} ${vetObj.apellido} (${vetObj.matricula})`
                        : '',
                    });
                  }}
                  className="w-full rounded-lg bg-white border border-[#E5DFD7] px-3 py-2.5 text-sm text-stone-900 min-h-[44px]"
                >
                  <option value="">Guardia Veterinaria por defecto</option>
                  {veterinarios.map((v) => (
                    <option key={v.idVeterinario} value={v.idVeterinario}>
                      {v.nombre} {v.apellido} · Mat. {v.matricula}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="atencion-diagnostico" className="block text-xs sm:text-sm font-semibold text-stone-800">
                  Diagnóstico y Hallazgos Clínicos
                </label>
                <textarea
                  id="atencion-diagnostico"
                  rows={2}
                  placeholder="Detalles del examen físico..."
                  value={nuevaAtencion.diagnostico || ''}
                  onChange={(e) =>
                    setNuevaAtencion({ ...nuevaAtencion, diagnostico: e.target.value })
                  }
                  className="w-full rounded-lg bg-white border border-[#E5DFD7] px-3.5 py-2.5 text-sm text-stone-900"
                />
              </div>

              {/* Selección de Vacuna */}
              <div className="space-y-1.5">
                <label htmlFor="atencion-vacuna" className="block text-xs sm:text-sm font-semibold text-stone-800">
                  Vacuna Aplicada
                </label>
                <select
                  id="atencion-vacuna"
                  value={nuevaAtencion.idVacunaAplicada || ''}
                  onChange={(e) =>
                    setNuevaAtencion({
                      ...nuevaAtencion,
                      idVacunaAplicada: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  className="w-full rounded-lg bg-white border border-[#E5DFD7] px-3 py-2.5 text-sm text-stone-900 min-h-[44px]"
                >
                  <option value="">(Ninguna vacuna en esta consulta)</option>
                  {vacunas.map((v) => (
                    <option key={v.idVacuna} value={v.idVacuna}>
                      {v.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selección de Medicamento */}
              <div className="space-y-1.5">
                <label htmlFor="atencion-medicamento" className="block text-xs sm:text-sm font-semibold text-stone-800">
                  Medicamento Prescripto
                </label>
                <select
                  id="atencion-medicamento"
                  value={nuevaAtencion.idMedicamentoRecetado || ''}
                  onChange={(e) =>
                    setNuevaAtencion({
                      ...nuevaAtencion,
                      idMedicamentoRecetado: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  className="w-full rounded-lg bg-white border border-[#E5DFD7] px-3 py-2.5 text-sm text-stone-900 min-h-[44px]"
                >
                  <option value="">(Ningún medicamento)</option>
                  {medicamentos.map((m) => (
                    <option key={m.idMedicamento} value={m.idMedicamento}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="atencion-indicaciones" className="block text-xs sm:text-sm font-semibold text-stone-800">
                  Indicaciones y Posología
                </label>
                <textarea
                  id="atencion-indicaciones"
                  rows={2}
                  placeholder="Dosis, frecuencia, cuidados en el refugio..."
                  value={nuevaAtencion.indicaciones || ''}
                  onChange={(e) =>
                    setNuevaAtencion({ ...nuevaAtencion, indicaciones: e.target.value })
                  }
                  className="w-full rounded-lg bg-white border border-[#E5DFD7] px-3.5 py-2.5 text-sm text-stone-900"
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
                  Guardar Atención
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
