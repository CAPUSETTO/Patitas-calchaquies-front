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
      contador: `${animales.length} FICHAS`,
      origen: 'Core · Animal.cs',
      esReal: false,
    },
    {
      nombre: 'Solicitudes de Adopción',
      ruta: '/admin/adopciones',
      detalle: 'Aprobación de postulaciones web y contratos',
      icono: HeartHandshake,
      contador: `${solicitudesPendientes.length} PENDIENTES`,
      origen: 'Core · SolicitudAdopcion.cs',
      esReal: false,
    },
    {
      nombre: 'Atenciones Veterinarias',
      ruta: '/admin/atenciones',
      detalle: 'Consultas, diagnósticos, vacunas y tratamientos',
      icono: Stethoscope,
      contador: `${totalAtenciones} REGISTROS`,
      origen: 'Core · Atencion_Veterinario.cs',
      esReal: false,
    },
    {
      nombre: 'Padrón de Personas',
      ruta: '/admin/personas',
      detalle: 'Adoptantes, rescatistas y búsqueda por DNI/Nombre',
      icono: Users,
      contador: `${totalPersonas} ACTIVOS`,
      origen: 'api/Personas',
      esReal: true,
    },
    {
      nombre: 'Catálogo de Vacunas',
      ruta: '/admin/vacunas',
      detalle: 'Plan de inmunización conectado con MySQL',
      icono: Syringe,
      contador: 'CRUD ACTIVO',
      origen: 'api/Vacuna',
      esReal: true,
    },
    {
      nombre: 'Catálogo de Medicamentos',
      ruta: '/admin/medicamentos',
      detalle: 'Vademécum veterinario conectado con MySQL',
      icono: Pill,
      contador: 'CRUD ACTIVO',
      origen: 'api/Medicamento',
      esReal: true,
    },
    {
      nombre: 'Razas por Especie',
      ruta: '/admin/razas',
      detalle: 'Clasificación canina y felina por especie',
      icono: Sparkles,
      contador: 'FILTRO ESPECIE',
      origen: 'api/Raza',
      esReal: true,
    },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Chasis Operativo con Banco de Contadores de Laboratorio */}
      <div className="counter-chassis border-2 border-[#1C1917] overflow-hidden">
        <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#44403C]">
          <div className="space-y-1">
            <h2
              className="text-xl sm:text-2xl font-black text-[#FAF8F5] uppercase tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Tablero de Guardia · Patitas Calchaquíes
            </h2>
            <p className="text-sm text-[#D6CEC2]">
              {session
                ? `OPERADOR EN TURNO: ${session.usuario.user.toUpperCase()} (${session.rol.nombre.toUpperCase()}) · PUESTO RUTA 40`
                : 'Gestión diaria de censo, sanidad veterinaria y solicitudes de adopción.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3.5 min-h-[38px] text-xs font-bold uppercase tracking-wider text-[#FAF8F5] bg-[#292524] hover:bg-[#44403C] border border-[#57534E] transition-colors"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <span>Fichero Público</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#F4A261]" />
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

        {/* Banco de Contadores en Chasis Pizarra */}
        <dl className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#44403C]">
          <div className="counter-tube p-4 sm:px-6 flex items-baseline justify-between gap-2">
            <dt className="font-mono text-xs uppercase tracking-wider text-[#D6CEC2]">
              CENSO ACTIVO
            </dt>
            <dd className="font-mono text-2xl sm:text-3xl font-bold text-[#FAF8F5] tabular-data">
              {isLoading ? '—' : String(animales.length).padStart(2, '0')}
            </dd>
          </div>

          <div className="counter-tube p-4 sm:px-6 flex items-baseline justify-between gap-2">
            <dt className="font-mono text-xs uppercase tracking-wider text-[#D6CEC2]">
              APTOS ADOPCIÓN
            </dt>
            <dd className="font-mono text-2xl sm:text-3xl font-bold text-[#52B788] tabular-data">
              {isLoading ? '—' : String(disponiblesCount).padStart(2, '0')}
            </dd>
          </div>

          <div className="counter-tube p-4 sm:px-6 flex items-baseline justify-between gap-2">
            <dt className="font-mono text-xs uppercase tracking-wider text-[#D6CEC2]">
              EN TRATAMIENTO
            </dt>
            <dd className="font-mono text-2xl sm:text-3xl font-bold text-[#F4A261] tabular-data">
              {isLoading ? '—' : String(enTratamientoCount).padStart(2, '0')}
            </dd>
          </div>

          <div className="counter-tube p-4 sm:px-6 flex items-baseline justify-between gap-2">
            <dt className="font-mono text-xs uppercase tracking-wider text-[#D6CEC2]">
              POR EVALUAR
            </dt>
            <dd className="font-mono text-2xl sm:text-3xl font-bold text-[#FAF8F5] tabular-data">
              {isLoading ? '—' : String(solicitudesPendientes.length).padStart(2, '0')}
            </dd>
          </div>
        </dl>
      </div>

      {/* 2. Espacio de Trabajo en Dos Columnas Asimétricas (7:5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Columna Izquierda (7 cols): Bandeja de Adopciones Recientes + Ocupación de Sectores */}
        <div className="lg:col-span-7 space-y-8">
          {/* Bandeja de postulaciones pendientes */}
          <section className="bg-white border-2 border-[#1C1917] overflow-hidden">
            <div className="p-5 bg-[#F2ECE1] border-b-2 border-[#1C1917] flex items-center justify-between gap-2">
              <div>
                <h3
                  className="font-black text-base text-[#1C1917] uppercase tracking-tight"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Postulaciones de Adopción Pendientes
                </h3>
                <p className="text-xs sm:text-sm text-[#44403C]">
                  Incluye las planillas #02 enviadas desde el fichero público (`/`).
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
              <div className="p-6 text-sm text-[#44403C]">
                No hay solicitudes pendientes de revisión en este momento.
              </div>
            ) : (
              <div className="divide-y-2 divide-[#1C1917]">
                {solicitudesPendientes.slice(0, 4).map((sol) => (
                  <div
                    key={sol.idSolicitudAdopcion}
                    className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF8F5] transition-colors"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-base text-[#1C1917]">
                          {sol.personaNombre || `Postulante #${sol.idPersona}`}
                        </span>
                        <span className="text-xs font-bold uppercase text-[#57534E]">
                          solicita a
                        </span>
                        <span className="font-bold text-base text-[#B84A27]">
                          {sol.animalNombre || `Animal #${sol.idAnimal}`}
                        </span>
                        <span className="text-xs font-mono font-bold text-[#44403C] tabular-data">
                          [{sol.fecha}]
                        </span>
                      </div>
                      {sol.observacion && (
                        <p className="text-sm text-[#44403C] line-clamp-1">
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
          <section className="bg-white border-2 border-[#1C1917] overflow-hidden">
            <div className="p-5 bg-[#F2ECE1] border-b-2 border-[#1C1917] flex items-center justify-between gap-2">
              <div>
                <h3
                  className="font-black text-base text-[#1C1917] uppercase tracking-tight flex items-center gap-2"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  <Building2 className="w-4 h-4 text-[#B84A27]" />
                  <span>Capacidad y Alojamiento por Sector</span>
                </h3>
                <p className="text-xs sm:text-sm text-[#44403C]">
                  Distribución física según <code className="font-mono font-bold">Predio.cs</code>,{' '}
                  <code className="font-mono font-bold">Sector.cs</code> y{' '}
                  <code className="font-mono font-bold">Alojamiento_Animal.cs</code>.
                </p>
              </div>
            </div>

            <div className="divide-y-2 divide-[#1C1917]">
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
                          className="font-black text-sm uppercase text-[#1C1917]"
                          style={{ fontFamily: 'var(--font-display)' }}
                        >
                          {sec.nombre}
                        </h4>
                        <p className="text-xs text-[#44403C] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-[#B84A27]" />
                          <span>{sec.predioNombre}</span>
                        </p>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#1C1917] tabular-data">
                        {animalesEnSector.length} / {sec.capacidad} PLAZAS ({porcentaje}%)
                      </span>
                    </div>

                    {animalesEnSector.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {animalesEnSector.map((a) => (
                          <span
                            key={a.idAnimal}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F2ECE1] text-[#1C1917] text-xs font-bold tabular-data"
                          >
                            <span>{a.nombre}</span>
                            <span className="text-[#44403C] font-mono text-[11px]">
                              [{a.codigoIdentificacion}]
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
        <aside className="lg:col-span-5 bg-white border-2 border-[#1C1917] overflow-hidden">
          <div className="p-5 bg-[#F2ECE1] border-b-2 border-[#1C1917]">
            <h3
              className="font-black text-base text-[#1C1917] uppercase tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Módulos y Endpoints del Sistema
            </h3>
            <p className="text-xs sm:text-sm text-[#44403C] mt-0.5">
              Acceso directo a las 7 áreas operativas y estado de conexión con tu backend C#.
            </p>
          </div>

          <div className="divide-y-2 divide-[#1C1917]">
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
                    <div className="w-9 h-9 bg-[#1C1917] text-[#FAF8F5] flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-[#F4A261]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-base text-[#1C1917]">
                          {mod.nombre}
                        </span>
                        <Badge variant={mod.esReal ? 'success' : 'info'}>
                          {mod.origen}
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-[#44403C] truncate mt-0.5">
                        {mod.detalle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono font-bold text-[#1C1917] tabular-data hidden sm:inline">
                      {mod.contador}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#1C1917]" />
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
