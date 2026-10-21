import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PawPrint,
  HeartHandshake,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  Search,
  KeyRound,
  ArrowRight,
  Calendar,
  Sparkles,
  Phone,
  X,
} from 'lucide-react';
import { Button, Input, Badge, Skeleton, ErrorAlert } from '../components/ui';
import { animalService } from '../services/animalService';
import { adopcionService } from '../services/adopcionService';
import { authService } from '../services/authService';
import type { AnimalDto } from '../types/animal.types';

export const LandingPage: React.FC = () => {
  const session = authService.getCurrentSession();

  const [animales, setAnimales] = useState<AnimalDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [animalDestacadoId, setAnimalDestacadoId] = useState<number | null>(null);
  const [filtroEspecie, setFiltroEspecie] = useState<'todos' | 1 | 2>('todos');
  const [busqueda, setBusqueda] = useState<string>('');

  // Estado del formulario público de solicitud de adopción
  const [animalParaAdoptar, setAnimalParaAdoptar] = useState<AnimalDto | null>(null);
  const [nombrePostulante, setNombrePostulante] = useState<string>('');
  const [dniPostulante, setDniPostulante] = useState<string>('');
  const [telefonoPostulante, setTelefonoPostulante] = useState<string>('');
  const [localidadPostulante, setLocalidadPostulante] = useState<string>('Cafayate');
  const [motivoPostulante, setMotivoPostulante] = useState<string>('');
  const [enviandoSolicitud, setEnviandoSolicitud] = useState<boolean>(false);
  const [errorPostulacion, setErrorPostulacion] = useState<string | null>(null);
  const [solicitudExitosa, setSolicitudExitosa] = useState<{
    animalNombre: string;
    codigoSeguimiento: number;
  } | null>(null);

  useEffect(() => {
    let montado = true;
    const cargarAnimales = async () => {
      setIsLoading(true);
      try {
        const data = await animalService.getAll();
        if (montado) {
          setAnimales(data);
          const primerDisponible = data.find((a) => a.idEstado === 1) || data[0];
          if (primerDisponible) {
            setAnimalDestacadoId(primerDisponible.idAnimal);
          }
        }
      } finally {
        if (montado) setIsLoading(false);
      }
    };

    void cargarAnimales();
    return () => {
      montado = false;
    };
  }, []);

  const animalesDisponibles = animales.filter((a) => a.idEstado === 1 || a.idEstado === 4);

  const animalDestacado =
    animalesDisponibles.find((a) => a.idAnimal === animalDestacadoId) ||
    animalesDisponibles[0] ||
    null;

  const animalesFiltrados = animales.filter((animal) => {
    if ( animal.idEstado === 3 ) return false; // Ocultar los ya adoptados del catálogo activo
    const coincideEspecie =
      filtroEspecie === 'todos' ? true : animal.idEspecie === filtroEspecie;
    const q = busqueda.trim().toLowerCase();
    const coincideTexto =
      !q ||
      animal.nombre.toLowerCase().includes(q) ||
      (animal.razaNombre && animal.razaNombre.toLowerCase().includes(q)) ||
      animal.codigoIdentificacion.toLowerCase().includes(q) ||
      (animal.observaciones && animal.observaciones.toLowerCase().includes(q));

    return coincideEspecie && coincideTexto;
  });

  const iniciarPostulacion = (animal: AnimalDto) => {
    setAnimalParaAdoptar(animal);
    setErrorPostulacion(null);
    setSolicitudExitosa(null);
  };

  const handleEnviarSolicitudPublica = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!animalParaAdoptar) return;

    if (!nombrePostulante.trim() || !dniPostulante.trim() || !telefonoPostulante.trim()) {
      setErrorPostulacion('Por favor completa tu nombre, DNI y teléfono de contacto.');
      return;
    }

    setEnviandoSolicitud(true);
    setErrorPostulacion(null);

    try {
      const observacionCompleta = `[Postulación Web · ${localidadPostulante}] ${
        motivoPostulante.trim() || 'Interesado en adopción responsable.'
      }`;

      const creada = await adopcionService.crear(
        {
          idPersona: Date.now() % 10000,
          idAnimal: animalParaAdoptar.idAnimal,
          observacion: observacionCompleta,
        },
        {
          personaNombre: nombrePostulante.trim(),
          personaDni: dniPostulante.trim(),
          personaTelefono: telefonoPostulante.trim(),
          animalNombre: animalParaAdoptar.nombre,
          animalCodigo: animalParaAdoptar.codigoIdentificacion,
        }
      );

      setSolicitudExitosa({
        animalNombre: animalParaAdoptar.nombre,
        codigoSeguimiento: creada.idSolicitudAdopcion,
      });
      setNombrePostulante('');
      setDniPostulante('');
      setTelefonoPostulante('');
      setMotivoPostulante('');
    } catch (err) {
      setErrorPostulacion(
        err instanceof Error
          ? err.message
          : 'No pudimos registrar tu solicitud en este momento.'
      );
    } finally {
      setEnviandoSolicitud(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col">
      {/* 1. Navegación Pública Superior */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E5DFD7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-[#B84A27] text-white flex items-center justify-center shrink-0">
              <PawPrint className="w-6 h-6 stroke-[2]" />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-base text-stone-900 block leading-tight truncate">
                Patitas Calchaquíes
              </span>
              <span className="text-xs text-stone-600 block leading-tight truncate">
                Refugio y Adopción · Valles Calchaquíes
              </span>
            </div>
          </div>

          <nav aria-label="Navegación pública" className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-700">
            <a href="#catalogo-adopcion" className="hover:text-[#B84A27] transition-colors">
              Compañeros en adopción
            </a>
            <a href="#proceso-adopcion" className="hover:text-[#B84A27] transition-colors">
              Cómo adoptar
            </a>
            <a href="#guardia-regional" className="hover:text-[#B84A27] transition-colors">
              Guardia en los Valles
            </a>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            {session ? (
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 px-3.5 min-h-[42px] rounded-lg text-xs sm:text-sm font-semibold text-white bg-stone-900 hover:bg-stone-800 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Panel ({session.usuario.user})</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-3.5 min-h-[42px] rounded-lg text-xs sm:text-sm font-semibold text-stone-800 hover:text-stone-900 bg-[#F3EFEA] hover:bg-[#E5DFD7]/70 border border-[#D6CEC2] transition-colors"
              >
                <KeyRound className="w-4 h-4 text-[#B84A27]" />
                <span>Acceso Personal</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* 2. Primer Viewport: Bitácora Interactiva de Rescate y Adopción (Asimetría 7:5) */}
      <section className="border-b border-[#E5DFD7] bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Columna Izquierda (7 cols): Tesis regional + Métricas reales + Selector directo */}
            <div className="lg:col-span-7 space-y-6">
              <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 tracking-tight leading-[1.12]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Cada rescate en los Valles tiene nombre, ficha clínica y una familia esperándolo.
              </h1>

              <p className="text-base sm:text-lg text-stone-700 leading-relaxed max-w-2xl">
                Somos una red comunitaria de rescate, rehabilitación veterinaria y adopción responsable en{' '}
                <strong className="font-semibold text-stone-900">Cafayate, San Carlos y Santa María</strong>.
                Todos nuestros compañeros se entregan con control sanitario registrado, desparasitación y seguimiento.
              </p>

              {/* Cifras vivas conectadas al servicio */}
              <dl className="grid grid-cols-3 gap-4 pt-2 border-y border-[#E5DFD7] py-4">
                <div>
                  <dt className="text-xs font-medium text-stone-600">Listos para hogar</dt>
                  <dd className="text-2xl sm:text-3xl font-bold text-[#2D6A4F] tabular-data mt-0.5">
                    {isLoading ? '—' : animalesDisponibles.length}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-stone-600">Esterilizados</dt>
                  <dd className="text-2xl sm:text-3xl font-bold text-stone-900 tabular-data mt-0.5">
                    {isLoading
                      ? '—'
                      : animales.filter((a) => a.castrado).length}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-stone-600">Censo activo</dt>
                  <dd className="text-2xl sm:text-3xl font-bold text-stone-900 tabular-data mt-0.5">
                    {isLoading ? '—' : animales.length}
                  </dd>
                </div>
              </dl>

              {/* Selector interactivo en el primer viewport */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-stone-700">
                    Explora los compañeros listos hoy (toca un nombre para ver su ficha):
                  </span>
                  <a
                    href="#catalogo-adopcion"
                    className="text-xs font-semibold text-[#B84A27] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Ver todos</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                {isLoading ? (
                  <div className="flex gap-2">
                    <Skeleton className="h-11 w-28" />
                    <Skeleton className="h-11 w-28" />
                    <Skeleton className="h-11 w-28" />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {animalesDisponibles.map((animal) => {
                      const activo = animalDestacado?.idAnimal === animal.idAnimal;
                      return (
                        <button
                          key={animal.idAnimal}
                          type="button"
                          onClick={() => setAnimalDestacadoId(animal.idAnimal)}
                          className={`inline-flex items-center gap-2 px-3.5 min-h-[44px] rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                            activo
                              ? 'bg-[#B84A27] text-white'
                              : 'bg-[#F3EFEA] text-stone-800 hover:bg-[#E5DFD7]/80 border border-[#D6CEC2]'
                          }`}
                        >
                          <span>{animal.nombre}</span>
                          <span
                            className={`text-xs font-mono tabular-data ${
                              activo ? 'text-amber-100' : 'text-stone-600'
                            }`}
                          >
                            {animal.idEspecie === 1 ? 'Canino' : 'Felino'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Columna Derecha (5 cols): Ficha Clínica Interactiva en Vivo */}
            <div className="lg:col-span-5">
              {isLoading ? (
                <div className="bg-white rounded-xl border border-[#E5DFD7] p-6 space-y-4">
                  <Skeleton className="h-52 w-full rounded-lg" />
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : animalDestacado ? (
                <article className="bg-white rounded-xl border border-[#E5DFD7] overflow-hidden">
                  {animalDestacado.fotoUrl && (
                    <div className="relative h-56 sm:h-64 w-full bg-stone-200 overflow-hidden border-b border-[#E5DFD7]">
                      <img
                        src={animalDestacado.fotoUrl}
                        alt={`Fotografía de ${animalDestacado.nombre}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge variant="success" dot>
                          {animalDestacado.estadoNombre || 'Disponible para Adopción'}
                        </Badge>
                      </div>
                      <div className="absolute bottom-3 right-3 bg-stone-900/85 text-stone-100 px-2.5 py-1 rounded-md text-xs font-mono tabular-data">
                        {animalDestacado.codigoIdentificacion}
                      </div>
                    </div>
                  )}

                  <div className="p-5 sm:p-6 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2
                          className="text-2xl font-bold text-stone-900 tracking-tight"
                          style={{ fontFamily: 'var(--font-display)' }}
                        >
                          {animalDestacado.nombre}
                        </h2>
                        <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                          {animalDestacado.idEspecie === 1 ? 'Perro' : 'Gato'} ·{' '}
                          {animalDestacado.razaNombre || 'Mestizo Calchaquí'} ·{' '}
                          {animalDestacado.idSexo === 1 ? 'Macho' : 'Hembra'}
                        </p>
                      </div>
                      <Badge variant={animalDestacado.castrado ? 'info' : 'neutral'}>
                        {animalDestacado.castrado ? 'Castrado/a' : 'Castración programada'}
                      </Badge>
                    </div>

                    <p className="text-sm text-stone-700 leading-relaxed">
                      {animalDestacado.observaciones ||
                        'Rescatado en los Valles Calchaquíes. Se encuentra desparasitado, con control clínico al día y listo para integrarse a una familia.'}
                    </p>

                    <div className="flex items-center justify-between text-xs text-stone-600 pt-2 border-t border-[#E5DFD7] tabular-data">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-stone-500" />
                        Ingreso: {animalDestacado.fechaIngreso}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[#2D6A4F] font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Apto veterinario
                      </span>
                    </div>

                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      onClick={() => iniciarPostulacion(animalDestacado)}
                      leftIcon={<HeartHandshake className="w-5 h-5" />}
                    >
                      Postularme para adoptar a {animalDestacado.nombre}
                    </Button>
                  </div>
                </article>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Catálogo Abierto de Compañeros en el Refugio */}
      <section id="catalogo-adopcion" className="py-12 sm:py-16 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#E5DFD7] pb-5">
          <div>
            <h2
              className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Compañeros buscando hogar en el Valle
            </h2>
            <p className="text-sm sm:text-base text-stone-600 mt-1">
              Filtra por especie o busca por nombre. Tu postulación llega en tiempo real al tablero del equipo de adopciones.
            </p>
          </div>

          {/* Controles de filtrado */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFiltroEspecie('todos')}
              className={`px-3.5 min-h-[42px] rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                filtroEspecie === 'todos'
                  ? 'bg-stone-900 text-white'
                  : 'bg-[#F3EFEA] text-stone-700 hover:text-stone-900 border border-[#D6CEC2]'
              }`}
            >
              Todos ({animales.filter((a) => a.idEstado !== 3).length})
            </button>
            <button
              type="button"
              onClick={() => setFiltroEspecie(1)}
              className={`px-3.5 min-h-[42px] rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                filtroEspecie === 1
                  ? 'bg-stone-900 text-white'
                  : 'bg-[#F3EFEA] text-stone-700 hover:text-stone-900 border border-[#D6CEC2]'
              }`}
            >
              Perros
            </button>
            <button
              type="button"
              onClick={() => setFiltroEspecie(2)}
              className={`px-3.5 min-h-[42px] rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                filtroEspecie === 2
                  ? 'bg-stone-900 text-white'
                  : 'bg-[#F3EFEA] text-stone-700 hover:text-stone-900 border border-[#D6CEC2]'
              }`}
            >
              Gatos
            </button>
          </div>
        </div>

        {/* Buscador */}
        <div className="max-w-md">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, raza o carácter..."
              className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-lg border border-[#D6CEC2] bg-white text-sm text-stone-900 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-[#B84A27]"
            />
          </div>
        </div>

        {/* Grilla de fichas de adopción */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {animalesFiltrados.map((animal) => (
            <article
              key={animal.idAnimal}
              className="bg-white rounded-xl border border-[#E5DFD7] overflow-hidden flex flex-col justify-between"
            >
              <div>
                {animal.fotoUrl && (
                  <div className="relative h-48 w-full bg-stone-200 border-b border-[#E5DFD7]">
                    <img
                      src={animal.fotoUrl}
                      alt={animal.nombre}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge
                        variant={animal.idEstado === 1 ? 'success' : 'warning'}
                        dot
                      >
                        {animal.estadoNombre || 'Disponible'}
                      </Badge>
                    </div>
                  </div>
                )}

                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-stone-900">
                        {animal.nombre}
                      </h3>
                      <p className="text-xs text-stone-600">
                        {animal.razaNombre || 'Mestizo'} ·{' '}
                        {animal.idSexo === 1 ? 'Macho' : 'Hembra'}
                      </p>
                    </div>
                    <span className="text-xs font-mono text-stone-600 tabular-data">
                      {animal.codigoIdentificacion}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed line-clamp-3">
                    {animal.observaciones ||
                      'Compañero rehabilitado por el equipo del refugio, con controles sanitarios completos.'}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-2 flex items-center justify-between gap-3 border-t border-[#F3EFEA]">
                <span className="text-xs font-medium text-stone-600">
                  {animal.castrado ? 'Castrado/a' : 'En plan sanitario'}
                </span>
                <Button
                  variant={animal.idEstado === 1 ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => iniciarPostulacion(animal)}
                  leftIcon={<HeartHandshake className="w-4 h-4" />}
                >
                  Solicitar adopción
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 4. Proceso de Adopción Responsable (Estructura de bitácora lineal sin tarjetas anidadas) */}
      <section id="proceso-adopcion" className="border-t border-[#E5DFD7] bg-[#F3EFEA]/70 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="max-w-2xl">
            <h2
              className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Cómo funciona la adopción responsable
            </h2>
            <p className="text-sm sm:text-base text-stone-600 mt-1.5">
              Un proceso simple y transparente pensado para cuidar tanto al animal rescatado como a su nueva familia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#D6CEC2] border-y border-[#D6CEC2]">
            <div className="py-6 md:pr-8 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-stone-900">
                  1. Postulación desde tu celular
                </h3>
                <Sparkles className="w-4 h-4 text-[#B84A27]" />
              </div>
              <p className="text-sm text-stone-700 leading-relaxed">
                Eliges al compañero en esta página y completas tus datos básicos. La solicitud impacta al instante en el sistema del refugio.
              </p>
            </div>

            <div className="py-6 md:px-8 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-stone-900">
                  2. Entrevista y visita en el Valle
                </h3>
                <MapPin className="w-4 h-4 text-[#2D6A4F]" />
              </div>
              <p className="text-sm text-stone-700 leading-relaxed">
                Coordinamos un encuentro en nuestro predio de Cafayate o por videollamada para conocer el espacio donde vivirá.
              </p>
            </div>

            <div className="py-6 md:pl-8 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-stone-900">
                  3. Entrega con libreta sanitaria
                </h3>
                <ShieldCheck className="w-4 h-4 text-[#B84A27]" />
              </div>
              <p className="text-sm text-stone-700 leading-relaxed">
                Firmamos el compromiso de adopción y te entregamos el historial completo de vacunas y atenciones registradas en nuestra base.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Pie de Página Público y Guardia Regional */}
      <footer id="guardia-regional" className="border-t border-[#E5DFD7] bg-[#FAF8F5] py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-stone-900">
              Refugio Patitas Calchaquíes · Ruta Nacional 40, Cafayate
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 flex flex-wrap items-center gap-4 tabular-data">
              <span className="inline-flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#B84A27]" />
                Guardia de emergencias: +54 3868 42-1900
              </span>
              <span>Atención de visitas: Lunes a Sábado de 9:30 a 18:00 hs</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={session ? '/admin' : '/login'}
              className="inline-flex items-center gap-2 px-4 min-h-[42px] rounded-lg text-xs sm:text-sm font-semibold text-stone-800 bg-[#F3EFEA] hover:bg-[#E5DFD7] border border-[#D6CEC2] transition-colors"
            >
              <KeyRound className="w-4 h-4 text-[#B84A27]" />
              <span>{session ? 'Ir al Dashboard Administrativo' : 'Ingreso Personal / Veterinaria'}</span>
            </Link>
          </div>
        </div>
      </footer>

      {/* Modal de Solicitud Pública de Adopción (Conectado con adopcionService) */}
      {animalParaAdoptar && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="titulo-modal-adopcion"
          className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-[#FAF8F5] border border-[#D6CEC2] rounded-xl max-w-lg w-full p-6 space-y-5 my-8">
            <div className="flex items-start justify-between gap-3 border-b border-[#E5DFD7] pb-4">
              <div>
                <h2
                  id="titulo-modal-adopcion"
                  className="text-xl font-bold text-stone-900"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Postulación para adoptar a {animalParaAdoptar.nombre}
                </h2>
                <p className="text-xs text-stone-600 mt-0.5 tabular-data">
                  Ficha {animalParaAdoptar.codigoIdentificacion} ·{' '}
                  {animalParaAdoptar.razaNombre || 'Mestizo Calchaquí'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAnimalParaAdoptar(null)}
                className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-[#E5DFD7]/50 cursor-pointer"
                aria-label="Cerrar ventana"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {solicitudExitosa ? (
              <div className="space-y-4 py-2">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-base">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                    <span>¡Solicitud registrada en el refugio!</span>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed">
                    Tu postulación para adoptar a <strong>{solicitudExitosa.animalNombre}</strong> quedó
                    registrada con el número de trámite{' '}
                    <strong className="font-mono tabular-data">
                      #{solicitudExitosa.codigoSeguimiento}
                    </strong>
                    . Si ingresas ahora al panel de administración (<code className="font-mono">/admin/adopciones</code>),
                    verás esta solicitud lista para aprobar.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="primary"
                    onClick={() => setAnimalParaAdoptar(null)}
                  >
                    Entendido
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleEnviarSolicitudPublica} className="space-y-4">
                {errorPostulacion && (
                  <ErrorAlert
                    title="Revisa los datos del formulario"
                    message={errorPostulacion}
                  />
                )}

                <Input
                  label="Tu nombre y apellido"
                  value={nombrePostulante}
                  onChange={(e) => setNombrePostulante(e.target.value)}
                  placeholder="Ej. Lucía Carrizo"
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="DNI (sin puntos)"
                    value={dniPostulante}
                    onChange={(e) => setDniPostulante(e.target.value)}
                    placeholder="Ej. 39482110"
                    required
                  />
                  <Input
                    label="Teléfono / WhatsApp"
                    value={telefonoPostulante}
                    onChange={(e) => setTelefonoPostulante(e.target.value)}
                    placeholder="Ej. +54 3868 451234"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="localidad-postulante"
                    className="block text-sm font-semibold text-stone-800"
                  >
                    Localidad en los Valles
                  </label>
                  <select
                    id="localidad-postulante"
                    value={localidadPostulante}
                    onChange={(e) => setLocalidadPostulante(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-lg border border-[#D6CEC2] bg-white text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#B84A27]"
                  >
                    <option value="Cafayate">Cafayate</option>
                    <option value="San Carlos">San Carlos</option>
                    <option value="Animaná">Animaná</option>
                    <option value="Amaicha del Valle">Amaicha del Valle</option>
                    <option value="Santa María">Santa María</option>
                    <option value="Salta Capital / Tucumán">Salta Capital / Tucumán</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="motivo-postulante"
                    className="block text-sm font-semibold text-stone-800"
                  >
                    Cuéntanos sobre tu hogar (patio, cerramiento, otros animales)
                  </label>
                  <textarea
                    id="motivo-postulante"
                    rows={3}
                    value={motivoPostulante}
                    onChange={(e) => setMotivoPostulante(e.target.value)}
                    placeholder="Ej. Vivo en casa con patio tapiado en Cafayate, buscamos un compañero para la familia..."
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#D6CEC2] bg-white text-sm text-stone-900 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-[#B84A27]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5DFD7]">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAnimalParaAdoptar(null)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={enviandoSolicitud}
                    leftIcon={<HeartHandshake className="w-4 h-4" />}
                  >
                    Enviar solicitud de adopción
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
