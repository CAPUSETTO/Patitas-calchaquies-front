import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dog,
  HeartHandshake,
  Stethoscope,
  Users,
  Syringe,
  Pill,
  Sparkles,
  ArrowRight,
  Plus,
} from 'lucide-react';
import {
  Button,
  Badge,
  Skeleton,
} from '../components/ui';
import { animalService } from '../services/animalService';
import { personaService } from '../services/personaService';
import { adopcionService } from '../services/adopcionService';
import { atencionService } from '../services/atencionService';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const [metricas, setMetricas] = useState({
    totalAnimales: 0,
    disponiblesAdopcion: 0,
    totalPersonas: 0,
    solicitudesPendientes: 0,
    totalAtenciones: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let montado = true;
    const cargarResumen = async () => {
      try {
        const [animales, personas, adopciones, atenciones] = await Promise.all([
          animalService.getAll().catch(() => []),
          personaService.getAll().catch(() => []),
          adopcionService.getAll().catch(() => []),
          atencionService.getAll().catch(() => []),
        ]);

        if (montado) {
          setMetricas({
            totalAnimales: animales.length,
            disponiblesAdopcion: animales.filter((a) => a.idEstado === 1).length,
            totalPersonas: personas.length,
            solicitudesPendientes: adopciones.filter((s) => s.estado === 'Pendiente').length,
            totalAtenciones: atenciones.length,
          });
        }
      } finally {
        if (montado) setIsLoading(false);
      }
    };

    void cargarResumen();
    return () => {
      montado = false;
    };
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Cabecera Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5DFD7]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
            Panel Operativo del Refugio
          </h2>
          <p className="text-sm text-stone-600 mt-1">
            Sistema de gestión integral para rescates, fichas clínicas y adopciones responsables.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/animales')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Ingresar Animal
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/admin/adopciones')}
            leftIcon={<HeartHandshake className="w-4 h-4" />}
          >
            Nueva Solicitud
          </Button>
        </div>
      </div>

      {/* Métricas Operativas Clave */}
      <section aria-label="Métricas del refugio" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Animales */}
        <div
          onClick={() => navigate('/admin/animales')}
          className="bg-white rounded-xl border border-[#E5DFD7] p-4 sm:p-5 flex items-center gap-4 hover:border-[#B84A27]/60 transition-colors cursor-pointer shadow-2xs"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-100/80 text-[#B84A27] flex items-center justify-center shrink-0">
            <Dog className="w-6 h-6 stroke-[2]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-stone-600">Animales en Refugio</p>
            {isLoading ? (
              <Skeleton className="h-7 w-16 mt-1" />
            ) : (
              <p className="text-2xl font-bold text-stone-900 tracking-tight mt-0.5 tabular-data">
                {metricas.totalAnimales}
              </p>
            )}
            <div className="mt-1">
              <Badge variant="success" dot>
                {metricas.disponiblesAdopcion} en adopción
              </Badge>
            </div>
          </div>
        </div>

        {/* Adopciones */}
        <div
          onClick={() => navigate('/admin/adopciones')}
          className="bg-white rounded-xl border border-[#E5DFD7] p-4 sm:p-5 flex items-center gap-4 hover:border-[#B84A27]/60 transition-colors cursor-pointer shadow-2xs"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <HeartHandshake className="w-6 h-6 stroke-[2]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-stone-600">Adopciones y Trámites</p>
            {isLoading ? (
              <Skeleton className="h-7 w-16 mt-1" />
            ) : (
              <p className="text-2xl font-bold text-stone-900 tracking-tight mt-0.5 tabular-data">
                {metricas.solicitudesPendientes}
              </p>
            )}
            <div className="mt-1">
              <Badge variant={metricas.solicitudesPendientes > 0 ? 'warning' : 'neutral'} dot>
                {metricas.solicitudesPendientes > 0 ? 'Pendientes de firma' : 'Al día'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Atenciones Clínicas */}
        <div
          onClick={() => navigate('/admin/atenciones')}
          className="bg-white rounded-xl border border-[#E5DFD7] p-4 sm:p-5 flex items-center gap-4 hover:border-[#B84A27]/60 transition-colors cursor-pointer shadow-2xs"
        >
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center shrink-0">
            <Stethoscope className="w-6 h-6 stroke-[2]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-stone-600">Historial Clínico</p>
            {isLoading ? (
              <Skeleton className="h-7 w-16 mt-1" />
            ) : (
              <p className="text-2xl font-bold text-stone-900 tracking-tight mt-0.5 tabular-data">
                {metricas.totalAtenciones}
              </p>
            )}
            <div className="mt-1">
              <Badge variant="info" dot>
                Consultas y vacunas
              </Badge>
            </div>
          </div>
        </div>

        {/* Padrón de Personas */}
        <div
          onClick={() => navigate('/admin/personas')}
          className="bg-white rounded-xl border border-[#E5DFD7] p-4 sm:p-5 flex items-center gap-4 hover:border-[#B84A27]/60 transition-colors cursor-pointer shadow-2xs"
        >
          <div className="w-12 h-12 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 stroke-[2]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-stone-600">Padrón de Personas</p>
            {isLoading ? (
              <Skeleton className="h-7 w-16 mt-1" />
            ) : (
              <p className="text-2xl font-bold text-stone-900 tracking-tight mt-0.5 tabular-data">
                {metricas.totalPersonas}
              </p>
            )}
            <div className="mt-1">
              <Badge variant="success" dot>
                Conectado con API C#
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Módulos Operativos del Refugio */}
      <section aria-label="Módulos del sistema" className="space-y-3">
        <h3 className="font-bold text-base text-stone-900 tracking-tight">
          Módulos de Gestión del Refugio
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Animales */}
          <div
            onClick={() => navigate('/admin/animales')}
            className="bg-white rounded-xl border border-[#E5DFD7] p-5 space-y-3 hover:border-[#B84A27]/60 transition-colors cursor-pointer flex flex-col justify-between shadow-2xs"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-[#F3EFEA] border border-[#E5DFD7] text-[#B84A27] flex items-center justify-center">
                <Dog className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-stone-900">
                Censo de Animales
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Fichas de rescate con fotografía, historial, raza por especie, sexo, estado de castración y adopción.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-semibold text-[#B84A27]">
              <span>Abrir censo</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Adopciones */}
          <div
            onClick={() => navigate('/admin/adopciones')}
            className="bg-white rounded-xl border border-[#E5DFD7] p-5 space-y-3 hover:border-[#B84A27]/60 transition-colors cursor-pointer flex flex-col justify-between shadow-2xs"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-[#F3EFEA] border border-[#E5DFD7] text-[#B84A27] flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-stone-900">
                Gestión de Adopciones
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Tablero de solicitudes vinculando adoptantes y animales, con aprobación y formalización de contratos.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-semibold text-[#B84A27]">
              <span>Ver solicitudes</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Atenciones */}
          <div
            onClick={() => navigate('/admin/atenciones')}
            className="bg-white rounded-xl border border-[#E5DFD7] p-5 space-y-3 hover:border-[#B84A27]/60 transition-colors cursor-pointer flex flex-col justify-between shadow-2xs"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-[#F3EFEA] border border-[#E5DFD7] text-[#B84A27] flex items-center justify-center">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-stone-900">
                Atenciones Clínicas
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Historial de visitas veterinarias, diagnósticos, aplicación de vacunas y prescripción de fármacos.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-semibold text-[#B84A27]">
              <span>Ver historial médico</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Personas */}
          <div
            onClick={() => navigate('/admin/personas')}
            className="bg-white rounded-xl border border-[#E5DFD7] p-5 space-y-3 hover:border-[#B84A27]/60 transition-colors cursor-pointer flex flex-col justify-between shadow-2xs"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-[#F3EFEA] border border-[#E5DFD7] text-[#B84A27] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-base text-stone-900">
                  Padrón de Personas
                </h4>
                <Badge variant="success">API Real</Badge>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                CRUD completo con backend C# (<code className="font-mono text-[11px]">api/Personas</code>), búsqueda por DNI exacto y por nombre.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-semibold text-[#B84A27]">
              <span>Abrir padrón</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Catálogo de Vacunas */}
          <div
            onClick={() => navigate('/admin/vacunas')}
            className="bg-white rounded-xl border border-[#E5DFD7] p-5 space-y-3 hover:border-[#B84A27]/60 transition-colors cursor-pointer flex flex-col justify-between shadow-2xs"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-[#F3EFEA] border border-[#E5DFD7] text-[#B84A27] flex items-center justify-center">
                <Syringe className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-base text-stone-900">
                  Catálogo de Vacunas
                </h4>
                <Badge variant="success">API Real</Badge>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                CRUD completo con backend C# (<code className="font-mono text-[11px]">api/Vacuna</code>), plan de inmunización y dosis.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-semibold text-[#B84A27]">
              <span>Gestionar vacunas</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Catálogo de Medicamentos */}
          <div
            onClick={() => navigate('/admin/medicamentos')}
            className="bg-white rounded-xl border border-[#E5DFD7] p-5 space-y-3 hover:border-[#B84A27]/60 transition-colors cursor-pointer flex flex-col justify-between shadow-2xs"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-[#F3EFEA] border border-[#E5DFD7] text-[#B84A27] flex items-center justify-center">
                <Pill className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-base text-stone-900">
                  Catálogo de Medicamentos
                </h4>
                <Badge variant="success">API Real</Badge>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                CRUD completo con backend C# (<code className="font-mono text-[11px]">api/Medicamento</code>), vías de administración y posología.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-semibold text-[#B84A27]">
              <span>Gestionar medicamentos</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Catálogo de Razas */}
          <div
            onClick={() => navigate('/admin/razas')}
            className="bg-white rounded-xl border border-[#E5DFD7] p-5 space-y-3 hover:border-[#B84A27]/60 transition-colors cursor-pointer flex flex-col justify-between shadow-2xs"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-lg bg-[#F3EFEA] border border-[#E5DFD7] text-[#B84A27] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-base text-stone-900">
                  Catálogo de Razas
                </h4>
                <Badge variant="success">API Real</Badge>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Listado y alta con backend C# (<code className="font-mono text-[11px]">api/Raza</code>), filtrado dinámico por especie.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-semibold text-[#B84A27]">
              <span>Gestionar razas</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
