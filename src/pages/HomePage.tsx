import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  Building2,
  MapPin,
  ExternalLink,
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
import { authService } from '../services/authService';
import type { AnimalDto } from '../types/animal.types';
import type { SolicitudAdopcionDto } from '../types/adopcion.types';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const session = authService.getCurrentSession();
  const sectores = animalService.getSectores();

  const [animales, setAnimales] = useState<AnimalDto[]>([]);
  const [adopciones, setAdopciones] = useState<SolicitudAdopcionDto[]>([]);
  const [totalPersonas, setTotalPersonas] = useState<number>(0);
  const [totalAtenciones, setTotalAtenciones] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let montado = true;
    const cargarTablero = async () => {
      try {
        const [listaAnimales, listaPersonas, listaAdopciones, listaAtenciones] =
          await Promise.all([
            animalService.getAll().catch(() => []),
            personaService.getAll().catch(() => []),
            adopcionService.getAll().catch(() => []),
            atencionService.getAll().catch(() => []),
          ]);

        if (montado) {
          setAnimales(listaAnimales);
          setAdopciones(listaAdopciones);
          setTotalPersonas(listaPersonas.length);
          setTotalAtenciones(listaAtenciones.length);
        }
      } finally {
        if (montado) setIsLoading(false);
      }
    };

    void cargarTablero();
    return () => {
      montado = false;
    };
  }, []);

  const disponiblesCount = animales.filter((a) => a.idEstado === 1).length;
  const enTratamientoCount = animales.filter((a) => a.idEstado === 2).length;
  const solicitudesPendientes = adopciones.filter((s) => s.estado === 'Pendiente');

  const modulosOperativos = [
    {
      nombre: 'Censo de Animales',
      ruta: '/admin/animales',
      detalle: 'Fichas de rescate, sectores, nutrición y estados',
      icono: Dog,
      contador: `${animales.length} fichas`,
      origen: 'Core · Animal.cs',
      esReal: false,
    },
    {
      nombre: 'Solicitudes de Adopción',
      ruta: '/admin/adopciones',
      detalle: 'Aprobación de postulaciones web y contratos',
      icono: HeartHandshake,
      contador: `${solicitudesPendientes.length} pendientes`,
      origen: 'Core · SolicitudAdopcion.cs',
      esReal: false,
    },
    {
      nombre: 'Atenciones Veterinarias',
      ruta: '/admin/atenciones',
      detalle: 'Consultas, diagnósticos, vacunas y tratamientos',
      icono: Stethoscope,
      contador: `${totalAtenciones} registros`,
      origen: 'Core · Atencion_Veterinario.cs',
      esReal: false,
    },
    {
      nombre: 'Padrón de Personas',
      ruta: '/admin/personas',
      detalle: 'Adoptantes, rescatistas y búsqueda por DNI/Nombre',
      icono: Users,
      contador: `${totalPersonas} activos`,
      origen: 'api/Personas',
      esReal: true,
    },
    {
      nombre: 'Catálogo de Vacunas',
      ruta: '/admin/vacunas',
      detalle: 'Plan de inmunización conectado con MySQL',
      icono: Syringe,
      contador: 'CRUD Activo',
      origen: 'api/Vacuna',
      esReal: true,
    },
    {
      nombre: 'Catálogo de Medicamentos',
      ruta: '/admin/medicamentos',
      detalle: 'Vademécum veterinario conectado con MySQL',
      icono: Pill,
      contador: 'CRUD Activo',
      origen: 'api/Medicamento',
      esReal: true,
    },
    {
      nombre: 'Razas por Especie',
      ruta: '/admin/razas',
      detalle: 'Clasificación canina y felina por especie',
      icono: Sparkles,
      contador: 'Filtro Especie',
      origen: 'api/Raza',
      esReal: true,
    },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Cabecera Operativa y Cinta de Estado en Vivo */}
      <div className="bg-white rounded-xl border border-[#D6CEC2] overflow-hidden">
        <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E5DFD7]">
          <div className="space-y-1">
            <h2
              className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Centro Operativo · Patitas Calchaquíes
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              {session
                ? `Sesión activa: ${session.usuario.user} (${session.rol.nombre}) · Guardia Ruta 40 Cafayate`
                : 'Gestión diaria de censo, sanidad veterinaria y solicitudes de adopción.'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 min-h-[38px] rounded-lg text-xs font-semibold text-stone-700 hover:text-stone-900 bg-[#FAF8F5] border border-[#D6CEC2] transition-colors"
            >
              <span>Portada pública</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#B84A27]" />
            </Link>
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
              Revisar Adopciones
            </Button>
          </div>
        </div>

        {/* Cinta tabular de indicadores operativos (reemplaza las 4 tarjetas repetitivas) */}
        <dl className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#E5DFD7] bg-[#FAF8F5]">
          <div className="p-4 sm:px-6 flex items-baseline justify-between gap-2">
            <dt className="text-xs font-semibold text-stone-600">Censo en refugio</dt>
            <dd className="text-xl font-bold text-stone-900 tabular-data">
              {isLoading ? '—' : animales.length}{' '}
              <span className="text-xs font-medium text-[#2D6A4F]">
                ({disponiblesCount} listos)
              </span>
            </dd>
          </div>

          <div className="p-4 sm:px-6 flex items-baseline justify-between gap-2">
            <dt className="text-xs font-semibold text-stone-600">En tratamiento</dt>
            <dd className="text-xl font-bold text-amber-800 tabular-data">
              {isLoading ? '—' : enTratamientoCount}
            </dd>
          </div>

          <div className="p-4 sm:px-6 flex items-baseline justify-between gap-2">
            <dt className="text-xs font-semibold text-stone-600">Trámites adopción</dt>
            <dd className="text-xl font-bold text-[#B84A27] tabular-data">
              {isLoading ? '—' : solicitudesPendientes.length}{' '}
              <span className="text-xs font-medium text-stone-600">por evaluar</span>
            </dd>
          </div>

          <div className="p-4 sm:px-6 flex items-baseline justify-between gap-2">
            <dt className="text-xs font-semibold text-stone-600">Padrón MySQL</dt>
            <dd className="text-xl font-bold text-stone-900 tabular-data">
              {isLoading ? '—' : totalPersonas}{' '}
              <span className="text-xs font-medium text-stone-600">personas</span>
            </dd>
          </div>
        </dl>
      </div>

      {/* 2. Espacio de Trabajo en Dos Columnas Asimétricas (7:5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Columna Izquierda (7 cols): Bandeja de Adopciones Recientes + Ocupación de Sectores */}
        <div className="lg:col-span-7 space-y-8">
          {/* Bandeja de postulaciones pendientes */}
          <section className="bg-white rounded-xl border border-[#D6CEC2] overflow-hidden">
            <div className="p-5 border-b border-[#E5DFD7] flex items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-base text-stone-900">
                  Postulaciones de Adopción Pendientes
                </h3>
                <p className="text-xs text-stone-600">
                  Incluye las solicitudes enviadas por vecinos desde la portada pública (`/`).
                </p>
              </div>
              <Badge variant={solicitudesPendientes.length > 0 ? 'warning' : 'neutral'} dot>
                {solicitudesPendientes.length} pendientes
              </Badge>
            </div>

            {isLoading ? (
              <div className="p-5 space-y-3">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : solicitudesPendientes.length === 0 ? (
              <div className="p-6 text-sm text-stone-600">
                No hay solicitudes pendientes de revisión en este momento.
              </div>
            ) : (
              <div className="divide-y divide-[#E5DFD7]">
                {solicitudesPendientes.slice(0, 4).map((sol) => (
                  <div
                    key={sol.idSolicitudAdopcion}
                    className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF8F5] transition-colors"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-stone-900">
                          {sol.personaNombre || `Postulante #${sol.idPersona}`}
                        </span>
                        <span className="text-xs text-stone-600">solicita adoptar a</span>
                        <span className="font-bold text-sm text-[#B84A27]">
                          {sol.animalNombre || `Animal #${sol.idAnimal}`}
                        </span>
                        <span className="text-xs font-mono text-stone-600 tabular-data">
                          ({sol.fecha})
                        </span>
                      </div>
                      {sol.observacion && (
                        <p className="text-xs text-stone-600 line-clamp-1">
                          {sol.observacion}
                        </p>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/admin/adopciones')}
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      Evaluar
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Ocupación de Sectores y Alojamiento (Predio.cs + Sector.cs + Alojamiento_Animal.cs) */}
          <section className="bg-white rounded-xl border border-[#D6CEC2] overflow-hidden">
            <div className="p-5 border-b border-[#E5DFD7] flex items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#B84A27]" />
                  <span>Capacidad y Alojamiento por Sector</span>
                </h3>
                <p className="text-xs text-stone-600">
                  Distribución física según <code className="font-mono">Predio.cs</code>,{' '}
                  <code className="font-mono">Sector.cs</code> y{' '}
                  <code className="font-mono">Alojamiento_Animal.cs</code>.
                </p>
              </div>
            </div>

            <div className="divide-y divide-[#E5DFD7]">
              {sectores.map((sec) => {
                const animalesEnSector = animales.filter(
                  (a) => a.idEstado !== 3 && a.alojamiento?.idSector === sec.idSector
                );
                const porcentaje = Math.min(
                  100,
                  Math.round((animalesEnSector.length / sec.capacidad) * 100)
                );

                return (
                  <div key={sec.idSector} className="p-4 sm:px-5 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-stone-900">
                          {sec.nombre}
                        </h4>
                        <p className="text-xs text-stone-600 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-stone-500" />
                          <span>{sec.predioNombre}</span>
                        </p>
                      </div>
                      <span className="text-xs font-mono font-semibold text-stone-800 tabular-data">
                        {animalesEnSector.length} / {sec.capacidad} plazas ({porcentaje}%)
                      </span>
                    </div>

                    {animalesEnSector.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {animalesEnSector.map((a) => (
                          <span
                            key={a.idAnimal}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F3EFEA] text-stone-800 text-xs font-medium tabular-data"
                          >
                            <span>{a.nombre}</span>
                            <span className="text-stone-500 font-mono text-[11px]">
                              ({a.codigoIdentificacion})
                            </span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Columna Derecha (5 cols): Directorio de Módulos y Estado de Integración API C# */}
        <aside className="lg:col-span-5 bg-white rounded-xl border border-[#D6CEC2] overflow-hidden">
          <div className="p-5 border-b border-[#E5DFD7]">
            <h3 className="font-bold text-base text-stone-900">
              Módulos y Endpoints del Sistema
            </h3>
            <p className="text-xs text-stone-600 mt-0.5">
              Acceso directo a las 7 áreas operativas y estado de conexión con tu backend C#.
            </p>
          </div>

          <div className="divide-y divide-[#E5DFD7]">
            {modulosOperativos.map((mod) => {
              const Icon = mod.icono;
              return (
                <button
                  key={mod.ruta}
                  type="button"
                  onClick={() => navigate(mod.ruta)}
                  className="w-full p-4 sm:px-5 text-left hover:bg-[#FAF8F5] transition-colors flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-[#F3EFEA] text-[#B84A27] flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-stone-900">
                          {mod.nombre}
                        </span>
                        <Badge variant={mod.esReal ? 'success' : 'info'}>
                          {mod.origen}
                        </Badge>
                      </div>
                      <p className="text-xs text-stone-600 truncate mt-0.5">
                        {mod.detalle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono font-semibold text-stone-700 tabular-data hidden sm:inline">
                      {mod.contador}
                    </span>
                    <ArrowRight className="w-4 h-4 text-stone-500" />
                  </div>
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
};
