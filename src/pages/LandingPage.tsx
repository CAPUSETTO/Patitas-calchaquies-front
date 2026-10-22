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
  FolderOpen,
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

  // Estado de la Planilla de Postulación Directa (Persona.cs + Solicitud_Adopcion.cs)
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

  const animalDestacado =
    animalesFiltrados.find((a) => a.idAnimal === animalDestacadoId) ||
    animalesPostulables.find((a) => a.idAnimal === animalDestacadoId) ||
    animalesFiltrados[0] ||
    animalesPostulables[0] ||
    null;

  const animalEnFormulario =
    animalesPostulables.find((a) => a.idAnimal === animalPostulacionId) ||
    animalDestacado ||
    null;

  const capacidadTotalPlazas = sectores.reduce((acc, s) => acc + s.capacidad, 0);
  const listosAdopcionCount = animalesPostulables.filter((a) => a.idEstado === 1).length;
  const esterilizadosCount = animales.filter((a) => a.castrado).length;

  const formatearContador = (n: number) => String(n).padStart(2, '0');

  const handleSeleccionarSectorTab = (idSector: number | 'todos') => {
    setFiltroSectorId(idSector);
    const candidatos = animalesPostulables.filter((a) =>
      idSector === 'todos' ? true : a.alojamiento?.idSector === idSector
    );
    if (candidatos.length > 0) {
      setAnimalDestacadoId(candidatos[0].idAnimal);
    }
  };

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
      setErrorPostulacion(
        'El DNI debe contener entre 7 y 8 dígitos numéricos sin puntos (regla de PersonaCreateValidator.cs).'
      );
      return;
    }
    if (!/^\+?\d{6,15}$/.test(cleanTelefono.replace(/\s+/g, ''))) {
      setErrorPostulacion('Ingresa un teléfono válido de solo dígitos (opcional prefijo +).');
      return;
    }
    if (!cleanDireccion) {
      setErrorPostulacion(
        'Indica tu domicilio o referencia en el valle para la visita de seguimiento.'
      );
      return;
    }

    setEnviandoSolicitud(true);
    setErrorPostulacion(null);

    try {
      let idPersonaRegistrada = Date.now() % 10000;
      let sincronizadoMySql = false;
      const direccionCompleta = `${cleanDireccion} (${localidad})`;

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
        // Continúa el registro en adopcionService aunque la API MySQL no esté activa
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
    <div className="min-h-screen bg-field-grid text-[#1C1917] flex flex-col">
      {/* 1. Chasis Superior Pizarra (#1C1917) con Identidad y Navegación Operativa */}
      <header className="sticky top-0 z-30 bg-[#1C1917] text-[#FAF8F5] border-b-2 border-[#1C1917]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-sm bg-[#B84A27] text-white border border-[#FAF8F5]/30 flex items-center justify-center shrink-0">
              <PawPrint className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <span
                className="font-extrabold text-base sm:text-lg text-[#FAF8F5] block leading-none truncate"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                PATITAS CALCHAQUÍES
              </span>
              <span className="text-xs text-stone-300 font-mono block leading-tight truncate mt-1 tabular-data">
                RN 40 KM 4340 · CAFAYATE / SAN CARLOS
              </span>
            </div>
          </div>

          <nav
            aria-label="Secciones del fichero"
            className="hidden lg:flex items-center gap-6 text-sm font-bold text-stone-200"
          >
            <a href="#fichero-censo" className="hover:text-[#F59E0B] tab-snap">
              1. Fichero de Censo
            </a>
            <a href="#postulacion-directa" className="hover:text-[#F59E0B] tab-snap">
              2. Planilla de Adopción
            </a>
            <a href="#infraestructura-valles" className="hover:text-[#F59E0B] tab-snap">
              3. Guardia y Sectores
            </a>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            {session ? (
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 px-3.5 min-h-[40px] rounded-sm text-xs sm:text-sm font-bold text-[#1C1917] bg-[#F59E0B] hover:bg-amber-400 border border-[#FAF8F5] tab-snap"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>PANEL ({session.usuario.user})</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-3.5 min-h-[40px] rounded-sm text-xs sm:text-sm font-bold text-[#FAF8F5] bg-[#292524] hover:bg-[#B84A27] border border-stone-600 tab-snap"
              >
                <KeyRound className="w-4 h-4 text-[#F59E0B]" />
                <span>ACCESO PERSONAL</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* 2. Primer Viewport: Bloque de Chasis con Contadores + Fichero Clínico de Pestañas Escalonadas */}
      <main id="fichero-censo" className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
        {/* Bloque de Apertura y Banco de Contadores sobre Chasis Pizarra */}
        <section className="border-2 border-[#1C1917] bg-white overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y-2 lg:divide-y-0 lg:divide-x-2 divide-[#1C1917]">
            {/* Tesis operativa de alta legibilidad (7 cols) */}
            <div className="lg:col-span-7 p-5 sm:p-7 space-y-3 bg-[#FAF8F5]">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1C1917] leading-[1.12]">
                Registro Público de Rescate, Sanidad y Adopción en los Valles Calchaquíes
              </h1>
              <p className="text-base text-stone-800 leading-relaxed max-w-[66ch]">
                Cada animal ingresado desde la Ruta Nacional 40 o parajes rurales cuenta con expediente clínico auditable, sector asignado, ración medida en gramos y certificación veterinaria. Selecciona una pestaña de sector o toca una ficha para inspeccionar su hoja clínica e iniciar la adopción.
              </p>
            </div>

            {/* Banco de Contadores de Guardia (5 cols — Chasis Pizarra #1C1917) */}
            <div className="lg:col-span-5 bg-[#1C1917] text-[#FAF8F5] p-5 sm:p-6 flex flex-col justify-between gap-4">
              <div className="flex items-center justify-between border-b border-stone-700 pb-2.5">
                <h2 className="text-xs font-bold tracking-wider text-stone-300">
                  ESTADO DEL CENSO EN TIEMPO REAL
                </h2>
                <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 tabular-data">
                  <span className="w-2 h-2 bg-emerald-400 inline-block" />
                  GUARDIA ACTIVA
                </span>
              </div>

              <dl className="grid grid-cols-3 gap-3">
                <div className="counter-tube p-3 rounded-sm">
                  <dt className="text-[11px] font-bold text-stone-300">LISTOS HOGAR</dt>
                  <dd className="text-2xl sm:text-3xl font-bold text-[#34D399] mt-1 tabular-data">
                    {isLoading ? '--' : formatearContador(listosAdopcionCount)}
                  </dd>
                </div>

                <div className="counter-tube p-3 rounded-sm">
                  <dt className="text-[11px] font-bold text-stone-300">CASTRADOS</dt>
                  <dd className="text-2xl sm:text-3xl font-bold text-[#F59E0B] mt-1 tabular-data">
                    {isLoading ? '--' : formatearContador(esterilizadosCount)}
                  </dd>
                </div>

                <div className="counter-tube p-3 rounded-sm">
                  <dt className="text-[11px] font-bold text-stone-300">PLAZAS VALLE</dt>
                  <dd className="text-2xl sm:text-3xl font-bold text-[#FAF8F5] mt-1 tabular-data">
                    {isLoading
                      ? '--'
                      : `${formatearContador(animalesPostulables.length)}/${capacidadTotalPlazas}`}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* 3. Carpeta Maestra con Riel de Pestañas Escalonadas por Sector (Stepped Tab Board) */}
        <section aria-label="Fichero clínico por sector">
          {/* Riel de Pestañas Escalonadas en el borde superior */}
          <div
            role="tablist"
            aria-label="Filtrar fichero por sector del refugio"
            className="flex items-end gap-1.5 overflow-x-auto pb-0 pr-2"
          >
            <button
              type="button"
              role="tab"
              aria-selected={filtroSectorId === 'todos'}
              onClick={() => handleSeleccionarSectorTab('todos')}
              className={`px-4 py-2.5 border-t-2 border-x-2 border-[#1C1917] font-bold text-xs sm:text-sm whitespace-nowrap tab-snap cursor-pointer flex items-center gap-2 ${
                filtroSectorId === 'todos'
                  ? 'bg-[#B84A27] text-white min-h-[48px]'
                  : 'bg-[#F3EFEA] text-[#1C1917] hover:bg-[#E5DFD7] min-h-[42px]'
              }`}
            >
              <FolderOpen className="w-4 h-4 shrink-0" />
              <span>TODOS LOS SECTORES</span>
              <span
                className={`px-1.5 py-0.5 text-xs font-mono tabular-data ${
                  filtroSectorId === 'todos'
                    ? 'bg-[#1C1917] text-white'
                    : 'bg-white text-[#1C1917] border border-[#1C1917]'
                }`}
              >
                {formatearContador(animalesPostulables.length)}
              </span>
            </button>

            {sectores.map((sec, idx) => {
              const count = animalesPostulables.filter(
                (a) => a.alojamiento?.idSector === sec.idSector
              ).length;
              const activo = filtroSectorId === sec.idSector;
              return (
                <button
                  key={sec.idSector}
                  type="button"
                  role="tab"
                  aria-selected={activo}
                  onClick={() => handleSeleccionarSectorTab(sec.idSector)}
                  className={`px-3.5 py-2.5 border-t-2 border-x-2 border-[#1C1917] font-bold text-xs sm:text-sm whitespace-nowrap tab-snap cursor-pointer flex items-center gap-2 ${
                    activo
                      ? 'bg-[#B84A27] text-white min-h-[48px]'
                      : 'bg-[#F3EFEA] text-[#1C1917] hover:bg-[#E5DFD7] min-h-[42px]'
                  }`}
                >
                  <span className="font-mono text-xs opacity-80">0{idx + 1}</span>
                  <span>{sec.nombre}</span>
                  <span
                    className={`px-1.5 py-0.5 text-xs font-mono tabular-data ${
                      activo
                        ? 'bg-[#1C1917] text-white'
                        : 'bg-white text-[#1C1917] border border-[#1C1917]'
                    }`}
                  >
                    {count}/{sec.capacidad}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Cuerpo de la Carpeta Abierta (Grilla Continua de 12 Columnas sin Tarjetas Anidadas) */}
          <div className="border-2 border-[#1C1917] bg-white grid grid-cols-1 lg:grid-cols-12 divide-y-2 lg:divide-y-0 lg:divide-x-2 divide-[#1C1917]">
            {/* Columna Izquierda (5 cols): Buscador + Índice de Fichas con Perforación de Selección */}
            <div className="lg:col-span-5 flex flex-col justify-between bg-[#FAF8F5]">
              <div>
                {/* Barra de herramientas del índice */}
                <div className="p-4 border-b-2 border-[#1C1917] bg-[#F3EFEA] space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm font-extrabold text-[#1C1917]">
                      ÍNDICE DE EXPEDIENTES ({animalesFiltrados.length})
                    </h2>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setFiltroEspecie('todos')}
                        className={`px-2.5 py-1 text-xs font-bold border border-[#1C1917] tab-snap cursor-pointer ${
                          filtroEspecie === 'todos'
                            ? 'bg-[#1C1917] text-white'
                            : 'bg-white text-[#1C1917] hover:bg-[#E5DFD7]'
                        }`}
                      >
                        Todos
                      </button>
                      <button
                        type="button"
                        onClick={() => setFiltroEspecie(1)}
                        className={`px-2.5 py-1 text-xs font-bold border border-[#1C1917] tab-snap cursor-pointer ${
                          filtroEspecie === 1
                            ? 'bg-[#1C1917] text-white'
                            : 'bg-white text-[#1C1917] hover:bg-[#E5DFD7]'
                        }`}
                      >
                        Perros
                      </button>
                      <button
                        type="button"
                        onClick={() => setFiltroEspecie(2)}
                        className={`px-2.5 py-1 text-xs font-bold border border-[#1C1917] tab-snap cursor-pointer ${
                          filtroEspecie === 2
                            ? 'bg-[#1C1917] text-white'
                            : 'bg-white text-[#1C1917] hover:bg-[#E5DFD7]'
                        }`}
                      >
                        Gatos
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <Search className="w-4 h-4 text-stone-700 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="search"
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      placeholder="Filtrar por código CAN-2026, nombre o paraje..."
                      aria-label="Filtrar expedientes"
                      className="w-full min-h-[42px] pl-9 pr-3 py-2 bg-white border-2 border-[#1C1917] text-sm text-[#1C1917] placeholder:text-stone-500 focus:outline-hidden focus:border-[#B84A27]"
                    />
                  </div>
                </div>

                {/* Lista de filas perforadas */}
                {isLoading ? (
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : animalesFiltrados.length === 0 ? (
                  <div className="p-6 text-sm text-stone-700">
                    No hay expedientes que coincidan con el filtro actual en este sector.
                  </div>
                ) : (
                  <div className="divide-y-2 divide-[#1C1917]">
                    {animalesFiltrados.map((animal) => {
                      const seleccionado = animalDestacado?.idAnimal === animal.idAnimal;
                      return (
                        <button
                          key={animal.idAnimal}
                          type="button"
                          onClick={() => setAnimalDestacadoId(animal.idAnimal)}
                          className={`w-full p-4 text-left tab-snap flex items-start justify-between gap-3 cursor-pointer ${
                            seleccionado
                              ? 'bg-[#1C1917] text-[#FAF8F5]'
                              : 'bg-white text-[#1C1917] hover:bg-[#F3EFEA]'
                          }`}
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            {/* Perforación física de estado (Punched Hole de rw-manual-acetate-tab-board) */}
                            <span
                              aria-hidden="true"
                              className={`w-4 h-4 rounded-full border-2 mt-1 shrink-0 ${
                                seleccionado
                                  ? 'bg-[#B84A27] border-[#FAF8F5]'
                                  : 'bg-[#FAF8F5] border-[#1C1917]'
                              }`}
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span
                                  className="font-extrabold text-base truncate"
                                  style={{ fontFamily: 'var(--font-display)' }}
                                >
                                  {animal.nombre}
                                </span>
                                <span
                                  className={`text-xs font-mono tabular-data px-1.5 py-0.5 border ${
                                    seleccionado
                                      ? 'bg-[#292524] text-[#F59E0B] border-stone-600'
                                      : 'bg-[#F3EFEA] text-stone-800 border-[#1C1917]'
                                  }`}
                                >
                                  {animal.codigoIdentificacion}
                                </span>
                              </div>
                              <p
                                className={`text-xs mt-1 truncate ${
                                  seleccionado ? 'text-stone-300' : 'text-stone-700'
                                }`}
                              >
                                {animal.razaNombre || 'Mestizo'} ·{' '}
                                {animal.ingreso?.lugarOrigen || 'Cafayate'}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`text-xs font-mono font-bold px-2 py-0.5 border shrink-0 tabular-data ${
                              animal.idEstado === 1
                                ? seleccionado
                                  ? 'bg-[#14532D] text-[#DCFCE7] border-[#34D399]'
                                  : 'bg-[#DCFCE7] text-[#14532D] border-[#14532D]'
                                : 'bg-[#FEF3C7] text-[#78350F] border-[#78350F]'
                            }`}
                          >
                            {animal.idEstado === 1 ? 'APTO' : 'GUARDIA'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Pie del índice con resumen del sector activo */}
              <div className="p-4 border-t-2 border-[#1C1917] bg-[#F3EFEA] text-xs text-stone-800 flex items-center justify-between gap-2">
                <span className="font-bold">
                  {filtroSectorId === 'todos'
                    ? 'Mostrando los 4 sectores del Valle'
                    : sectores.find((s) => s.idSector === filtroSectorId)?.predioNombre}
                </span>
                <span className="font-mono tabular-data">
                  {animalesFiltrados.length} fichas visibles
                </span>
              </div>
            </div>

            {/* Columna Derecha (7 cols): Hoja Clínica Perforada del Animal Seleccionado */}
            <div className="lg:col-span-7 bg-white flex flex-col justify-between">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-8 w-1/2" />
                  <Skeleton className="h-28 w-full" />
                </div>
              ) : animalDestacado ? (
                <article key={animalDestacado.idAnimal} className="divide-y-2 divide-[#1C1917]">
                  {/* Cabecera perforada de la hoja clínica */}
                  <div className="px-5 py-3.5 bg-[#F3EFEA] flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="w-3.5 h-3.5 rounded-full bg-[#FAF8F5] border-2 border-[#1C1917] inline-block"
                      />
                      <span
                        aria-hidden="true"
                        className="w-3.5 h-3.5 rounded-full bg-[#FAF8F5] border-2 border-[#1C1917] inline-block"
                      />
                      <span className="font-mono text-xs sm:text-sm font-bold text-[#1C1917] tabular-data">
                        EXPEDIENTE OFICIAL #{animalDestacado.codigoIdentificacion}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={animalDestacado.idEstado === 1 ? 'success' : 'warning'} dot>
                        {animalDestacado.estadoNombre || 'Disponible para Adopción'}
                      </Badge>
                      <Badge variant={animalDestacado.castrado ? 'info' : 'neutral'}>
                        {animalDestacado.castrado ? 'ESTERILIZADO/A' : 'PRE-QUIRÚRGICO'}
                      </Badge>
                    </div>
                  </div>

                  {/* Bloque principal: Fotografía enmarcada + Datos filiatorios e historia */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 divide-y-2 sm:divide-y-0 sm:divide-x-2 divide-[#1C1917]">
                    {animalDestacado.fotoUrl && (
                      <div className="sm:col-span-5 bg-stone-200 min-h-[220px] max-h-[280px] sm:max-h-none overflow-hidden">
                        <img
                          src={animalDestacado.fotoUrl}
                          alt={`Fotografía clínica de ${animalDestacado.nombre}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="sm:col-span-7 p-5 sm:p-6 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-baseline justify-between gap-2">
                          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1C1917]">
                            {animalDestacado.nombre}
                          </h2>
                          <span className="text-xs font-mono font-bold text-stone-700 tabular-data">
                            INGRESO: {animalDestacado.fechaIngreso}
                          </span>
                        </div>

                        <p className="text-sm font-bold text-[#B84A27]">
                          {animalDestacado.idEspecie === 1 ? 'Especie Canina' : 'Especie Felina'} ·{' '}
                          {animalDestacado.razaNombre || 'Mestizo Calchaquí'} ·{' '}
                          {animalDestacado.idSexo === 1 ? 'Macho' : 'Hembra'}
                        </p>

                        <p className="text-base text-[#1C1917] leading-relaxed pt-1">
                          {animalDestacado.observaciones}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-stone-300 flex items-center justify-between text-xs font-mono text-stone-700 tabular-data">
                        <span>ID SISTEMA: #{animalDestacado.idAnimal}</span>
                        <span className="text-[#14532D] font-bold">
                          LIBRETA SANITARIA AL DÍA
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Cuadrícula Técnica de 4 Celdas (IngresoAnimal + AlojamientoAnimal + PlanAlimentacion + Esterilizacion) */}
                  <dl className="grid grid-cols-1 sm:grid-cols-2 divide-y-2 sm:divide-y-0 sm:divide-x-2 divide-[#1C1917] bg-[#FAF8F5]">
                    <div className="p-4 sm:p-5 space-y-1">
                      <dt className="text-xs font-extrabold text-stone-700 flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-[#B84A27]" />
                        ACTA DE INGRESO (Ingreso_Animal.cs)
                      </dt>
                      <dd className="text-sm font-bold text-[#1C1917] pt-0.5">
                        {animalDestacado.ingreso?.lugarOrigen || 'Ruta Nacional 40 · Cafayate'}
                      </dd>
                      <dd className="text-xs text-stone-700">
                        Modalidad: {animalDestacado.ingreso?.tipoIngreso || 'Rescate en Ruta'} —{' '}
                        {animalDestacado.ingreso?.motivo || 'Asistencia comunitaria'}
                      </dd>
                    </div>

                    <div className="p-4 sm:p-5 space-y-1">
                      <dt className="text-xs font-extrabold text-stone-700 flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-[#2D6A4F]" />
                        SECTOR ASIGNADO (Alojamiento_Animal.cs)
                      </dt>
                      <dd className="text-sm font-bold text-[#1C1917] pt-0.5">
                        {animalDestacado.alojamiento?.sectorNombre || 'Sector A · Caniles de Sol'}
                      </dd>
                      <dd className="text-xs text-stone-700">
                        {animalDestacado.alojamiento?.predioNombre || 'Predio Central Ruta 40'}
                      </dd>
                    </div>
                  </dl>

                  <dl className="grid grid-cols-1 sm:grid-cols-2 divide-y-2 sm:divide-y-0 sm:divide-x-2 divide-[#1C1917] bg-white">
                    <div className="p-4 sm:p-5 space-y-1">
                      <dt className="text-xs font-extrabold text-stone-700 flex items-center gap-1.5">
                        <Utensils className="w-4 h-4 text-[#B84A27]" />
                        RACIÓN DIARIA (PlanAlimentacion.cs)
                      </dt>
                      <dd className="text-sm font-bold text-[#1C1917] pt-0.5">
                        {animalDestacado.planAlimentacion?.tipoAlimento || 'Balanceado Adulto'}
                      </dd>
                      <dd className="text-xs font-mono text-stone-700 tabular-data">
                        {animalDestacado.planAlimentacion
                          ? `${animalDestacado.planAlimentacion.cantidad} g/día · ${animalDestacado.planAlimentacion.frecuencia}`
                          : '340 g/día · 2 tomas controladas'}
                      </dd>
                    </div>

                    <div className="p-4 sm:p-5 space-y-1">
                      <dt className="text-xs font-extrabold text-stone-700 flex items-center gap-1.5">
                        <Stethoscope className="w-4 h-4 text-[#2D6A4F]" />
                        FIRMA VETERINARIA (Esterilizacion.cs)
                      </dt>
                      <dd className="text-sm font-bold text-[#1C1917] pt-0.5">
                        {animalDestacado.esterilizacion
                          ? animalDestacado.esterilizacion.tipo
                          : 'Rehabilitación clínica supervisada'}
                      </dd>
                      <dd className="text-xs font-mono text-stone-700 tabular-data">
                        {animalDestacado.esterilizacion
                          ? `${animalDestacado.esterilizacion.veterinarioNombre} (${animalDestacado.esterilizacion.veterinarioMatricula})`
                          : 'Dr. Lucas Tolaba (MP-SAL-0291)'}
                      </dd>
                    </div>
                  </dl>

                  {/* Talón de Acción Inmediata de Adopción */}
                  <div className="p-5 bg-[#F3EFEA] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-[#1C1917]">
                        ¿Deseas postularte para adoptar a {animalDestacado.nombre}?
                      </p>
                      <p className="text-xs text-stone-700">
                        Se abrirá la planilla oficial vinculada al expediente{' '}
                        <span className="font-mono font-bold tabular-data">
                          {animalDestacado.codigoIdentificacion}
                        </span>
                        .
                      </p>
                    </div>

                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => seleccionarParaAdoptar(animalDestacado)}
                      leftIcon={<HeartHandshake className="w-5 h-5" />}
                    >
                      Iniciar trámite para {animalDestacado.nombre}
                    </Button>
                  </div>
                </article>
              ) : null}
            </div>
          </div>
        </section>

        {/* 4. Planilla Oficial de Solicitud de Adopción (Espejo de Persona.cs + Solicitud_Adopcion.cs) */}
        <section
          id="postulacion-directa"
          className="border-2 border-[#1C1917] bg-white overflow-hidden"
        >
          {/* Barra superior de chasis para la planilla */}
          <div className="bg-[#1C1917] text-[#FAF8F5] px-5 py-4 flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#1C1917]">
            <div className="flex items-center gap-3">
              <span className="px-2 py-0.5 bg-[#B84A27] text-white font-mono text-xs font-bold">
                FORMULARIO #02
              </span>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#FAF8F5]">
                PLANILLA PÚBLICA DE SOLICITUD DE ADOPCIÓN RESPONSABLE
              </h2>
            </div>
            <span className="text-xs font-mono text-stone-300 tabular-data">
              DESTINO: /admin/adopciones · API C#
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y-2 lg:divide-y-0 lg:divide-x-2 divide-[#1C1917]">
            {/* Columna Izquierda (5 cols): Selección de Expediente y Protocolo de Seguimiento */}
            <div className="lg:col-span-5 p-5 sm:p-7 bg-[#FAF8F5] space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="selector-animal-postulacion"
                  className="block text-sm font-extrabold text-[#1C1917]"
                >
                  1. EXPEDIENTE SELECCIONADO PARA ADOPCIÓN
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
                  className="w-full min-h-[46px] px-3.5 py-2.5 rounded-md border-2 border-[#1C1917] bg-white text-base font-bold text-[#1C1917] focus:outline-hidden focus:ring-2 focus:ring-[#B84A27]"
                >
                  {animalesPostulables.map((a) => (
                    <option key={a.idAnimal} value={a.idAnimal}>
                      [{a.codigoIdentificacion}] {a.nombre} — {a.razaNombre || 'Mestizo'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-t-2 border-[#1C1917] pt-5 space-y-3">
                <h3 className="text-sm font-extrabold text-[#1C1917]">
                  2. COMPROMISO DE SEGUIMIENTO (Seguimiento_Adopcion.cs)
                </h3>
                <ol className="space-y-3 text-sm text-stone-800">
                  <li className="flex items-start gap-2.5">
                    <span className="font-mono font-bold text-xs bg-[#1C1917] text-white px-1.5 py-0.5 shrink-0 mt-0.5">
                      01
                    </span>
                    <span>
                      <strong>Registro inmediato:</strong> Tu solicitud impacta con estado{' '}
                      <em>Pendiente</em> en la bandeja de coordinación del refugio.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="font-mono font-bold text-xs bg-[#1C1917] text-white px-1.5 py-0.5 shrink-0 mt-0.5">
                      02
                    </span>
                    <span>
                      <strong>Verificación de cerramiento:</strong> Coordinamos visita en tu domicilio del valle o entrevista en el Predio Ruta 40.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="font-mono font-bold text-xs bg-[#1C1917] text-white px-1.5 py-0.5 shrink-0 mt-0.5">
                      03
                    </span>
                    <span>
                      <strong>Controles a los 15 y 60 días:</strong> Asentamos dos visitas de seguimiento sanitario tras la entrega formal.
                    </span>
                  </li>
                </ol>
              </div>
            </div>

            {/* Columna Derecha (7 cols): Campos del Adoptante (Persona.cs) */}
            <div className="lg:col-span-7 p-5 sm:p-7 bg-white">
              {solicitudExitosa ? (
                <div className="space-y-5 py-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-7 h-7 text-[#15803D] shrink-0 mt-0.5" />
                    <div className="space-y-1.5">
                      <h3 className="text-xl font-extrabold text-[#1C1917]">
                        SOLICITUD REGISTRADA · EXPEDIENTE {solicitudExitosa.animalNombre.toUpperCase()}
                      </h3>
                      <p className="text-base text-stone-800 leading-relaxed">
                        El trámite quedó asentado bajo el código{' '}
                        <strong className="font-mono tabular-data bg-[#F3EFEA] px-2 py-0.5 border border-[#1C1917]">
                          #SOL-{solicitudExitosa.codigoSeguimiento}
                        </strong>
                        {solicitudExitosa.sincronizadoMySql
                          ? ' y tus datos de adoptante se guardaron en la tabla Personas de MySQL (api/Personas).'
                          : ' en el registro operativo del refugio.'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t-2 border-[#1C1917] flex flex-wrap items-center justify-between gap-3">
                    <Link
                      to={session ? '/admin/adopciones' : '/login'}
                      className="inline-flex items-center gap-2 text-sm font-bold text-[#B84A27] hover:underline"
                    >
                      <span>Abrir esta solicitud en el Panel Operativo (/admin/adopciones)</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSolicitudExitosa(null)}
                    >
                      Cargar nueva solicitud
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleEnviarSolicitudPublica} className="space-y-5">
                  {errorPostulacion && (
                    <ErrorAlert
                      title="Revisa los campos de la planilla"
                      message={errorPostulacion}
                    />
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Nombre del adoptante"
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
                        className="block text-sm font-bold text-[#1C1917]"
                      >
                        Localidad en los Valles
                      </label>
                      <select
                        id="localidad-valle"
                        value={localidad}
                        onChange={(e) => setLocalidad(e.target.value)}
                        className="w-full min-h-[44px] px-3.5 py-2 rounded-md border-2 border-[#1C1917] bg-white text-base text-[#1C1917] focus:outline-hidden focus:ring-2 focus:ring-[#B84A27]"
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
                    label="Dirección exacta o referencia rural"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Ej. Calle Nuestra Señora del Rosario 420"
                    required
                  />

                  <div className="space-y-1.5">
                    <label
                      htmlFor="observacion-hogar"
                      className="block text-sm font-bold text-[#1C1917]"
                    >
                      Descripción del cerramiento, patio y convivencia con otros animales
                    </label>
                    <textarea
                      id="observacion-hogar"
                      rows={3}
                      value={observacion}
                      onChange={(e) => setObservacion(e.target.value)}
                      placeholder="Indica si cuentas con tapia/alambrado perimetral y si convives con otros perros o gatos..."
                      className="w-full px-3.5 py-2.5 rounded-md border-2 border-[#1C1917] bg-white text-base text-[#1C1917] placeholder:text-stone-500 focus:outline-hidden focus:ring-2 focus:ring-[#B84A27]"
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
                      ASENTAR SOLICITUD PARA ADOPTAR A {animalEnFormulario?.nombre.toUpperCase()}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>

        {/* 5. Tablero Técnico de Guardia Veterinaria y Predios (Veterinario.cs + Predio.cs) */}
        <section
          id="infraestructura-valles"
          className="border-2 border-[#1C1917] bg-white overflow-hidden"
        >
          <div className="bg-[#F3EFEA] px-5 py-3.5 border-b-2 border-[#1C1917] flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base sm:text-lg font-extrabold text-[#1C1917]">
              CUERPO VETERINARIO MATRICULADO Y POSTAS OPERATIVAS
            </h2>
            <span className="text-xs font-mono font-bold text-stone-700 tabular-data">
              GUARDIA RUTA 40 · LUNES A SÁBADO 09:30 A 18:00 HS
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y-2 md:divide-y-0 md:divide-x-2 divide-[#1C1917]">
            {veterinarios.map((vet) => (
              <div key={vet.idVeterinario} className="p-5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-extrabold text-[#1C1917]">
                    Dr/a. {vet.nombre} {vet.apellido}
                  </h3>
                  <span className="px-2 py-0.5 bg-[#DCFCE7] text-[#14532D] border border-[#14532D] text-xs font-mono font-bold tabular-data">
                    {vet.matricula}
                  </span>
                </div>
                <p className="text-sm text-stone-800 leading-relaxed">
                  Dirección de quirófano, esterilizaciones y control de inmunización en el Predio Central de Cafayate.
                </p>
                <p className="text-xs font-mono font-bold text-stone-700 tabular-data pt-1">
                  TEL GUARDIA: {vet.telefono}
                </p>
              </div>
            ))}

            <div className="p-5 space-y-2 bg-[#FAF8F5]">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-extrabold text-[#1C1917]">
                  Predio Central y Posta San Carlos
                </h3>
                <Calendar className="w-4 h-4 text-[#B84A27]" />
              </div>
              <p className="text-sm text-stone-800 leading-relaxed">
                Recepción de rescates viales sobre Ruta Nacional 40 Km 4340 (Cafayate) y Anexo Comunitario San Carlos.
              </p>
              <p className="text-xs font-mono font-bold text-[#B84A27] pt-1">
                EMERGENCIAS VIALES 24 HS
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* 6. Pie de Página Chasis Pizarra */}
      <footer className="border-t-2 border-[#1C1917] bg-[#1C1917] text-[#FAF8F5] py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-extrabold text-[#FAF8F5]">
              PATITAS CALCHAQUÍES · SISTEMA INTEGRAL DE CENSO Y ADOPCIÓN
            </p>
            <p className="text-xs text-stone-300 font-mono flex flex-wrap items-center gap-3 tabular-data">
              <span className="inline-flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#F59E0B]" />
                +54 3868 42-1900
              </span>
              <span>·</span>
              <span>TALLER DE DESARROLLO DE SOFTWARE (ARQUITECTURA 3 CAPAS C# + REACT TS)</span>
            </p>
          </div>

          <Link
            to={session ? '/admin' : '/login'}
            className="inline-flex items-center gap-2 px-4 min-h-[42px] rounded-sm text-xs sm:text-sm font-bold text-[#1C1917] bg-[#FAF8F5] hover:bg-[#F59E0B] border border-[#FAF8F5] tab-snap"
          >
            <KeyRound className="w-4 h-4 text-[#B84A27]" />
            <span>
              {session ? 'ABRIR DASHBOARD OPERATIVO (/admin)' : 'INGRESO PERSONAL / VETERINARIA'}
            </span>
          </Link>
        </div>
      </footer>
    </div>
  );
};
