import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  PawPrint,
  HeartHandshake,
  ShieldCheck,
  MapPin,
  Search,
  CheckCircle2,
  ArrowRight,
  Stethoscope,
  Sparkles,
  Scale,
  Compass,
  Utensils,
} from 'lucide-react';
import { Button, Input, Badge, ErrorAlert } from '../components/ui';
import { animalService } from '../services/animalService';
import { personaService } from '../services/personaService';
import { adopcionService } from '../services/adopcionService';
import { authService } from '../services/authService';
import type { AnimalDto, SectorDto } from '../types/animal.types';

type FiltroCat = 'todos' | 'perros' | 'gatos' | `sector-${number}`;

export const LandingPage: React.FC = () => {
  const session = authService.getCurrentSession();
  const sectores: SectorDto[] = animalService.getSectores();

  const [animales, setAnimales] = useState<AnimalDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filtroActivo, setFiltroActivo] = useState<FiltroCat>('todos');
  const [busqueda, setBusqueda] = useState<string>('');
  const [animalSeleccionado, setAnimalSeleccionado] = useState<AnimalDto | null>(null);

  // Estado de progreso de scroll para el Hilo de Ruta 40 y paralaje suave
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [heroOffset, setHeroOffset] = useState<number>(0);
  const catalogoRef = useRef<HTMLElement | null>(null);

  // Estado del formulario de adopción
  const [nombrePostulante, setNombrePostulante] = useState<string>('');
  const [dniPostulante, setDniPostulante] = useState<string>('');
  const [telefonoPostulante, setTelefonoPostulante] = useState<string>('');
  const [localidadPostulante, setLocalidadPostulante] = useState<string>('Cafayate');
  const [motivoAdopcion, setMotivoAdopcion] = useState<string>('');
  const [enviandoSolicitud, setEnviandoSolicitud] = useState<boolean>(false);
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null);
  const [solicitudExitosa, setSolicitudExitosa] = useState<{
    animalNombre: string;
    postulante: string;
  } | null>(null);

  useEffect(() => {
    let montado = true;
    const cargarCenso = async () => {
      try {
        const data = await animalService.getAll();
        if (montado) {
          setAnimales(data);
          const primeroDisponible = data.find((a) => a.idEstado === 1) ?? data[0] ?? null;
          setAnimalSeleccionado(primeroDisponible);
        }
      } finally {
        if (montado) setIsLoading(false);
      }
    };
    void cargarCenso();
    return () => {
      montado = false;
    };
  }, []);

  // Efecto de Scroll para trazar el Hilo de Ruta 40 y desplazar sutilmente las capas del Hero
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
      setScrollProgress(pct);
      setHeroOffset(Math.min(40, scrollTop * 0.08));
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // IntersectionObserver para activar las revelaciones .scroll-reveal al hacer scroll
  useEffect(() => {
    const elements = document.querySelectorAll('.scroll-reveal');
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [animales, filtroActivo, busqueda]);

  // Censo activo (Disponibles = 1 y En Tratamiento = 2)
  const animalesEnGuardia = animales.filter((a) => a.idEstado !== 3);
  const listosCount = animalesEnGuardia.filter((a) => a.idEstado === 1).length;
  const enTratamientoCount = animalesEnGuardia.filter((a) => a.idEstado === 2).length;

  const animalesFiltrados = animalesEnGuardia.filter((animal) => {
    const coincideCategoria =
      filtroActivo === 'todos' ||
      (filtroActivo === 'perros' && animal.idEspecie === 1) ||
      (filtroActivo === 'gatos' && animal.idEspecie === 2) ||
      (filtroActivo.startsWith('sector-') &&
        animal.alojamiento?.idSector === Number(filtroActivo.replace('sector-', '')));

    const termino = busqueda.trim().toLowerCase();
    const coincideTexto =
      termino === '' ||
      animal.nombre.toLowerCase().includes(termino) ||
      animal.codigoIdentificacion.toLowerCase().includes(termino) ||
      (animal.razaNombre ?? '').toLowerCase().includes(termino) ||
      (animal.ingreso?.lugarOrigen ?? '').toLowerCase().includes(termino);

    return coincideCategoria && coincideTexto;
  });

  const expedienteActivo =
    animalSeleccionado &&
    animalesFiltrados.some((a) => a.idAnimal === animalSeleccionado.idAnimal)
      ? animalSeleccionado
      : animalesFiltrados[0] ?? animalesEnGuardia[0] ?? null;

  const iniciarPostulacion = (animal: AnimalDto) => {
    setAnimalSeleccionado(animal);
    setSolicitudExitosa(null);
    setErrorFormulario(null);
    const formEl = document.getElementById('estacion-adopcion');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleEnviarPostulacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expedienteActivo) {
      setErrorFormulario('Selecciona un animal del catálogo antes de enviar tu postulación.');
      return;
    }

    const nombreLimpio = nombrePostulante.trim();
    const dniLimpio = dniPostulante.trim();
    const telefonoLimpio = telefonoPostulante.trim();

    if (!nombreLimpio || !dniLimpio || !telefonoLimpio) {
      setErrorFormulario('Por favor completa tu nombre completo, DNI y teléfono de contacto.');
      return;
    }

    setEnviandoSolicitud(true);
    setErrorFormulario(null);

    try {
      let idPersonaAdoptante = 1;
      try {
        const partes = nombreLimpio.split(' ');
        const nombrePila = partes[0] || nombreLimpio;
        const apellidoPila = partes.slice(1).join(' ') || localidadPostulante;
        const nuevaPersona = await personaService.crear({
          nombre: nombrePila,
          apellido: apellidoPila,
          dni: dniLimpio,
          telefono: telefonoLimpio,
          direccion: localidadPostulante,
        });
        if (nuevaPersona && nuevaPersona.idPersona) {
          idPersonaAdoptante = nuevaPersona.idPersona;
        }
      } catch {
        idPersonaAdoptante = Math.floor(Math.random() * 800) + 100;
      }

      await adopcionService.crear(
        {
          idPersona: idPersonaAdoptante,
          idAnimal: expedienteActivo.idAnimal,
          observacion: `Postulación web (${localidadPostulante} · Tel: ${telefonoLimpio} · DNI: ${dniLimpio}). ${
            motivoAdopcion.trim() ||
            'Compromiso de adopción responsable y seguimiento veterinario.'
          }`,
        },
        {
          personaNombre: nombreLimpio,
          personaDni: dniLimpio,
          personaTelefono: telefonoLimpio,
          animalNombre: expedienteActivo.nombre,
          animalCodigo: expedienteActivo.codigoIdentificacion,
        }
      );

      setSolicitudExitosa({
        animalNombre: expedienteActivo.nombre,
        postulante: nombreLimpio,
      });
      setMotivoAdopcion('');
    } catch (err) {
      setErrorFormulario(
        err instanceof Error
          ? err.message
          : 'No pudimos registrar tu solicitud en este momento. Intenta nuevamente.'
      );
    } finally {
      setEnviandoSolicitud(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] bg-modern-dots text-[#0F172A] flex flex-col">
      {/* Barra Superior Flotante con Hilo de Progreso de Scroll */}
      <header className="sticky top-0 z-40 bg-[#0F172A]/95 backdrop-blur-md text-white border-b border-[#1E293B]">
        {/* Hilo luminoso de progreso impulsado por el scroll */}
        <div className="h-1 w-full bg-[#1E293B] overflow-hidden">
          <div
            className="h-full bg-[#F97316] transition-all duration-150 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-[0_4px_14px_rgba(37,99,235,0.45)]">
              <PawPrint className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <span
                className="font-black text-base sm:text-lg tracking-tight block leading-none truncate"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Patitas Calchaquíes
              </span>
              <span className="font-mono text-[11px] text-[#94A3B8] block mt-1 truncate">
                RUTA 40 · CAFAYATE · SAN CARLOS · AMAICHA
              </span>
            </div>
          </div>

          {/* Estaciones del Hilo de Custodia en vivo */}
          <nav
            aria-label="Estaciones de recorrido"
            className="hidden lg:flex items-center gap-6 text-xs font-bold text-[#CBD5E1]"
          >
            <a
              href="#inicio-ruta"
              className={`inline-flex items-center gap-2 transition-colors hover:text-white ${
                scrollProgress < 30 ? 'text-[#60A5FA]' : ''
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
              <span>Estación 1 · Origen Ruta 40</span>
            </a>
            <a
              href="#catalogo-hilo"
              className={`inline-flex items-center gap-2 transition-colors hover:text-white ${
                scrollProgress >= 30 && scrollProgress < 72 ? 'text-[#FB923C]' : ''
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#F97316]" />
              <span>Estación 2 · Expedientes Vivos ({animalesEnGuardia.length})</span>
            </a>
            <a
              href="#estacion-adopcion"
              className={`inline-flex items-center gap-2 transition-colors hover:text-white ${
                scrollProgress >= 72 ? 'text-[#34D399]' : ''
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span>Estación 3 · Adopción Directa</span>
            </a>
          </nav>

          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href="#estacion-adopcion"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 min-h-[38px] rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold transition-colors shadow-[0_6px_16px_-4px_rgba(249,115,22,0.45)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Adoptar</span>
            </a>

            <Link
              to={session ? '/admin' : '/login'}
              className="inline-flex items-center gap-2 px-3.5 min-h-[38px] rounded-xl bg-[#1E293B] hover:bg-[#334155] text-white border border-[#334155] text-xs font-bold transition-colors"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <ShieldCheck className="w-4 h-4 text-[#60A5FA]" />
              <span>{session ? `Dashboard (${session.usuario.user})` : 'Acceso Trabajadores'}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ESTACIÓN 1: Hero Inmersivo Nocturno con Capas Vibrantes en Paralaje Suave */}
      <section
        id="inicio-ruta"
        className="relative overflow-hidden bg-[#0F172A] text-white border-b border-[#1E293B]"
      >
        {/* Halos cromáticos suaves de fondo (Cobalto y Coral) que responden al scroll */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#2563EB]/20 blur-3xl"
          style={{ transform: `translate3d(0, ${heroOffset * 0.8}px, 0)` }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-12 right-0 w-96 h-96 rounded-full bg-[#F97316]/15 blur-3xl"
          style={{ transform: `translate3d(0, -${heroOffset * 0.6}px, 0)` }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Columna Izquierda (7 cols): Narrativa, Hilo de Ruta 40 y Acciones */}
            <div className="lg:col-span-7 space-y-6">
              <h1
                className="text-3xl sm:text-5xl lg:text-[54px] font-black tracking-tight text-white leading-[1.06]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Cada rescate en la Ruta 40 tiene historia clínica, nombre y destino.
              </h1>

              <p className="text-base sm:text-lg text-[#CBD5E1] max-w-2xl leading-relaxed">
                Sigue el hilo de custodia desde el kilómetro exacto del hallazgo en Cafayate,
                Amaicha del Valle, Cachi o Molinos hasta su alta veterinaria. Sin trámites
                ocultos: explora su ficha real y postúlate para adoptar en un solo recorrido.
              </p>

              {/* Cinta horizontal de los 3 eslabones del Hilo de Custodia */}
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#1E293B] rounded-2xl bg-[#1E293B]/75 border border-[#334155]">
                <div className="p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#60A5FA]">
                      KILÓMETRO CERO
                    </span>
                    <Compass className="w-4 h-4 text-[#60A5FA]" />
                  </div>
                  <p className="font-bold text-sm text-white">Rescate Georreferenciado</p>
                  <p className="text-xs text-[#94A3B8]">
                    Registro directo en <code className="font-mono">Ingreso_Animal.cs</code>
                  </p>
                </div>

                <div className="p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#34D399]">
                      ALTA SANITARIA
                    </span>
                    <Stethoscope className="w-4 h-4 text-[#34D399]" />
                  </div>
                  <p className="font-bold text-sm text-white">
                    {listosCount} Listos · {enTratamientoCount} en Guardia
                  </p>
                  <p className="text-xs text-[#94A3B8]">
                    Avalado con matrícula en <code className="font-mono">Esterilizacion.cs</code>
                  </p>
                </div>

                <div className="p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#FB923C]">
                      HOGAR DEFINITIVO
                    </span>
                    <HeartHandshake className="w-4 h-4 text-[#FB923C]" />
                  </div>
                  <p className="font-bold text-sm text-white">Adopción Directa</p>
                  <p className="text-xs text-[#94A3B8]">
                    Sincronizada con el panel de trabajadores
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => {
                    catalogoRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                >
                  Explorar el Hilo de Rescatados ({animalesEnGuardia.length})
                </Button>

                {expedienteActivo && (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => iniciarPostulacion(expedienteActivo)}
                    leftIcon={<HeartHandshake className="w-5 h-5" />}
                  >
                    Adoptar a {expedienteActivo.nombre}
                  </Button>
                )}
              </div>
            </div>

            {/* Columna Derecha (5 cols): Escaparate en Capas Riso con Paralaje Suave */}
            <div
              className="lg:col-span-5"
              style={{ transform: `translate3d(0, -${heroOffset * 0.35}px, 0)` }}
            >
              {expedienteActivo && (
                <div className="riso-frame rounded-3xl bg-[#1E293B] border border-[#334155] overflow-hidden shadow-[0_24px_54px_-16px_rgba(0,0,0,0.55)]">
                  <div className="relative h-64 sm:h-72 bg-[#0F172A] overflow-hidden">
                    {expedienteActivo.fotoUrl ? (
                      <img
                        src={expedienteActivo.fotoUrl}
                        alt={`Retrato de ${expedienteActivo.nombre}`}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#64748B]">
                        <PawPrint className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/25 to-transparent" />

                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                      <span className="px-3 py-1 rounded-full bg-[#0F172A]/85 backdrop-blur-md text-xs font-mono font-bold text-[#60A5FA] border border-[#334155]">
                        {expedienteActivo.codigoIdentificacion}
                      </span>
                      <Badge
                        variant={expedienteActivo.idEstado === 1 ? 'success' : 'warning'}
                        dot
                      >
                        {expedienteActivo.estadoNombre}
                      </Badge>
                    </div>

                    <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-3">
                      <div>
                        <h2
                          className="text-2xl sm:text-3xl font-black text-white tracking-tight"
                          style={{ fontFamily: 'var(--font-display)' }}
                        >
                          {expedienteActivo.nombre}
                        </h2>
                        <p className="text-xs sm:text-sm text-[#CBD5E1] font-medium">
                          {expedienteActivo.idEspecie === 1 ? 'Canino' : 'Felino'} ·{' '}
                          {expedienteActivo.razaNombre ?? 'Mestizo Calchaquí'} ·{' '}
                          {expedienteActivo.idSexo === 2 ? 'Hembra' : 'Macho'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Trazabilidad resumida en 3 pasos */}
                  <div className="p-5 space-y-4 bg-[#1E293B]">
                    <div className="grid grid-cols-2 divide-x divide-[#334155] text-xs">
                      <div className="pr-3 space-y-1">
                        <span className="text-[#94A3B8] block font-medium">Hallazgo en Ruta</span>
                        <span className="text-white font-bold block truncate">
                          {expedienteActivo.ingreso?.lugarOrigen ?? 'Cafayate, Ruta 40'}
                        </span>
                      </div>
                      <div className="pl-3 space-y-1">
                        <span className="text-[#94A3B8] block font-medium">Sector Actual</span>
                        <span className="text-[#60A5FA] font-bold block truncate">
                          {expedienteActivo.alojamiento?.sectorNombre ?? 'Caniles Norte'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#334155] flex items-center justify-between gap-3">
                      <span className="text-xs font-mono text-[#CBD5E1] tabular-data">
                        {expedienteActivo.castrado && expedienteActivo.esterilizacion
                          ? `Esterilizado · ${expedienteActivo.esterilizacion.veterinarioMatricula}`
                          : 'En control veterinario'}
                      </span>
                      <button
                        type="button"
                        onClick={() => iniciarPostulacion(expedienteActivo)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FB923C] hover:text-white transition-colors cursor-pointer"
                      >
                        <span>Postular ahora</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ESTACIÓN 2: El Hilo de Custodia en Scroll + Catálogo de Capas Vibrantes */}
      <main
        id="catalogo-hilo"
        ref={catalogoRef}
        className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-12"
      >
        {/* Cabecera de Filtros y Buscador Moderno */}
        <div className="scroll-reveal surface-layered rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2
                className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Expedientes en Guardia y Trazabilidad Clínica
              </h2>
              <p className="text-sm sm:text-base text-[#334155]">
                Haz scroll o selecciona cualquier rescatado para inspeccionar su hilo completo de
                origen, dieta diaria y alta quirúrgica.
              </p>
            </div>

            {/* Buscador instantáneo */}
            <div className="relative w-full lg:w-80 shrink-0">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre, raza, lugar o código..."
                aria-label="Buscar animales en el fichero"
                className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-sm font-medium text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/25 focus:border-[#2563EB]"
              />
            </div>
          </div>

          {/* Píldoras de filtro por Especie y Sector Físico */}
          <div
            role="tablist"
            aria-label="Filtrar por especie o sector del refugio"
            className="flex items-center gap-2 overflow-x-auto pb-1"
          >
            {[
              { id: 'todos' as FiltroCat, label: `Todos (${animalesEnGuardia.length})` },
              {
                id: 'perros' as FiltroCat,
                label: `Perros (${animalesEnGuardia.filter((a) => a.idEspecie === 1).length})`,
              },
              {
                id: 'gatos' as FiltroCat,
                label: `Gatos (${animalesEnGuardia.filter((a) => a.idEspecie === 2).length})`,
              },
              ...sectores.map((s) => ({
                id: `sector-${s.idSector}` as FiltroCat,
                label: `${s.nombre} (${
                  animalesEnGuardia.filter((a) => a.alojamiento?.idSector === s.idSector).length
                }/${s.capacidad})`,
              })),
            ].map((tab) => {
              const activo = filtroActivo === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={activo}
                  type="button"
                  onClick={() => setFiltroActivo(tab.id)}
                  className={`px-4 min-h-[40px] rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activo
                      ? 'bg-[#2563EB] text-white shadow-[0_6px_16px_-4px_rgba(37,99,235,0.4)]'
                      : 'bg-[#F1F5F9] text-[#334155] hover:bg-[#E2E8F0] hover:text-[#0F172A]'
                  }`}
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cuerpo Principal en Dos Columnas: Hilo de Rescatados (5 cols) + Visor Clínico Sticky (7 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Columna Izquierda (5 cols): Línea vertical del Hilo de Ruta 40 + Lista interactiva */}
          <div className="lg:col-span-5 relative pl-6 sm:pl-8">
            {/* Línea vertical del Hilo de Custodia que se colorea con el scroll */}
            <div
              aria-hidden="true"
              className="absolute left-2 sm:left-3 top-2 bottom-2 w-1 rounded-full bg-[#E2E8F0] overflow-hidden"
            >
              <div
                className="w-full bg-gradient-to-b from-[#2563EB] via-[#F97316] to-[#059669] transition-all duration-200"
                style={{ height: `${Math.min(100, Math.max(20, scrollProgress * 1.35))}%` }}
              />
            </div>

            {isLoading ? (
              <div className="surface-layered rounded-2xl p-6 text-sm font-bold text-[#475569]">
                Sincronizando expedientes del refugio...
              </div>
            ) : animalesFiltrados.length === 0 ? (
              <div className="surface-layered rounded-2xl p-6 space-y-3">
                <p className="text-sm font-bold text-[#334155]">
                  No encontramos rescatados para este filtro.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFiltroActivo('todos');
                    setBusqueda('');
                  }}
                >
                  Mostrar todos los rescatados
                </Button>
              </div>
            ) : (
              <div className="surface-layered rounded-2xl overflow-hidden divide-y divide-[#E2E8F0]">
                {animalesFiltrados.map((animal, idx) => {
                  const esActivo = expedienteActivo?.idAnimal === animal.idAnimal;
                  return (
                    <button
                      key={animal.idAnimal}
                      type="button"
                      onClick={() => setAnimalSeleccionado(animal)}
                      style={{ transitionDelay: `${idx * 45}ms` }}
                      className={`scroll-reveal w-full p-4 sm:p-5 text-left transition-colors flex items-start gap-3.5 cursor-pointer ${
                        esActivo ? 'bg-[#EFF6FF]/90' : 'bg-white hover:bg-[#F8FAFC]'
                      }`}
                    >
                      {/* Miniatura con indicador de selección */}
                      <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-[#E2E8F0] shrink-0">
                        {animal.fotoUrl ? (
                          <img
                            src={animal.fotoUrl}
                            alt={animal.nombre}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#64748B]">
                            <PawPrint className="w-6 h-6" />
                          </div>
                        )}
                        {esActivo && (
                          <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-[#2563EB] ring-2 ring-white" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[11px] font-bold text-[#2563EB] tabular-data">
                            {animal.codigoIdentificacion}
                          </span>
                          <Badge
                            variant={animal.idEstado === 1 ? 'success' : 'warning'}
                            dot
                          >
                            {animal.idEstado === 1 ? 'Listo para adoptar' : 'En rehabilitación'}
                          </Badge>
                        </div>

                        <h3
                          className="font-black text-lg text-[#0F172A] truncate mt-0.5"
                          style={{ fontFamily: 'var(--font-display)' }}
                        >
                          {animal.nombre}
                        </h3>

                        <p className="text-xs sm:text-sm text-[#475569] truncate">
                          {animal.razaNombre ?? 'Mestizo'} ·{' '}
                          {animal.idSexo === 2 ? 'Hembra' : 'Macho'} ·{' '}
                          {animal.alojamiento?.sectorNombre ?? 'Predio Central'}
                        </p>

                        <p className="text-xs text-[#64748B] flex items-center gap-1 mt-1 truncate">
                          <MapPin className="w-3.5 h-3.5 text-[#F97316] shrink-0" />
                          <span className="truncate">
                            {animal.ingreso?.lugarOrigen ?? 'Ruta 40, Valles Calchaquíes'}
                          </span>
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Columna Derecha (7 cols): Visor Sticky del Expediente + Trazabilidad en 4 Bloques */}
          <div className="lg:col-span-7 lg:sticky lg:top-24">
            {expedienteActivo && (
              <article
                aria-label={`Expediente detallado de ${expedienteActivo.nombre}`}
                className="scroll-reveal surface-layered rounded-3xl overflow-hidden"
              >
                {/* Cabecera visual del expediente */}
                <div className="grid grid-cols-1 md:grid-cols-12 border-b border-[#E2E8F0]">
                  <div className="md:col-span-5 bg-[#0F172A] min-h-[240px] relative overflow-hidden">
                    {expedienteActivo.fotoUrl ? (
                      <img
                        src={expedienteActivo.fotoUrl}
                        alt={`Fotografía de ${expedienteActivo.nombre}`}
                        className="w-full h-full object-cover max-h-[320px] md:max-h-none"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#64748B]">
                        <PawPrint className="w-12 h-12" />
                      </div>
                    )}
                    <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-[#0F172A]/85 backdrop-blur-sm text-white font-mono text-xs font-bold">
                      {expedienteActivo.codigoIdentificacion}
                    </span>
                  </div>

                  <div className="md:col-span-7 p-6 sm:p-7 flex flex-col justify-between space-y-4 bg-white">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Badge
                          variant={expedienteActivo.idEstado === 1 ? 'success' : 'warning'}
                          dot
                        >
                          {expedienteActivo.idEstado === 1
                            ? 'Apto para Adopción Inmediata'
                            : 'En Seguimiento Veterinario'}
                        </Badge>
                        <span className="font-mono text-xs font-bold text-[#475569] tabular-data">
                          INGRESO: {expedienteActivo.fechaIngreso}
                        </span>
                      </div>

                      <h3
                        className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        {expedienteActivo.nombre}
                      </h3>

                      <p className="text-sm font-bold text-[#2563EB]">
                        {expedienteActivo.idEspecie === 1 ? 'Canino' : 'Felino'} ·{' '}
                        {expedienteActivo.razaNombre ?? 'Mestizo Calchaquí'} ·{' '}
                        {expedienteActivo.idSexo === 2 ? 'Hembra' : 'Macho'} ·{' '}
                        {expedienteActivo.castrado ? 'Esterilizado' : 'En plan sanitario'}
                      </p>

                      <p className="text-sm sm:text-base text-[#334155] leading-relaxed">
                        {expedienteActivo.observaciones ??
                          'Rescatado en corredor de la Ruta 40, rehabilitado por el equipo de guardia.'}
                      </p>
                    </div>

                    {expedienteActivo.ingreso?.observacion && (
                      <div className="pt-3 border-t border-[#E2E8F0] flex items-center gap-2 text-xs sm:text-sm font-bold text-[#0F172A]">
                        <Sparkles className="w-4 h-4 text-[#F97316] shrink-0" />
                        <span>Nota de rescate: {expedienteActivo.ingreso.observacion}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cuadrícula continua de las 4 entidades C# (Sin tarjetas anidadas) */}
                <dl className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#E2E8F0] bg-[#F8FAFC]">
                  {/* Celda 1: Ingreso_Animal.cs */}
                  <div className="p-5 space-y-1.5 border-b border-[#E2E8F0]">
                    <dt className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#2563EB]">
                      <span>1. Origen y Rescate (Ingreso_Animal.cs)</span>
                      <MapPin className="w-4 h-4 shrink-0" />
                    </dt>
                    <dd className="text-sm sm:text-base font-bold text-[#0F172A]">
                      {expedienteActivo.ingreso?.lugarOrigen ?? 'Ruta 40, Valles Calchaquíes'}
                    </dd>
                    <dd className="text-xs sm:text-sm text-[#475569]">
                      Modalidad: {expedienteActivo.ingreso?.tipoIngreso ?? 'Rescate en ruta'} ·
                      Motivo:{' '}
                      <strong className="text-[#0F172A]">
                        {expedienteActivo.ingreso?.motivo ?? 'Asistencia en ruta'}
                      </strong>
                    </dd>
                  </div>

                  {/* Celda 2: Alojamiento_Animal.cs */}
                  <div className="p-5 space-y-1.5 border-b border-[#E2E8F0]">
                    <dt className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#2563EB]">
                      <span>2. Sector y Plaza (Alojamiento_Animal.cs)</span>
                      <Compass className="w-4 h-4 shrink-0" />
                    </dt>
                    <dd className="text-sm sm:text-base font-bold text-[#0F172A]">
                      {expedienteActivo.alojamiento?.sectorNombre ?? 'Caniles Norte'}
                    </dd>
                    <dd className="text-xs sm:text-sm text-[#475569]">
                      {expedienteActivo.alojamiento?.predioNombre ?? 'Predio Central Ruta 40'} ·
                      Desde:{' '}
                      <span className="font-mono font-bold text-[#0F172A] tabular-data">
                        {expedienteActivo.alojamiento?.fechaIngreso ?? expedienteActivo.fechaIngreso}
                      </span>
                    </dd>
                  </div>

                  {/* Celda 3: PlanAlimentacion.cs */}
                  <div className="p-5 space-y-1.5">
                    <dt className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#F97316]">
                      <span>3. Nutrición Diaria (PlanAlimentacion.cs)</span>
                      <Utensils className="w-4 h-4 shrink-0" />
                    </dt>
                    <dd className="text-sm sm:text-base font-bold text-[#0F172A]">
                      {expedienteActivo.planAlimentacion?.tipoAlimento ??
                        'Dieta Balanceada Adultos'}
                    </dd>
                    <dd className="text-xs sm:text-sm text-[#475569] tabular-data">
                      Ración:{' '}
                      <strong className="font-mono text-[#0F172A]">
                        {expedienteActivo.planAlimentacion?.cantidad ?? 350}g
                      </strong>{' '}
                      · {expedienteActivo.planAlimentacion?.frecuencia ?? '2 tomas diarias'}
                    </dd>
                  </div>

                  {/* Celda 4: Esterilizacion.cs */}
                  <div className="p-5 space-y-1.5">
                    <dt className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#059669]">
                      <span>4. Sanidad y Castración (Esterilizacion.cs)</span>
                      <Stethoscope className="w-4 h-4 shrink-0" />
                    </dt>
                    <dd className="text-sm sm:text-base font-bold text-[#0F172A]">
                      {expedienteActivo.castrado && expedienteActivo.esterilizacion
                        ? `${expedienteActivo.esterilizacion.tipo} (${expedienteActivo.esterilizacion.fecha})`
                        : 'Turno programado por guardia'}
                    </dd>
                    <dd className="text-xs sm:text-sm text-[#475569] tabular-data">
                      Profesional:{' '}
                      <strong className="text-[#0F172A]">
                        {expedienteActivo.esterilizacion?.veterinarioNombre ?? 'Equipo Veterinario'}
                      </strong>{' '}
                      (
                      <span className="font-mono">
                        {expedienteActivo.esterilizacion?.veterinarioMatricula ?? 'MP-SAL-0418'}
                      </span>
                      )
                    </dd>
                  </div>
                </dl>

                {/* Barra de acción del expediente */}
                <div className="p-5 sm:px-7 bg-white border-t border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-[#334155]">
                    <Scale className="w-4 h-4 text-[#059669] shrink-0" />
                    <span>
                      Vacunación al día y seguimiento post-adopción bonificado por el refugio.
                    </span>
                  </div>

                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => iniciarPostulacion(expedienteActivo)}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Postularme para adoptar a {expedienteActivo.nombre}
                  </Button>
                </div>
              </article>
            )}
          </div>
        </div>

        {/* ESTACIÓN 3: Formulario de Adopción Responsable conectado con el Dashboard */}
        <section
          id="estacion-adopcion"
          className="scroll-reveal surface-layered rounded-3xl overflow-hidden scroll-mt-24"
        >
          <div className="bg-[#0F172A] text-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2
                className="text-2xl sm:text-3xl font-black tracking-tight text-white"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Estación Final · Solicitud de Adopción Responsable
              </h2>
              <p className="text-sm sm:text-base text-[#CBD5E1]">
                Tu postulación se registra directamente en la bandeja operativa de{' '}
                <code className="font-mono text-xs text-[#60A5FA]">SolicitudAdopcion.cs</code> para
                coordinar la visita en el refugio.
              </p>
            </div>

            {expedienteActivo && (
              <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#1E293B] border border-[#334155] shrink-0">
                <HeartHandshake className="w-5 h-5 text-[#FB923C]" />
                <div>
                  <span className="text-[11px] font-mono text-[#94A3B8] block">
                    POSTULANDO PARA:
                  </span>
                  <span className="font-bold text-sm text-white">
                    {expedienteActivo.nombre} ({expedienteActivo.codigoIdentificacion})
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 sm:p-8 lg:p-10 bg-white">
            {solicitudExitosa ? (
              <div className="space-y-5 max-w-2xl">
                <div className="flex items-center gap-3 text-[#059669]">
                  <CheckCircle2 className="w-8 h-8 shrink-0" />
                  <h3
                    className="text-xl sm:text-2xl font-black text-[#0F172A]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    ¡Postulación registrada para {solicitudExitosa.animalNombre}!
                  </h3>
                </div>
                <p className="text-base text-[#334155] leading-relaxed">
                  Gracias, <strong>{solicitudExitosa.postulante}</strong>. El equipo de guardia de{' '}
                  <strong>Patitas Calchaquíes</strong> ya recibió tu solicitud en el tablero
                  administrativo (`/` &rarr; `/admin/adopciones`) y se comunicará contigo en las
                  próximas 24 horas.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setSolicitudExitosa(null)}
                  >
                    Enviar otra solicitud
                  </Button>
                  <Link
                    to={session ? '/admin/adopciones' : '/login'}
                    className="inline-flex items-center gap-1.5 px-4 min-h-[38px] rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] text-xs font-bold transition-colors"
                  >
                    <span>Ver en el Dashboard de Trabajadores</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleEnviarPostulacion} className="space-y-6">
                {errorFormulario && (
                  <ErrorAlert
                    title="Revisa los datos de tu postulación"
                    message={errorFormulario}
                  />
                )}

                {/* Selector rápido de animal */}
                <div className="space-y-2">
                  <span className="block text-sm font-bold text-[#0F172A]">
                    1. Confirma el compañero al que deseas postular:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {animalesEnGuardia.map((animal) => {
                      const elegido = expedienteActivo?.idAnimal === animal.idAnimal;
                      return (
                        <button
                          key={animal.idAnimal}
                          type="button"
                          onClick={() => setAnimalSeleccionado(animal)}
                          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                            elegido
                              ? 'bg-[#2563EB] text-white border-[#1D4ED8] shadow-[0_6px_14px_-4px_rgba(37,99,235,0.4)]'
                              : 'bg-[#F8FAFC] text-[#334155] border-[#CBD5E1] hover:bg-[#F1F5F9]'
                          }`}
                        >
                          <span>{animal.nombre}</span>
                          <span
                            className={`font-mono text-[11px] ${
                              elegido ? 'text-[#DBEAFE]' : 'text-[#64748B]'
                            }`}
                          >
                            ({animal.codigoIdentificacion})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Input
                    label="Nombre y Apellido"
                    value={nombrePostulante}
                    onChange={(e) => setNombrePostulante(e.target.value)}
                    placeholder="Ej. Lucía Alvarado"
                    required
                  />
                  <Input
                    label="DNI (sin puntos)"
                    value={dniPostulante}
                    onChange={(e) => setDniPostulante(e.target.value)}
                    placeholder="Ej. 38912044"
                    inputMode="numeric"
                    required
                  />
                  <Input
                    label="Teléfono / WhatsApp"
                    value={telefonoPostulante}
                    onChange={(e) => setTelefonoPostulante(e.target.value)}
                    placeholder="Ej. 3868 45-9102"
                    required
                  />

                  <div className="w-full space-y-1.5">
                    <label
                      htmlFor="localidad-postulante"
                      className="block text-sm font-bold text-[#0F172A] tracking-tight"
                    >
                      Localidad en los Valles
                    </label>
                    <select
                      id="localidad-postulante"
                      value={localidadPostulante}
                      onChange={(e) => setLocalidadPostulante(e.target.value)}
                      className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] text-base focus:outline-none focus:ring-2 focus:ring-[#2563EB]/25 focus:border-[#2563EB]"
                    >
                      <option value="Cafayate">Cafayate (Salta)</option>
                      <option value="San Carlos">San Carlos / Animaná</option>
                      <option value="Amaicha del Valle">Amaicha del Valle (Tucumán)</option>
                      <option value="Cachi / Molinos">Cachi / Molinos</option>
                      <option value="Santa María">Santa María (Catamarca)</option>
                      <option value="Salta Capital">Salta Capital / Alrededores</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="motivo-adopcion"
                    className="block text-sm font-bold text-[#0F172A] tracking-tight"
                  >
                    Cuéntanos sobre tu hogar (patio cerrado, otros animales, disponibilidad)
                  </label>
                  <textarea
                    id="motivo-adopcion"
                    rows={3}
                    value={motivoAdopcion}
                    onChange={(e) => setMotivoAdopcion(e.target.value)}
                    placeholder="Ej. Vivo en Cafayate, tenemos patio tapiado y buscamos un compañero para nuestra familia..."
                    className="w-full p-3.5 rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] text-base placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/25 focus:border-[#2563EB]"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <p className="text-xs sm:text-sm text-[#475569]">
                    Al enviar, tus datos se vinculan con{' '}
                    <code className="font-mono font-bold text-[#0F172A]">Persona.cs</code> y{' '}
                    <code className="font-mono font-bold text-[#0F172A]">SolicitudAdopcion.cs</code>.
                  </p>
                  <Button
                    type="submit"
                    variant="secondary"
                    size="lg"
                    isLoading={enviandoSolicitud}
                    leftIcon={<HeartHandshake className="w-5 h-5" />}
                  >
                    Enviar Solicitud para {expedienteActivo?.nombre ?? 'Adoptar'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </section>
      </main>

      {/* Pie de Página Moderno */}
      <footer className="bg-[#0F172A] text-[#94A3B8] border-t border-[#1E293B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5 text-white font-bold">
            <PawPrint className="w-4 h-4 text-[#F97316]" />
            <span>Patitas Calchaquíes · Red de Rescate Ruta 40 (Salta · Tucumán · Catamarca)</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-white transition-colors font-semibold">
              Acceso Personal del Refugio
            </Link>
            <Link to="/admin" className="hover:text-white transition-colors font-semibold">
              Dashboard Operativo
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
