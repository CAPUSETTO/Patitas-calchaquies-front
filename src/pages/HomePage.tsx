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
      origen: 'api/Animales',
      esReal: true,
    },
    {
      nombre: 'Solicitudes de Adopción',
      ruta: '/admin/adopciones',
      detalle: 'Aprobación de postulaciones web y contratos',
      icono: HeartHandshake,
      contador: `${solicitudesPendientes.length} pendientes`,
      origen: 'api/SolicitudesAdopciones',
      esReal: true,
    },
    {
      nombre: 'Atenciones Veterinarias',
      ruta: '/admin/atenciones',
      detalle: 'Consultas, diagnósticos, vacunas y tratamientos',
      icono: Stethoscope,
      contador: `${totalAtenciones} registros`,
      origen: 'api/AtencionesVeterinarias',
      esReal: true,
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
      {/* 1. Cabecera Operativa con el Emblema Oficial y Cinta de Indicadores Claros */}
      <div className="surface-layered rounded-3xl overflow-hidden">
        <div className="p-6 sm:p-7 bg-[#0F291E] text-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white p-1.5 shrink-0 hidden sm:flex items-center justify-center">
              <img
                src="/logo-patitas.jpg"
                alt="Logo Asociación Protectora de Animales"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="space-y-1">
              <h2
                className="text-xl sm:text-2xl font-black text-white tracking-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Centro Operativo · Asociación Protectora Patitas Calchaquíes
              </h2>
              <p className="text-xs sm:text-sm text-[#D1FAE5]">
                {session
                  ? `Operador en turno: ${session.usuario.user} (${session.rol.nombre}) · Guardia Activa`
                  : 'Gestión diaria de censo, sanidad veterinaria y solicitudes de adopción.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3.5 min-h-[38px] rounded-xl text-xs font-bold text-white bg-[#143325] hover:bg-[#1E4634] border border-[#23533D] transition-colors"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <span>Landing Pública</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#4ADE80]" />
            </Link>
            <Button
              variant="secondary"
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
              Evaluar Adopciones
            </Button>
          </div>
        </div>

        {/* Cinta tabular de indicadores en Blanco Puro para lectura rápida del trabajador */}
        <dl className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#DCE6DF] bg-white">
          <div className="p-4 sm:px-6 flex items-baseline justify-between gap-2">
            <dt className="text-xs font-bold text-[#2D4A3E]">Censo en guardia</dt>
            <dd className="text-2xl font-black text-[#0F291E] tabular-data">
              {isLoading ? '—' : animales.length}
            </dd>
          </div>

          <div className="p-4 sm:px-6 flex items-baseline justify-between gap-2">
            <dt className="text-xs font-bold text-[#2D4A3E]">Aptos adopción</dt>
            <dd className="text-2xl font-black text-[#16A34A] tabular-data">
              {isLoading ? '—' : disponiblesCount}
            </dd>
          </div>

          <div className="p-4 sm:px-6 flex items-baseline justify-between gap-2">
            <dt className="text-xs font-bold text-[#2D4A3E]">En tratamiento</dt>
            <dd className="text-2xl font-black text-[#EA580C] tabular-data">
              {isLoading ? '—' : enTratamientoCount}
            </dd>
          </div>

          <div className="p-4 sm:px-6 flex items-baseline justify-between gap-2">
            <dt className="text-xs font-bold text-[#2D4A3E]">Postulaciones web</dt>
            <dd className="text-2xl font-black text-[#DC2626] tabular-data">
              {isLoading ? '—' : solicitudesPendientes.length}
            </dd>
          </div>
        </dl>
      </div>

      {/* 2. Espacio de Trabajo en Dos Columnas Asimétricas (7:5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Columna Izquierda (7 cols): Bandeja de Adopciones Recientes + Ocupación de Sectores */}
        <div className="lg:col-span-7 space-y-8">
          {/* Bandeja de postulaciones pendientes */}
          <section className="surface-layered rounded-2xl overflow-hidden">
            <div className="p-5 bg-[#F7FAF8] border-b border-[#DCE6DF] flex items-center justify-between gap-2">
              <div>
                <h3
                  className="font-black text-base text-[#0F291E] tracking-tight"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Postulaciones de Adopción Pendientes
                </h3>
                <p className="text-xs sm:text-sm text-[#2D4A3E]">
                  Incluye las solicitudes enviadas desde la Estación 3 de la Landing Pública (`/`).
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
              <div className="p-6 text-sm text-[#2D4A3E]">
                No hay solicitudes pendientes de revisión en este momento.
              </div>
            ) : (
              <div className="divide-y divide-[#DCE6DF]">
                {solicitudesPendientes.slice(0, 4).map((sol) => (
                  <div
                    key={sol.idSolicitudAdopcion}
                    className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F7FAF8] transition-colors"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-base text-[#0F291E]">
                          {sol.personaNombre || `Postulante #${sol.idPersona}`}
                        </span>
                        <span className="text-xs font-medium text-[#527062]">solicita a</span>
                        <span className="font-bold text-base text-[#16A34A]">
                          {sol.animalNombre || `Animal #${sol.idAnimal}`}
                        </span>
                        <span className="text-xs font-mono font-bold text-[#2D4A3E] tabular-data">
                          ({sol.fecha})
                        </span>
                      </div>
                      {sol.observacion && (
                        <p className="text-sm text-[#2D4A3E] line-clamp-1">
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
          <section className="surface-layered rounded-2xl overflow-hidden">
            <div className="p-5 bg-[#F7FAF8] border-b border-[#DCE6DF] flex items-center justify-between gap-2">
              <div>
                <h3
                  className="font-black text-base text-[#0F291E] tracking-tight flex items-center gap-2"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  <Building2 className="w-4 h-4 text-[#16A34A]" />
                  <span>Capacidad y Alojamiento por Sector</span>
                </h3>
                <p className="text-xs sm:text-sm text-[#2D4A3E]">
                  Distribución física según <code className="font-mono font-bold">Predio.cs</code>,{' '}
                  <code className="font-mono font-bold">Sector.cs</code> y{' '}
                  <code className="font-mono font-bold">Alojamiento_Animal.cs</code>.
                </p>
              </div>
            </div>

            <div className="divide-y divide-[#DCE6DF]">
              {sectores.map((sec) => {
                const animalesEnSector = animales.filter(
                  (a) => a.idEstado !== 3 && a.alojamiento?.idSector === sec.idSector
                );
                const porcentaje = Math.min(
                  100,
                  Math.round((animalesEnSector.length / sec.capacidad) * 100)
                );

                return (
                  <div key={sec.idSector} className="p-4 sm:px-5 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h4
                          className="font-bold text-sm text-[#0F291E]"
                          style={{ fontFamily: 'var(--font-display)' }}
                        >
                          {sec.nombre}
                        </h4>
                        <p className="text-xs text-[#2D4A3E] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-[#DC2626]" />
                          <span>{sec.predioNombre}</span>
                        </p>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#0F291E] tabular-data">
                        {animalesEnSector.length} / {sec.capacidad} plazas ({porcentaje}%)
                      </span>
                    </div>

                    {animalesEnSector.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {animalesEnSector.map((a) => (
                          <span
                            key={a.idAnimal}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#EDF4F0] text-[#0F291E] text-xs font-bold tabular-data"
                          >
                            <span>{a.nombre}</span>
                            <span className="text-[#16A34A] font-mono text-[11px]">
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
        <aside className="lg:col-span-5 surface-layered rounded-2xl overflow-hidden">
          <div className="p-5 bg-[#F7FAF8] border-b border-[#DCE6DF]">
            <h3
              className="font-black text-base text-[#0F291E] tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Módulos y Endpoints del Sistema
            </h3>
            <p className="text-xs sm:text-sm text-[#2D4A3E] mt-0.5">
              Acceso directo a las 7 áreas operativas y estado de conexión con tu backend C#.
            </p>
          </div>

          <div className="divide-y divide-[#DCE6DF]">
            {modulosOperativos.map((mod) => {
              const Icon = mod.icono;
              return (
                <button
                  key={mod.ruta}
                  type="button"
                  onClick={() => navigate(mod.ruta)}
                  className="w-full p-4 sm:px-5 text-left hover:bg-[#F7FAF8] transition-colors flex items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-base text-[#0F291E]">
                          {mod.nombre}
                        </span>
                        <Badge variant={mod.esReal ? 'success' : 'info'}>
                          {mod.origen}
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-[#2D4A3E] truncate mt-0.5">
                        {mod.detalle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono font-bold text-[#2D4A3E] tabular-data hidden sm:inline">
                      {mod.contador}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#527062]" />
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
