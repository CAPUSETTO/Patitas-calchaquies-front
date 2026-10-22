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
  Stethoscope,
  Utensils,
  Building2,
  Phone,
  FileText,
} from 'lucide-react';
import { Button, Input, Badge, Skeleton, ErrorAlert } from '../components/ui';
import { animalService } from '../services/animalService';
import { adopcionService } from '../services/adopcionService';
import { personaService } from '../services/personaService';
import { authService } from '../services/authService';
import type { AnimalDto } from '../types/animal.types';

export const LandingPage: React.FC = () => {
  const session = authService.getCurrentSession();
  const sectores = animalService.getSectores();
  const veterinarios = animalService.getVeterinarios();

  const [animales, setAnimales] = useState<AnimalDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [animalDestacadoId, setAnimalDestacadoId] = useState<number | null>(null);
  const [filtroEspecie, setFiltroEspecie] = useState<'todos' | 1 | 2>('todos');
  const [filtroSectorId, setFiltroSectorId] = useState<number | 'todos'>('todos');
  const [busqueda, setBusqueda] = useState<string>('');

  // Estado de la Mesa de Postulación Directa (espejo de Persona.cs + Solicitud_Adopcion.cs)
  const [animalPostulacionId, setAnimalPostulacionId] = useState<number>(1);
  const [nombre, setNombre] = useState<string>('');
  const [apellido, setApellido] = useState<string>('');
  const [dni, setDni] = useState<string>('');
  const [telefono, setTelefono] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [localidad, setLocalidad] = useState<string>('Cafayate');
  const [direccion, setDireccion] = useState<string>('');
  const [observacion, setObservacion] = useState<string>('');
  const [enviandoSolicitud, setEnviandoSolicitud] = useState<boolean>(false);
  const [errorPostulacion, setErrorPostulacion] = useState<string | null>(null);
  const [solicitudExitosa, setSolicitudExitosa] = useState<{
    animalNombre: string;
    codigoSeguimiento: number;
    sincronizadoMySql: boolean;
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
            setAnimalPostulacionId(primerDisponible.idAnimal);
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

  const animalesPostulables = animales.filter((a) => a.idEstado !== 3);

  const animalDestacado =
    animalesPostulables.find((a) => a.idAnimal === animalDestacadoId) ||
    animalesPostulables[0] ||
    null;

  const animalEnFormulario =
    animalesPostulables.find((a) => a.idAnimal === animalPostulacionId) ||
    animalDestacado ||
    null;

  const animalesFiltrados = animalesPostulables.filter((animal) => {
    const coincideEspecie =
      filtroEspecie === 'todos' ? true : animal.idEspecie === filtroEspecie;
    const coincideSector =
      filtroSectorId === 'todos'
        ? true
        : animal.alojamiento?.idSector === filtroSectorId;
    const q = busqueda.trim().toLowerCase();
    const coincideTexto =
      !q ||
      animal.nombre.toLowerCase().includes(q) ||
      (animal.razaNombre && animal.razaNombre.toLowerCase().includes(q)) ||
      animal.codigoIdentificacion.toLowerCase().includes(q) ||
      (animal.ingreso?.lugarOrigen &&
        animal.ingreso.lugarOrigen.toLowerCase().includes(q)) ||
      (animal.observaciones && animal.observaciones.toLowerCase().includes(q));

    return coincideEspecie && coincideSector && coincideTexto;
  });

  const seleccionarParaAdoptar = (animal: AnimalDto) => {
    setAnimalPostulacionId(animal.idAnimal);
    setAnimalDestacadoId(animal.idAnimal);
    setErrorPostulacion(null);
    setSolicitudExitosa(null);
    const seccion = document.getElementById('postulacion-directa');
    if (seccion) {
      seccion.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const inspeccionarExpediente = (animal: AnimalDto) => {
    setAnimalDestacadoId(animal.idAnimal);
    const hero = document.getElementById('expediente-activo');
    if (hero) {
      hero.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleEnviarSolicitudPublica = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!animalEnFormulario) return;

    const cleanNombre = nombre.trim();
    const cleanApellido = apellido.trim();
    const cleanDni = dni.trim();
    const cleanTelefono = telefono.trim();
    const cleanDireccion = direccion.trim();

    if (!cleanNombre || !cleanApellido) {
      setErrorPostulacion('Ingresa tu nombre y apellido tal como figuran en tu documento.');
      return;
    }
    if (!/^\d{7,8}$/.test(cleanDni)) {
      setErrorPostulacion('El DNI debe contener entre 7 y 8 dígitos numéricos sin puntos (regla de PersonaCreateValidator.cs).');
      return;
    }
    if (!/^\+?\d{6,15}$/.test(cleanTelefono.replace(/\s+/g, ''))) {
      setErrorPostulacion('Ingresa un teléfono válido de solo dígitos (opcional prefijo +).');
      return;
    }
    if (!cleanDireccion) {
      setErrorPostulacion('Indica tu domicilio o referencia en el valle para la visita de seguimiento.');
      return;
    }

    setEnviandoSolicitud(true);
    setErrorPostulacion(null);

    try {
      let idPersonaRegistrada = Date.now() % 10000;
      let sincronizadoMySql = false;
      const direccionCompleta = `${cleanDireccion} (${localidad})`;

      // Intentamos registrar o vincular en el endpoint real api/Personas si la API C# está encendida
      try {
        const personaCreada = await personaService.crear({
          nombre: cleanNombre,
          apellido: cleanApellido,
          dni: cleanDni,
          telefono: cleanTelefono.replace(/\s+/g, ''),
          email: email.trim() || undefined,
          direccion: direccionCompleta,
        });
        if (personaCreada && personaCreada.idPersona) {
          idPersonaRegistrada = personaCreada.idPersona;
          sincronizadoMySql = true;
        }
      } catch {
        // Si la API C# está apagada o el DNI ya existe en MySQL, continuamos con el registro de la SolicitudAdopcion
      }

      const observacionCompleta = `[Domicilio: ${direccionCompleta}] ${
        observacion.trim() || 'Compromiso de adopción responsable y seguimiento veterinario.'
      }`;

      const creada = await adopcionService.crear(
        {
          idPersona: idPersonaRegistrada,
          idAnimal: animalEnFormulario.idAnimal,
          observacion: observacionCompleta,
        },
        {
          personaNombre: `${cleanNombre} ${cleanApellido}`,
          personaDni: cleanDni,
          personaTelefono: cleanTelefono,
          animalNombre: animalEnFormulario.nombre,
          animalCodigo: animalEnFormulario.codigoIdentificacion,
        }
      );

      setSolicitudExitosa({
        animalNombre: animalEnFormulario.nombre,
        codigoSeguimiento: creada.idSolicitudAdopcion,
        sincronizadoMySql,
      });

      setNombre('');
      setApellido('');
      setDni('');
      setTelefono('');
      setEmail('');
      setDireccion('');
      setObservacion('');
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
    <div className="min-h-screen bg-[#FAF8F5] text-[#1C1917] flex flex-col">
      {/* 1. Cabecera Pública con Navegación Directa y Acceso a Gestión Interna */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E5DFD7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-[#B84A27] text-white flex items-center justify-center shrink-0">
              <PawPrint className="w-6 h-6 stroke-[2]" />
            </div>
            <div className="min-w-0">
              <span
                className="font-bold text-base sm:text-lg text-stone-900 block leading-tight truncate"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Patitas Calchaquíes
              </span>
              <span className="text-xs text-stone-600 block leading-tight truncate">
                Cafayate · San Carlos · Animaná · Santa María
              </span>
            </div>
          </div>

          <nav
            aria-label="Secciones de la portada"
            className="hidden lg:flex items-center gap-7 text-sm font-medium text-stone-700"
          >
            <a href="#expediente-activo" className="hover:text-[#B84A27] transition-colors">
              Expedientes clínicos
            </a>
            <a href="#catalogo-adopcion" className="hover:text-[#B84A27] transition-colors">
              Censo en adopción
            </a>
            <a href="#postulacion-directa" className="hover:text-[#B84A27] transition-colors">
              Formulario de adopción
            </a>
            <a href="#infraestructura-valles" className="hover:text-[#B84A27] transition-colors">
              Predios y guardia
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
                className="inline-flex items-center gap-2 px-3.5 min-h-[42px] rounded-lg text-xs sm:text-sm font-semibold text-stone-800 hover:text-stone-900 bg-[#F3EFEA] hover:bg-[#E5DFD7]/80 border border-[#D6CEC2] transition-colors"
              >
                <KeyRound className="w-4 h-4 text-[#B84A27]" />
                <span>Acceso Personal</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* 2. Primer Viewport: Bitácora de Rescate y Expediente Clínico en Vivo (Asimetría 7:5) */}
      <section className="border-b border-[#E5DFD7] bg-[#FAF8F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Columna Izquierda (7 cols): Narrativa Regional + Selector de Expedientes + Estado de Sectores */}
            <div className="lg:col-span-7 space-y-7">
              <div className="space-y-4">
                <h1
                  className="text-3xl sm:text-4xl lg:text-[2.85rem] font-bold text-stone-900 tracking-[-0.025em] leading-[1.1]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Cada rescate en la Ruta 40 tiene nombre, historia clínica y una familia esperándolo.
                </h1>

                <p className="text-base sm:text-lg text-stone-700 leading-relaxed max-w-[66ch]">
                  En <strong className="font-semibold text-stone-900">Patitas Calchaquíes</strong> registramos cada animal desde su rescate en ruta o paraje rural hasta su alta veterinaria. Explora las fichas reales de nuestro censo, conoce en qué sector están alojados hoy e inicia tu postulación de adopción sin intermediarios.
                </p>
              </div>

              {/* Selector interactivo de compañeros del censo en el primer viewport */}
              <div className="space-y-3 pt-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-sm font-bold text-stone-900">
                    Selecciona un compañero para abrir su expediente completo:
                  </h2>
                  <a
                    href="#catalogo-adopcion"
                    className="text-xs font-semibold text-[#B84A27] hover:underline inline-flex items-center gap-1"
                  >
                    <span>Explorar censo completo ({animalesPostulables.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                {isLoading ? (
                  <div className="flex flex-wrap gap-2.5">
                    <Skeleton className="h-12 w-36 rounded-lg" />
                    <Skeleton className="h-12 w-36 rounded-lg" />
                    <Skeleton className="h-12 w-36 rounded-lg" />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {animalesPostulables.map((animal) => {
                      const activo = animalDestacado?.idAnimal === animal.idAnimal;
                      return (
                        <button
                          key={animal.idAnimal}
                          type="button"
                          onClick={() => setAnimalDestacadoId(animal.idAnimal)}
                          className={`flex flex-col items-start justify-between p-3 min-h-[64px] rounded-xl text-left transition-all cursor-pointer border ${
                            activo
                              ? 'bg-stone-900 text-white border-stone-900'
                              : 'bg-white text-stone-900 hover:bg-[#F3EFEA] border-[#D6CEC2]'
                          }`}
                        >
                          <div className="w-full flex items-center justify-between gap-1.5">
                            <span className="font-bold text-sm truncate">
                              {animal.nombre}
                            </span>
                            <span
                              className={`inline-block w-2 h-2 rounded-full shrink-0 ${
                                animal.idEstado === 1 ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                            />
                          </div>
                          <span
                            className={`text-[11px] font-mono tabular-data mt-1 ${
                              activo ? 'text-stone-300' : 'text-stone-600'
                            }`}
                          >
                            {animal.codigoIdentificacion}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Registro vivo de Predios y Sectores (Predio.cs + Sector.cs + Alojamiento_Animal.cs) */}
              <div className="border-t border-[#D6CEC2] pt-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#B84A27]" />
                    <span>Ocupación actual por Sector del Refugio</span>
                  </h2>
                  <span className="text-xs text-stone-600 tabular-data">
                    2 predios activos en el Valle
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 pt-1">
                  {sectores.map((sec) => {
                    const alojadosEnSector = animalesPostulables.filter(
                      (a) => a.alojamiento?.idSector === sec.idSector
                    ).length;
                    const esSectorDelDestacado =
                      animalDestacado?.alojamiento?.idSector === sec.idSector;

                    return (
                      <div
                        key={sec.idSector}
                        className={`py-2.5 px-3 rounded-lg border transition-colors ${
                          esSectorDelDestacado
                            ? 'bg-[#F3EFEA] border-[#B84A27]'
                            : 'bg-transparent border-[#E5DFD7]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-stone-900 truncate">
                            {sec.nombre}
                          </span>
                          <span className="text-xs font-mono font-semibold text-stone-700 tabular-data shrink-0">
                            {alojadosEnSector}/{sec.capacidad} plazas
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600 truncate mt-0.5">
                          {sec.predioNombre}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Columna Derecha (5 cols): Expediente Clínico y de Rescate Completo (Sin tarjetas anidadas) */}
            <div id="expediente-activo" className="lg:col-span-5">
              {isLoading ? (
                <div className="bg-white rounded-xl border border-[#E5DFD7] p-6 space-y-4">
                  <Skeleton className="h-60 w-full rounded-lg" />
                  <Skeleton className="h-7 w-1/2" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : animalDestacado ? (
                <article
                  key={animalDestacado.idAnimal}
                  className="dossier-transition bg-white rounded-xl border border-[#D6CEC2] overflow-hidden"
                >
                  {/* Fotografía y encabezado de identificación */}
                  {animalDestacado.fotoUrl && (
                    <div className="relative h-56 sm:h-64 w-full bg-stone-200 overflow-hidden border-b border-[#E5DFD7]">
                      <img
                        src={animalDestacado.fotoUrl}
                        alt={`Fotografía de ${animalDestacado.nombre}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <Badge
                          variant={animalDestacado.idEstado === 1 ? 'success' : 'warning'}
                          dot
                        >
                          {animalDestacado.estadoNombre || 'Disponible'}
                        </Badge>
                      </div>
                      <div className="absolute bottom-3 right-3 bg-stone-900/90 text-stone-100 px-2.5 py-1 rounded-md text-xs font-mono tabular-data">
                        Expediente {animalDestacado.codigoIdentificacion}
                      </div>
                    </div>
                  )}

                  {/* Cuerpo del expediente estructurado con divisores limpios de 1px */}
                  <div className="divide-y divide-[#E5DFD7]">
                    {/* Bloque 1: Identidad y Carácter */}
                    <div className="p-5 space-y-2.5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2
                            className="text-2xl font-bold text-stone-900 tracking-tight"
                            style={{ fontFamily: 'var(--font-display)' }}
                          >
                            {animalDestacado.nombre}
                          </h2>
                          <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                            {animalDestacado.idEspecie === 1 ? 'Canino' : 'Felino'} ·{' '}
                            {animalDestacado.razaNombre || 'Mestizo Calchaquí'} ·{' '}
                            {animalDestacado.idSexo === 1 ? 'Macho' : 'Hembra'}
                          </p>
                        </div>
                        <Badge variant={animalDestacado.castrado ? 'info' : 'neutral'}>
                          {animalDestacado.castrado ? 'Esterilizado/a' : 'En pre-quirúrgico'}
                        </Badge>
                      </div>

                      <p className="text-sm text-stone-700 leading-relaxed">
                        {animalDestacado.observaciones}
                      </p>
                    </div>

                    {/* Bloque 2: Acta de Ingreso y Alojamiento (Ingreso_Animal.cs + Alojamiento_Animal.cs) */}
                    <dl className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <dt className="font-semibold text-stone-600 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#B84A27]" />
                          Origen del rescate
                        </dt>
                        <dd className="font-medium text-stone-900">
                          {animalDestacado.ingreso?.lugarOrigen || 'Cafayate · Valles Calchaquíes'}
                        </dd>
                        <dd className="text-stone-600 tabular-data">
                          {animalDestacado.ingreso?.tipoIngreso || 'Rescate comunitario'} ({animalDestacado.fechaIngreso})
                        </dd>
                      </div>

                      <div className="space-y-1">
                        <dt className="font-semibold text-stone-600 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-[#2D6A4F]" />
                          Ubicación en el refugio
                        </dt>
                        <dd className="font-medium text-stone-900">
                          {animalDestacado.alojamiento?.sectorNombre || 'Sector A · Caniles de Sol'}
                        </dd>
                        <dd className="text-stone-600">
                          {animalDestacado.alojamiento?.predioNombre || 'Predio Central Ruta 40'}
                        </dd>
                      </div>
                    </dl>

                    {/* Bloque 3: Plan Nutricional y Certificación Clínica (PlanAlimentacion.cs + Esterilizacion.cs) */}
                    <dl className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#FAF8F5]/60">
                      <div className="space-y-1">
                        <dt className="font-semibold text-stone-600 flex items-center gap-1.5">
                          <Utensils className="w-3.5 h-3.5 text-[#B84A27]" />
                          Plan de alimentación
                        </dt>
                        <dd className="font-medium text-stone-900">
                          {animalDestacado.planAlimentacion?.tipoAlimento || 'Balanceado Adulto'}
                        </dd>
                        <dd className="text-stone-600 tabular-data">
                          {animalDestacado.planAlimentacion
                            ? `${animalDestacado.planAlimentacion.cantidad} g · ${animalDestacado.planAlimentacion.frecuencia}`
                            : '2 raciones diarias controladas'}
                        </dd>
                      </div>

                      <div className="space-y-1">
                        <dt className="font-semibold text-stone-600 flex items-center gap-1.5">
                          <Stethoscope className="w-3.5 h-3.5 text-[#2D6A4F]" />
                          Aval veterinario
                        </dt>
                        <dd className="font-medium text-stone-900">
                          {animalDestacado.esterilizacion
                            ? `${animalDestacado.esterilizacion.tipo}`
                            : 'Control clínico semanal'}
                        </dd>
                        <dd className="text-stone-600 tabular-data">
                          {animalDestacado.esterilizacion
                            ? `${animalDestacado.esterilizacion.veterinarioNombre} (${animalDestacado.esterilizacion.veterinarioMatricula})`
                            : 'Dr. Lucas Tolaba (MP-SAL-0291)'}
                        </dd>
                      </div>
                    </dl>

                    {/* Bloque 4: Acción directa hacia la Mesa de Postulación */}
                    <div className="p-5 bg-white">
                      <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        onClick={() => seleccionarParaAdoptar(animalDestacado)}
                        leftIcon={<HeartHandshake className="w-5 h-5" />}
                      >
                        Postularme para adoptar a {animalDestacado.nombre}
                      </Button>
                    </div>
                  </div>
                </article>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Censo Abierto de Compañeros con Filtros por Especie y Sector */}
      <section
        id="catalogo-adopcion"
        className="py-12 sm:py-16 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 space-y-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-[#E5DFD7] pb-5">
          <div>
            <h2
              className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Censo abierto de compañeros en el Valle
            </h2>
            <p className="text-sm sm:text-base text-stone-600 mt-1 max-w-[65ch]">
              Cada ficha refleja los datos reales de ingreso, sector de alojamiento y estado sanitario. Puedes filtrar por especie o por el sector físico donde se encuentran hoy.
            </p>
          </div>

          {/* Filtros rápidos de especie */}
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
              Todos ({animalesPostulables.length})
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
              Caninos ({animalesPostulables.filter((a) => a.idEspecie === 1).length})
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
              Felinos ({animalesPostulables.filter((a) => a.idEspecie === 2).length})
            </button>
          </div>
        </div>

        {/* Barra combinada de búsqueda por origen/nombre y filtro por Sector */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, código, raza o paraje de rescate..."
              aria-label="Buscar animales en adopción"
              className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-lg border border-[#D6CEC2] bg-white text-sm text-stone-900 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-[#B84A27]"
            />
          </div>

          <div className="md:col-span-6 flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setFiltroSectorId('todos')}
              className={`px-3 min-h-[40px] rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filtroSectorId === 'todos'
                  ? 'bg-[#B84A27] text-white'
                  : 'bg-white text-stone-700 hover:bg-[#F3EFEA] border border-[#D6CEC2]'
              }`}
            >
              Todos los sectores
            </button>
            {sectores.map((sec) => (
              <button
                key={sec.idSector}
                type="button"
                onClick={() => setFiltroSectorId(sec.idSector)}
                className={`px-3 min-h-[40px] rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  filtroSectorId === sec.idSector
                    ? 'bg-[#B84A27] text-white'
                    : 'bg-white text-stone-700 hover:bg-[#F3EFEA] border border-[#D6CEC2]'
                }`}
              >
                {sec.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* Listado de Fichas del Censo (Sin tarjetas anidadas) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {animalesFiltrados.map((animal) => (
            <article
              key={animal.idAnimal}
              className="bg-white rounded-xl border border-[#D6CEC2] overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-12 border-b border-[#E5DFD7]">
                  {animal.fotoUrl && (
                    <div className="sm:col-span-5 relative h-48 sm:h-full min-h-[180px] bg-stone-200">
                      <img
                        src={animal.fotoUrl}
                        alt={animal.nombre}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5">
                        <Badge
                          variant={animal.idEstado === 1 ? 'success' : 'warning'}
                          dot
                        >
                          {animal.idEstado === 1 ? 'Disponible' : 'En observación'}
                        </Badge>
                      </div>
                    </div>
                  )}

                  <div className="sm:col-span-7 p-5 space-y-3 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className="text-xl font-bold text-stone-900"
                          style={{ fontFamily: 'var(--font-display)' }}
                        >
                          {animal.nombre}
                        </h3>
                        <span className="text-xs font-mono text-stone-600 tabular-data">
                          {animal.codigoIdentificacion}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-stone-600">
                        {animal.razaNombre || 'Mestizo'} ·{' '}
                        {animal.idSexo === 1 ? 'Macho' : 'Hembra'} ·{' '}
                        {animal.castrado ? 'Castrado/a' : 'Castración programada'}
                      </p>
                      <p className="text-xs sm:text-sm text-stone-700 leading-relaxed line-clamp-3 pt-1">
                        {animal.observaciones}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#F3EFEA] space-y-1 text-xs text-stone-600">
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-[#B84A27] shrink-0" />
                        <span className="truncate">
                          {animal.ingreso?.lugarOrigen || 'Cafayate'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <Building2 className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" />
                        <span className="truncate">
                          {animal.alojamiento?.sectorNombre || 'Sector A · Caniles de Sol'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3.5 bg-[#FAF8F5] flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => inspeccionarExpediente(animal)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-[#B84A27] py-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Ver expediente clínico</span>
                </button>

                <Button
                  variant={animal.idEstado === 1 ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => seleccionarParaAdoptar(animal)}
                  leftIcon={<HeartHandshake className="w-4 h-4" />}
                >
                  Postularme para adoptar
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 4. Mesa de Postulación Directa (Inline Workbench — Sin Modal, conectada a Persona.cs y Solicitud_Adopcion.cs) */}
      <section
        id="postulacion-directa"
        className="border-t border-[#D6CEC2] bg-[#F3EFEA] py-12 sm:py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Columna Izquierda (5 cols): Compañero elegido y Compromiso de SeguimientoAdopcion */}
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-2">
                <h2
                  className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Solicitud de Adopción Responsable
                </h2>
                <p className="text-sm sm:text-base text-stone-700 leading-relaxed">
                  Al enviar este formulario, tus datos se validan con las reglas de{' '}
                  <code className="font-mono text-xs text-stone-900">PersonaCreateValidator</code> y generan una{' '}
                  <code className="font-mono text-xs text-stone-900">SolicitudAdopcion</code> que el equipo del refugio gestiona desde el panel operativo.
                </p>
              </div>

              {/* Selector rápido del animal dentro del formulario */}
              <div className="space-y-2 pt-2 border-t border-[#D6CEC2]">
                <label
                  htmlFor="selector-animal-postulacion"
                  className="block text-sm font-bold text-stone-900"
                >
                  Compañero por el que te postulas
                </label>
                <select
                  id="selector-animal-postulacion"
                  value={animalPostulacionId}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    setAnimalPostulacionId(id);
                    setAnimalDestacadoId(id);
                    setSolicitudExitosa(null);
                  }}
                  className="w-full min-h-[46px] px-3.5 py-2.5 rounded-lg border border-[#D6CEC2] bg-white text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#B84A27]"
                >
                  {animalesPostulables.map((a) => (
                    <option key={a.idAnimal} value={a.idAnimal}>
                      {a.nombre} ({a.codigoIdentificacion}) — {a.razaNombre || 'Mestizo'} ·{' '}
                      {a.alojamiento?.sectorNombre || 'Predio Central'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Protocolo de SeguimientoAdopcion (Seguimiento_Adopcion.cs) */}
              <div className="border-t border-[#D6CEC2] pt-5 space-y-4">
                <h3 className="text-sm font-bold text-stone-900">
                  Etapas del protocolo de adopción en los Valles
                </h3>

                <ol className="space-y-3 text-xs sm:text-sm text-stone-700">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#B84A27] shrink-0 mt-0.5" />
                    <span>
                      <strong className="font-semibold text-stone-900">Recepción en vivo:</strong>{' '}
                      Tu postulación ingresa con estado <em>Pendiente</em> al tablero de coordinación.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0 mt-0.5" />
                    <span>
                      <strong className="font-semibold text-stone-900">Visita al predio o videollamada:</strong>{' '}
                      Conoces a {animalEnFormulario?.nombre || 'tu futuro compañero'} en su sector actual y conversamos sobre el cerramiento de tu hogar.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#B84A27] shrink-0 mt-0.5" />
                    <span>
                      <strong className="font-semibold text-stone-900">Seguimiento post-adopción:</strong>{' '}
                      Registramos controles a los 15 y 60 días para acompañar su adaptación familiar.
                    </span>
                  </li>
                </ol>
              </div>
            </div>

            {/* Columna Derecha (7 cols): Formulario de Postulación Directa */}
            <div className="lg:col-span-7 bg-white rounded-xl border border-[#D6CEC2] p-6 sm:p-8">
              {solicitudExitosa ? (
                <div className="space-y-5 py-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-7 h-7 text-[#2D6A4F] shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h3
                        className="text-xl font-bold text-stone-900"
                        style={{ fontFamily: 'var(--font-display)' }}
                      >
                        ¡Postulación registrada para adoptar a {solicitudExitosa.animalNombre}!
                      </h3>
                      <p className="text-sm text-stone-700 leading-relaxed">
                        Tu trámite quedó asentado con el código{' '}
                        <strong className="font-mono tabular-data text-stone-900">
                          #SOL-{solicitudExitosa.codigoSeguimiento}
                        </strong>
                        {solicitudExitosa.sincronizadoMySql
                          ? ' y tu ficha de adoptante se guardó directamente en la base MySQL (api/Personas).'
                          : ' en el registro operativo del refugio.'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#E5DFD7] flex flex-wrap items-center justify-between gap-3">
                    <Link
                      to={session ? '/admin/adopciones' : '/login'}
                      className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#B84A27] hover:underline"
                    >
                      <span>Ver esta solicitud en el Panel de Adopciones (/admin/adopciones)</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSolicitudExitosa(null)}
                    >
                      Enviar otra postulación
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleEnviarSolicitudPublica} className="space-y-5">
                  <div className="border-b border-[#E5DFD7] pb-4 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-stone-900">
                        Datos del postulante ({animalEnFormulario?.nombre})
                      </h3>
                      <p className="text-xs text-stone-600">
                        Campos requeridos por el padrón de adoptantes del refugio.
                      </p>
                    </div>
                    {animalEnFormulario && (
                      <span className="text-xs font-mono font-semibold text-stone-700 bg-[#F3EFEA] px-2.5 py-1 rounded-md tabular-data">
                        {animalEnFormulario.codigoIdentificacion}
                      </span>
                    )}
                  </div>

                  {errorPostulacion && (
                    <ErrorAlert
                      title="Verifica los datos ingresados"
                      message={errorPostulacion}
                    />
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Nombre"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ej. Lucía"
                      required
                    />
                    <Input
                      label="Apellido"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      placeholder="Ej. Carrizo"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="DNI (7 a 8 dígitos sin puntos)"
                      value={dni}
                      onChange={(e) => setDni(e.target.value)}
                      placeholder="Ej. 39482110"
                      required
                    />
                    <Input
                      label="Teléfono / WhatsApp"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="Ej. +543868451234"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Correo electrónico (opcional)"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="lucia.carrizo@correo.com"
                    />

                    <div className="space-y-1.5">
                      <label
                        htmlFor="localidad-valle"
                        className="block text-sm font-semibold text-stone-800"
                      >
                        Localidad en los Valles
                      </label>
                      <select
                        id="localidad-valle"
                        value={localidad}
                        onChange={(e) => setLocalidad(e.target.value)}
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
                  </div>

                  <Input
                    label="Dirección o referencia en el valle"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Ej. Calle Nuestra Señora del Rosario 420"
                    required
                  />

                  <div className="space-y-1.5">
                    <label
                      htmlFor="observacion-hogar"
                      className="block text-sm font-semibold text-stone-800"
                    >
                      Características de tu hogar (cerramiento, patio, otros animales)
                    </label>
                    <textarea
                      id="observacion-hogar"
                      rows={3}
                      value={observacion}
                      onChange={(e) => setObservacion(e.target.value)}
                      placeholder="Cuéntanos cómo es el espacio donde vivirá y si ya convives con otras mascotas..."
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#D6CEC2] bg-white text-sm text-stone-900 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-[#B84A27]"
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      fullWidth
                      isLoading={enviandoSolicitud}
                      leftIcon={<HeartHandshake className="w-5 h-5" />}
                    >
                      Registrar solicitud para adoptar a {animalEnFormulario?.nombre}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Infraestructura del Refugio y Equipo Veterinario Matriculado (Predio.cs + Veterinario.cs) */}
      <section
        id="infraestructura-valles"
        className="border-t border-[#E5DFD7] bg-[#FAF8F5] py-12 sm:py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="max-w-2xl">
            <h2
              className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Guardia veterinaria y predios en los Valles Calchaquíes
            </h2>
            <p className="text-sm sm:text-base text-stone-600 mt-1.5">
              Toda esterilización, vacunación e internación es firmada por profesionales matriculados y asentada en el historial clínico del refugio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#D6CEC2] border-y border-[#D6CEC2]">
            {veterinarios.map((vet) => (
              <div key={vet.idVeterinario} className="py-6 md:px-6 first:md:pl-0 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-stone-900">
                    Dr/a. {vet.nombre} {vet.apellido}
                  </h3>
                  <span className="text-xs font-mono font-semibold text-[#2D6A4F] tabular-data">
                    {vet.matricula}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                  Responsable de cirugía de esterilización, plan de inmunización y alta clínica en el Predio Central de Cafayate.
                </p>
                <p className="text-xs font-mono text-stone-600 tabular-data pt-1">
                  Guardia: {vet.telefono}
                </p>
              </div>
            ))}

            <div className="py-6 md:pl-6 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-bold text-stone-900">
                  Visitas y Recepción en Ruta 40
                </h3>
                <Calendar className="w-4 h-4 text-[#B84A27]" />
              </div>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                Predio Central Km 4340 (Cafayate) y Posta Sanitaria San Carlos. Abierto de lunes a sábado de 09:30 a 18:00 hs.
              </p>
              <p className="text-xs font-semibold text-[#B84A27] pt-1">
                Emergencias viales las 24 hs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Pie de Página */}
      <footer className="border-t border-[#E5DFD7] bg-[#F3EFEA] py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-bold text-stone-900">
              Patitas Calchaquíes · Sistema Integral de Refugio y Adopción
            </p>
            <p className="text-xs text-stone-600 flex flex-wrap items-center gap-3 tabular-data">
              <span className="inline-flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#B84A27]" />
                +54 3868 42-1900
              </span>
              <span>·</span>
              <span>Taller de Desarrollo de Software (Arquitectura 3 Capas C# + React TS)</span>
            </p>
          </div>

          <Link
            to={session ? '/admin' : '/login'}
            className="inline-flex items-center gap-2 px-4 min-h-[42px] rounded-lg text-xs sm:text-sm font-semibold text-stone-900 bg-white hover:bg-[#FAF8F5] border border-[#D6CEC2] transition-colors"
          >
            <KeyRound className="w-4 h-4 text-[#B84A27]" />
            <span>{session ? 'Abrir Dashboard Operativo (/admin)' : 'Acceso Personal / Veterinaria'}</span>
          </Link>
        </div>
      </footer>
    </div>
  );
};
