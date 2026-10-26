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
import { extractApiErrorMessage } from '../api/axiosClient';
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
  const [localidadPostulante, setLocalidadPostulante] = useState<string>('Amaicha del Valle');
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
      const dniSoloDigitos = dniLimpio.replace(/\D/g, '');
      const existente = await personaService.getByDni(dniSoloDigitos || dniLimpio);

      let idPersonaAdoptante: number;
      if (existente && existente.idPersona) {
        idPersonaAdoptante = existente.idPersona;
      } else {
        const partes = nombreLimpio.split(' ');
        const nombrePila = partes[0] || nombreLimpio;
        const apellidoPila = partes.slice(1).join(' ') || localidadPostulante;
        const nuevaPersona = await personaService.crear({
          nombre: nombrePila,
          apellido: apellidoPila,
          dni: dniSoloDigitos || dniLimpio,
          telefono: telefonoLimpio.replace(/[^\d+]/g, '') || telefonoLimpio,
          direccion: localidadPostulante || 'Valles Calchaquíes',
        });
        idPersonaAdoptante = nuevaPersona.idPersona;
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
        extractApiErrorMessage(
          err,
          'No pudimos registrar tu solicitud en este momento. Verifica tu DNI (7-8 dígitos) y teléfono.'
        )
      );
    } finally {
      setEnviandoSolicitud(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAF8] bg-modern-dots text-[#0F291E] flex flex-col">
      {/* Barra Superior Flotante en Blanco Puro para integrar el Logo Oficial sin bordes forzados */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md text-[#0F291E] border-b border-[#DCE6DF]">
        {/* Hilo luminoso de progreso impulsado por el scroll (Verde Valles -> Rojo Protectora) */}
        <div className="h-1 w-full bg-[#EDF4F0] overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#16A34A] via-[#4DB83B] to-[#DC2626] transition-all duration-150 ease-out"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <img
              src="/logo-patitas.jpg"
              alt="Logo oficial Asociación Protectora de Animales Patitas Calchaquíes"
              className="w-14 h-14 sm:w-16 sm:h-16 object-contain shrink-0 mix-blend-multiply"
            />
            <div className="min-w-0">
              <span
                className="font-black text-base sm:text-xl tracking-tight text-[#0F291E] block leading-none truncate"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Patitas Calchaquíes
              </span>
              <span className="font-mono text-[11px] font-bold text-[#DC2626] block mt-1 truncate">
                ASOCIACIÓN PROTECTORA DE ANIMALES
              </span>
            </div>
          </div>

          {/* Estaciones del Hilo de Custodia en vivo */}
          <nav
            aria-label="Estaciones de recorrido"
            className="hidden lg:flex items-center gap-6 text-xs font-bold text-[#2D4A3E]"
          >
            <a
              href="#inicio-ruta"
              className={`inline-flex items-center gap-2 transition-colors hover:text-[#0F291E] ${
                scrollProgress < 30 ? 'text-[#16A34A]' : ''
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
              <span>Estación 1 · Origen Ruta 40</span>
            </a>
            <a
              href="#catalogo-hilo"
              className={`inline-flex items-center gap-2 transition-colors hover:text-[#0F291E] ${
                scrollProgress >= 30 && scrollProgress < 72 ? 'text-[#DC2626]' : ''
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#DC2626]" />
              <span>Estación 2 · Expedientes Vivos ({animalesEnGuardia.length})</span>
            </a>
            <a
              href="#estacion-adopcion"
              className={`inline-flex items-center gap-2 transition-colors hover:text-[#0F291E] ${
                scrollProgress >= 72 ? 'text-[#16A34A]' : ''
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#4DB83B]" />
              <span>Estación 3 · Adopción Directa</span>
            </a>
          </nav>

          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href="#estacion-adopcion"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 min-h-[40px] rounded-xl bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-bold transition-colors shadow-[0_6px_16px_-4px_rgba(220,38,38,0.4)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Adoptar</span>
            </a>

            <Link
              to={session ? '/admin' : '/login'}
              className="inline-flex items-center gap-2 px-3.5 min-h-[40px] rounded-xl bg-[#0F291E] hover:bg-[#143325] text-white text-xs font-bold transition-colors"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <ShieldCheck className="w-4 h-4 text-[#4ADE80]" />
              <span>{session ? `Dashboard (${session.usuario.user})` : 'Acceso Trabajadores'}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ESTACIÓN 1: Hero Inmersivo en Bosque Profundo (#0F291E) Armonizado con el Logo Oficial */}
      <section
        id="inicio-ruta"
        className="relative overflow-hidden bg-[#0F291E] text-white border-b border-[#1E4634]"
      >
        {/* Halos cromáticos suaves de fondo (Verde Hoja y Rojo Protectora) que responden al scroll */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#4DB83B]/20 blur-3xl"
          style={{ transform: `translate3d(0, ${heroOffset * 0.8}px, 0)` }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-12 right-0 w-96 h-96 rounded-full bg-[#DC2626]/15 blur-3xl"
          style={{ transform: `translate3d(0, -${heroOffset * 0.6}px, 0)` }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Columna Izquierda (7 cols): Sello Institucional, Narrativa y Hilo de Custodia */}
            <div className="lg:col-span-7 space-y-6">
              <h1
                className="text-3xl sm:text-5xl lg:text-[52px] font-black tracking-tight text-white leading-[1.06]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Asociación Protectora de Animales: cada rescate en los Valles tiene historia y hogar.
              </h1>

              <p className="text-base sm:text-lg text-[#D1FAE5] max-w-2xl leading-relaxed">
                Sigue el hilo de custodia desde el kilómetro exacto del hallazgo en Tucumán,
                Amaicha del Valle, Tafí y Cafayate hasta su alta veterinaria. Explora cada
                expediente real y postúlate para adoptar en un solo recorrido.
              </p>

              {/* Insignia Oficial + Cinta de los 3 eslabones del Hilo de Custodia */}
              <div className="grid grid-cols-1 sm:grid-cols-12 divide-y sm:divide-y-0 sm:divide-x divide-[#1E4634] rounded-2xl bg-[#143325]/90 border border-[#23533D] overflow-hidden">
                <div className="sm:col-span-3 p-4 bg-white flex flex-col items-center justify-center text-center">
                  <img
                    src="/logo-patitas.jpg"
                    alt="Emblema Asociación Protectora de Animales"
                    className="w-20 h-20 object-contain"
                  />
                </div>

                <div className="sm:col-span-3 p-4 space-y-1 flex flex-col justify-center">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#4ADE80]">
                      KILÓMETRO CERO
                    </span>
                    <Compass className="w-4 h-4 text-[#4ADE80]" />
                  </div>
                  <p className="font-bold text-sm text-white">Rescate en Valles</p>
                  <p className="text-xs text-[#A7F3D0]">
                    Trazado en <code className="font-mono">Ingreso_Animal.cs</code>
                  </p>
                </div>

                <div className="sm:col-span-3 p-4 space-y-1 flex flex-col justify-center">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#4ADE80]">
                      ALTA SANITARIA
                    </span>
                    <Stethoscope className="w-4 h-4 text-[#4ADE80]" />
                  </div>
                  <p className="font-bold text-sm text-white">
                    {listosCount} Listos · {enTratamientoCount} en Guardia
                  </p>
                  <p className="text-xs text-[#A7F3D0]">
                    Avalado en <code className="font-mono">Esterilizacion.cs</code>
                  </p>
                </div>

                <div className="sm:col-span-3 p-4 space-y-1 flex flex-col justify-center">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#FCA5A5]">
                      HOGAR DEFINITIVO
                    </span>
                    <HeartHandshake className="w-4 h-4 text-[#FCA5A5]" />
                  </div>
                  <p className="font-bold text-sm text-white">Adopción Directa</p>
                  <p className="text-xs text-[#A7F3D0]">
                    Conectada al Dashboard
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
                  Recorrer Expedientes en Scroll ({animalesEnGuardia.length})
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

            {/* Columna Derecha (5 cols): Escaparate en Capas Riso (Verde Hoja + Rojo Protectora) */}
            <div
              className="lg:col-span-5"
              style={{ transform: `translate3d(0, -${heroOffset * 0.35}px, 0)` }}
            >
              {expedienteActivo && (
                <div className="riso-frame rounded-3xl bg-[#143325] border border-[#23533D] overflow-hidden shadow-[0_24px_54px_-16px_rgba(0,0,0,0.55)]">
                  <div className="relative h-64 sm:h-72 bg-[#0F291E] overflow-hidden">
                    {expedienteActivo.fotoUrl ? (
                      <img
                        src={expedienteActivo.fotoUrl}
                        alt={`Retrato de ${expedienteActivo.nombre}`}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#527062]">
                        <PawPrint className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F291E] via-[#0F291E]/25 to-transparent" />

                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                      <span className="px-3 py-1 rounded-full bg-[#0F291E]/85 backdrop-blur-md text-xs font-mono font-bold text-[#4ADE80] border border-[#23533D]">
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
                        <p className="text-xs sm:text-sm text-[#D1FAE5] font-medium">
                          {expedienteActivo.idEspecie === 1 ? 'Canino' : 'Felino'} ·{' '}
                          {expedienteActivo.razaNombre ?? 'Mestizo Calchaquí'} ·{' '}
                          {expedienteActivo.idSexo === 2 ? 'Hembra' : 'Macho'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Trazabilidad resumida en 3 pasos */}
                  <div className="p-5 space-y-4 bg-[#143325]">
                    <div className="grid grid-cols-2 divide-x divide-[#23533D] text-xs">
                      <div className="pr-3 space-y-1">
                        <span className="text-[#A7F3D0] block font-medium">Hallazgo en Ruta</span>
                        <span className="text-white font-bold block truncate">
                          {expedienteActivo.ingreso?.lugarOrigen ?? 'Valles Calchaquíes'}
                        </span>
                      </div>
                      <div className="pl-3 space-y-1">
                        <span className="text-[#A7F3D0] block font-medium">Sector Actual</span>
                        <span className="text-[#4ADE80] font-bold block truncate">
                          {expedienteActivo.alojamiento?.sectorNombre ?? 'Caniles Norte'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#23533D] flex items-center justify-between gap-3">
                      <span className="text-xs font-mono text-[#D1FAE5] tabular-data">
                        {expedienteActivo.castrado && expedienteActivo.esterilizacion
                          ? `Esterilizado · ${expedienteActivo.esterilizacion.veterinarioMatricula}`
                          : 'En control veterinario'}
                      </span>
                      <button
                        type="button"
                        onClick={() => iniciarPostulacion(expedienteActivo)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FCA5A5] hover:text-white transition-colors cursor-pointer"
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
                className="text-2xl sm:text-3xl font-black text-[#0F291E] tracking-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Expedientes en Guardia y Trazabilidad Clínica
              </h2>
              <p className="text-sm sm:text-base text-[#2D4A3E]">
                Haz scroll o selecciona cualquier rescatado para inspeccionar su hilo completo de
                origen, dieta diaria y alta quirúrgica.
              </p>
            </div>

            {/* Buscador instantáneo */}
            <div className="relative w-full lg:w-80 shrink-0">
              <Search className="w-4 h-4 text-[#527062] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre, raza, lugar o código..."
                aria-label="Buscar animales en el fichero"
                className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl bg-[#F7FAF8] border border-[#B8CCC0] text-sm font-medium text-[#0F291E] placeholder:text-[#527062] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/25 focus:border-[#16A34A]"
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
                      ? 'bg-[#16A34A] text-white shadow-[0_6px_16px_-4px_rgba(22,163,74,0.4)]'
                      : 'bg-[#EDF4F0] text-[#2D4A3E] hover:bg-[#DCE6DF] hover:text-[#0F291E]'
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
            {/* Línea vertical del Hilo de Custodia que se colorea con el scroll (Verde -> Rojo) */}
            <div
              aria-hidden="true"
              className="absolute left-2 sm:left-3 top-2 bottom-2 w-1.5 rounded-full bg-[#DCE6DF] overflow-hidden"
            >
              <div
                className="w-full bg-gradient-to-b from-[#16A34A] via-[#4DB83B] to-[#DC2626] transition-all duration-200"
                style={{ height: `${Math.min(100, Math.max(20, scrollProgress * 1.35))}%` }}
              />
            </div>

            {isLoading ? (
              <div className="surface-layered rounded-2xl p-6 text-sm font-bold text-[#2D4A3E]">
                Sincronizando expedientes del refugio...
              </div>
            ) : animalesFiltrados.length === 0 ? (
              <div className="surface-layered rounded-2xl p-6 space-y-3">
                <p className="text-sm font-bold text-[#2D4A3E]">
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
              <div className="surface-layered rounded-2xl overflow-hidden divide-y divide-[#DCE6DF]">
                {animalesFiltrados.map((animal, idx) => {
                  const esActivo = expedienteActivo?.idAnimal === animal.idAnimal;
                  return (
                    <button
                      key={animal.idAnimal}
                      type="button"
                      onClick={() => setAnimalSeleccionado(animal)}
                      style={{ transitionDelay: `${idx * 45}ms` }}
                      className={`scroll-reveal w-full p-4 sm:p-5 text-left transition-colors flex items-start gap-3.5 cursor-pointer ${
                        esActivo ? 'bg-[#F0FDF4]' : 'bg-white hover:bg-[#F7FAF8]'
                      }`}
                    >
                      {/* Miniatura con indicador de selección */}
                      <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-[#EDF4F0] shrink-0">
                        {animal.fotoUrl ? (
                          <img
                            src={animal.fotoUrl}
                            alt={animal.nombre}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#527062]">
                            <PawPrint className="w-6 h-6" />
                          </div>
                        )}
                        {esActivo && (
                          <span className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-[#16A34A] ring-2 ring-white" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[11px] font-bold text-[#16A34A] tabular-data">
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
                          className="font-black text-lg text-[#0F291E] truncate mt-0.5"
                          style={{ fontFamily: 'var(--font-display)' }}
                        >
                          {animal.nombre}
                        </h3>

                        <p className="text-xs sm:text-sm text-[#2D4A3E] truncate">
                          {animal.razaNombre ?? 'Mestizo'} ·{' '}
                          {animal.idSexo === 2 ? 'Hembra' : 'Macho'} ·{' '}
                          {animal.alojamiento?.sectorNombre ?? 'Predio Central'}
                        </p>

                        <p className="text-xs text-[#527062] flex items-center gap-1 mt-1 truncate">
                          <MapPin className="w-3.5 h-3.5 text-[#DC2626] shrink-0" />
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
                <div className="grid grid-cols-1 md:grid-cols-12 border-b border-[#DCE6DF]">
                  <div className="md:col-span-5 bg-[#0F291E] min-h-[240px] relative overflow-hidden">
                    {expedienteActivo.fotoUrl ? (
                      <img
                        src={expedienteActivo.fotoUrl}
                        alt={`Fotografía de ${expedienteActivo.nombre}`}
                        className="w-full h-full object-cover max-h-[320px] md:max-h-none"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#527062]">
                        <PawPrint className="w-12 h-12" />
                      </div>
                    )}
                    <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-[#0F291E]/85 backdrop-blur-sm text-white font-mono text-xs font-bold">
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
                        <span className="font-mono text-xs font-bold text-[#2D4A3E] tabular-data">
                          INGRESO: {expedienteActivo.fechaIngreso}
                        </span>
                      </div>

                      <h3
                        className="text-2xl sm:text-3xl font-black text-[#0F291E] tracking-tight"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        {expedienteActivo.nombre}
                      </h3>

                      <p className="text-sm font-bold text-[#16A34A]">
                        {expedienteActivo.idEspecie === 1 ? 'Canino' : 'Felino'} ·{' '}
                        {expedienteActivo.razaNombre ?? 'Mestizo Calchaquí'} ·{' '}
                        {expedienteActivo.idSexo === 2 ? 'Hembra' : 'Macho'} ·{' '}
                        {expedienteActivo.castrado ? 'Esterilizado' : 'En plan sanitario'}
                      </p>

                      <p className="text-sm sm:text-base text-[#2D4A3E] leading-relaxed">
                        {expedienteActivo.observaciones ??
                          'Rescatado en corredor de los Valles Calchaquíes, rehabilitado por la Asociación Protectora.'}
                      </p>
                    </div>

                    {expedienteActivo.ingreso?.observacion && (
                      <div className="pt-3 border-t border-[#DCE6DF] flex items-center gap-2 text-xs sm:text-sm font-bold text-[#0F291E]">
                        <Sparkles className="w-4 h-4 text-[#DC2626] shrink-0" />
                        <span>Nota de rescate: {expedienteActivo.ingreso.observacion}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cuadrícula continua de las 4 entidades C# (Sin tarjetas anidadas) */}
                <dl className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#DCE6DF] bg-[#F7FAF8]">
                  {/* Celda 1: Ingreso_Animal.cs */}
                  <div className="p-5 space-y-1.5 border-b border-[#DCE6DF]">
                    <dt className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#DC2626]">
                      <span>1. Origen y Rescate (Ingreso_Animal.cs)</span>
                      <MapPin className="w-4 h-4 shrink-0" />
                    </dt>
                    <dd className="text-sm sm:text-base font-bold text-[#0F291E]">
                      {expedienteActivo.ingreso?.lugarOrigen ?? 'Ruta 40, Valles Calchaquíes'}
                    </dd>
                    <dd className="text-xs sm:text-sm text-[#2D4A3E]">
                      Modalidad: {expedienteActivo.ingreso?.tipoIngreso ?? 'Rescate en ruta'} ·
                      Motivo:{' '}
                      <strong className="text-[#0F291E]">
                        {expedienteActivo.ingreso?.motivo ?? 'Asistencia en ruta'}
                      </strong>
                    </dd>
                  </div>

                  {/* Celda 2: Alojamiento_Animal.cs */}
                  <div className="p-5 space-y-1.5 border-b border-[#DCE6DF]">
                    <dt className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#16A34A]">
                      <span>2. Sector y Plaza (Alojamiento_Animal.cs)</span>
                      <Compass className="w-4 h-4 shrink-0" />
                    </dt>
                    <dd className="text-sm sm:text-base font-bold text-[#0F291E]">
                      {expedienteActivo.alojamiento?.sectorNombre ?? 'Caniles Norte'}
                    </dd>
                    <dd className="text-xs sm:text-sm text-[#2D4A3E]">
                      {expedienteActivo.alojamiento?.predioNombre ?? 'Predio Central Ruta 40'} ·
                      Desde:{' '}
                      <span className="font-mono font-bold text-[#0F291E] tabular-data">
                        {expedienteActivo.alojamiento?.fechaIngreso ?? expedienteActivo.fechaIngreso}
                      </span>
                    </dd>
                  </div>

                  {/* Celda 3: PlanAlimentacion.cs */}
                  <div className="p-5 space-y-1.5">
                    <dt className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#16A34A]">
                      <span>3. Nutrición Diaria (PlanAlimentacion.cs)</span>
                      <Utensils className="w-4 h-4 shrink-0" />
                    </dt>
                    <dd className="text-sm sm:text-base font-bold text-[#0F291E]">
                      {expedienteActivo.planAlimentacion?.tipoAlimento ??
                        'Dieta Balanceada Adultos'}
                    </dd>
                    <dd className="text-xs sm:text-sm text-[#2D4A3E] tabular-data">
                      Ración:{' '}
                      <strong className="font-mono text-[#0F291E]">
                        {expedienteActivo.planAlimentacion?.cantidad ?? 350}g
                      </strong>{' '}
                      · {expedienteActivo.planAlimentacion?.frecuencia ?? '2 tomas diarias'}
                    </dd>
                  </div>

                  {/* Celda 4: Esterilizacion.cs */}
                  <div className="p-5 space-y-1.5">
                    <dt className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#0F291E]">
                      <span>4. Sanidad y Castración (Esterilizacion.cs)</span>
                      <Stethoscope className="w-4 h-4 shrink-0 text-[#16A34A]" />
                    </dt>
                    <dd className="text-sm sm:text-base font-bold text-[#0F291E]">
                      {expedienteActivo.castrado && expedienteActivo.esterilizacion
                        ? `${expedienteActivo.esterilizacion.tipo} (${expedienteActivo.esterilizacion.fecha})`
                        : 'Turno programado por guardia'}
                    </dd>
                    <dd className="text-xs sm:text-sm text-[#2D4A3E] tabular-data">
                      Profesional:{' '}
                      <strong className="text-[#0F291E]">
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
                <div className="p-5 sm:px-7 bg-white border-t border-[#DCE6DF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-[#2D4A3E]">
                    <Scale className="w-4 h-4 text-[#16A34A] shrink-0" />
                    <span>
                      Vacunación al día y seguimiento post-adopción por la Asociación Protectora.
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
          <div className="bg-[#0F291E] text-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                  className="text-2xl sm:text-3xl font-black tracking-tight text-white"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Estación Final · Solicitud de Adopción Responsable
                </h2>
                <p className="text-sm sm:text-base text-[#D1FAE5]">
                  Tu postulación se registra directamente en la bandeja operativa de{' '}
                  <code className="font-mono text-xs text-[#4ADE80]">SolicitudAdopcion.cs</code> para
                  coordinar la visita.
                </p>
              </div>
            </div>

            {expedienteActivo && (
              <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-[#143325] border border-[#23533D] shrink-0">
                <HeartHandshake className="w-5 h-5 text-[#FCA5A5]" />
                <div>
                  <span className="text-[11px] font-mono text-[#A7F3D0] block">
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
                <div className="flex items-center gap-3 text-[#16A34A]">
                  <CheckCircle2 className="w-8 h-8 shrink-0" />
                  <h3
                    className="text-xl sm:text-2xl font-black text-[#0F291E]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    ¡Postulación registrada para {solicitudExitosa.animalNombre}!
                  </h3>
                </div>
                <p className="text-base text-[#2D4A3E] leading-relaxed">
                  Gracias, <strong>{solicitudExitosa.postulante}</strong>. La{' '}
                  <strong>Asociación Protectora de Animales Patitas Calchaquíes</strong> ya recibió
                  tu solicitud en el tablero administrativo (`/` &rarr; `/admin/adopciones`) y se
                  comunicará contigo en las próximas 24 horas.
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
                    className="inline-flex items-center gap-1.5 px-4 min-h-[38px] rounded-lg bg-[#EDF4F0] hover:bg-[#DCE6DF] text-[#0F291E] text-xs font-bold transition-colors"
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
                  <span className="block text-sm font-bold text-[#0F291E]">
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
                              ? 'bg-[#16A34A] text-white border-[#15803D] shadow-[0_6px_14px_-4px_rgba(22,163,74,0.4)]'
                              : 'bg-[#F7FAF8] text-[#2D4A3E] border-[#B8CCC0] hover:bg-[#EDF4F0]'
                          }`}
                        >
                          <span>{animal.nombre}</span>
                          <span
                            className={`font-mono text-[11px] ${
                              elegido ? 'text-[#DCFCE7]' : 'text-[#527062]'
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
                    placeholder="Ej. 381 545-9102"
                    required
                  />

                  <div className="w-full space-y-1.5">
                    <label
                      htmlFor="localidad-postulante"
                      className="block text-sm font-bold text-[#0F291E] tracking-tight"
                    >
                      Localidad en los Valles / Tucumán
                    </label>
                    <select
                      id="localidad-postulante"
                      value={localidadPostulante}
                      onChange={(e) => setLocalidadPostulante(e.target.value)}
                      className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#B8CCC0] bg-white text-[#0F291E] text-base focus:outline-none focus:ring-2 focus:ring-[#16A34A]/25 focus:border-[#16A34A]"
                    >
                      <option value="Amaicha del Valle">Amaicha del Valle (Tucumán)</option>
                      <option value="Tafí del Valle">Tafí del Valle (Tucumán)</option>
                      <option value="San Miguel de Tucumán">San Miguel de Tucumán</option>
                      <option value="Cafayate">Cafayate (Salta)</option>
                      <option value="San Carlos / Animaná">San Carlos / Animaná</option>
                      <option value="Santa María">Santa María (Catamarca)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="motivo-adopcion"
                    className="block text-sm font-bold text-[#0F291E] tracking-tight"
                  >
                    Cuéntanos sobre tu hogar (patio cerrado, otros animales, disponibilidad)
                  </label>
                  <textarea
                    id="motivo-adopcion"
                    rows={3}
                    value={motivoAdopcion}
                    onChange={(e) => setMotivoAdopcion(e.target.value)}
                    placeholder="Ej. Vivimos en Amaicha del Valle, tenemos patio cerrado y buscamos un compañero para nuestra familia..."
                    className="w-full p-3.5 rounded-xl border border-[#B8CCC0] bg-white text-[#0F291E] text-base placeholder:text-[#527062] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/25 focus:border-[#16A34A]"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                  <p className="text-xs sm:text-sm text-[#2D4A3E]">
                    Al enviar, tus datos se vinculan con{' '}
                    <code className="font-mono font-bold text-[#0F291E]">Persona.cs</code> y{' '}
                    <code className="font-mono font-bold text-[#0F291E]">SolicitudAdopcion.cs</code>.
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

      {/* Pie de Página Oficial con el Emblema de la Asociación */}
      <footer className="bg-[#0F291E] text-[#A7F3D0] border-t border-[#1E4634]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3 text-white font-bold">
            <img
              src="/logo-patitas.jpg"
              alt="Logo Asociación Protectora de Animales"
              className="w-9 h-9 rounded-lg bg-white p-0.5 object-contain shrink-0"
            />
            <span>
              Asociación Protectora de Animales · Patitas Calchaquíes (Tucumán · Valles Calchaquíes)
            </span>
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
