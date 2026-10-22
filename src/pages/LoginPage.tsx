import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  PawPrint,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  Stethoscope,
  HeartHandshake,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button, Input, Badge, ErrorAlert } from '../components/ui';
import { authService } from '../services/authService';
import type { DemoAccount } from '../types/auth.types';

interface LocationState {
  from?: string;
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const destino = state?.from && state.from.startsWith('/admin') ? state.from : '/admin';

  const demoAccounts = authService.getDemoAccounts();

  const [user, setUser] = useState<string>('admin.valles');
  const [password, setPassword] = useState<string>('calchaqui2026');
  const [mostrarPassword, setMostrarPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      await authService.login({ user, password });
      navigate(destino, { replace: true });
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'No se pudo iniciar sesión en el refugio.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIngresoRapido = async (cuenta: DemoAccount) => {
    setUser(cuenta.user);
    setPassword(cuenta.password);
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      await authService.login({ user: cuenta.user, password: cuenta.password });
      navigate(destino, { replace: true });
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Error al iniciar sesión con perfil de prueba.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const obtenerIconoRol = (idRol: number) => {
    if (idRol === 1) return <ShieldCheck className="w-5 h-5 text-[#B84A27]" />;
    if (idRol === 2) return <Stethoscope className="w-5 h-5 text-[#2D6A4F]" />;
    return <HeartHandshake className="w-5 h-5 text-amber-800" />;
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] bg-field-grid text-[#1C1917] flex flex-col">
      {/* Chasis Superior Pizarra */}
      <header className="bg-[#1C1917] text-[#FAF8F5] border-b-2 border-[#1C1917]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-3 text-[#FAF8F5] hover:text-[#F4A261] transition-colors"
          >
            <div className="w-10 h-10 bg-[#B84A27] text-white border-2 border-[#FAF8F5] flex items-center justify-center shrink-0">
              <PawPrint className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span
                className="font-black text-base sm:text-lg tracking-tight uppercase block leading-none"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Patitas Calchaquíes
              </span>
              <span className="font-mono text-[11px] text-[#D6CEC2] block mt-1">
                PUESTO DE GUARDIA · RUTA 40 KM 4318
              </span>
            </div>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-3.5 min-h-[40px] bg-[#292524] hover:bg-[#B84A27] text-[#FAF8F5] border border-[#57534E] text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Fichero Público</span>
          </Link>
        </div>
      </header>

      {/* Tablero de Credenciales de Guardia */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex items-center">
        <div className="w-full border-2 border-[#1C1917] bg-white grid grid-cols-1 lg:grid-cols-12 divide-y-2 lg:divide-y-0 lg:divide-x-2 divide-[#1C1917]">
          {/* Columna Izquierda (7 cols): Formulario de Credencial */}
          <section className="lg:col-span-7 p-6 sm:p-8 lg:p-10 space-y-6">
            <div className="border-b-2 border-[#1C1917] pb-5 space-y-2">
              <h1
                className="text-2xl sm:text-3xl font-black text-[#1C1917] uppercase tracking-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Credencial de Guardia Operativa
              </h1>
              <p className="text-sm sm:text-base text-[#44403C] leading-relaxed">
                Acceso interno para coordinación, veterinaria de planta y guardia voluntaria.
                Sincronizado con las entidades{' '}
                <code className="font-mono font-bold text-xs text-[#1C1917]">Usuario.cs</code> y{' '}
                <code className="font-mono font-bold text-xs text-[#1C1917]">Rol.cs</code> de tu API C#.
              </p>
            </div>

            {errorMsg && (
              <ErrorAlert
                title="No se pudo validar la credencial"
                message={errorMsg}
              />
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Usuario Operativo (Usuario.User)"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                placeholder="Ej. admin.valles"
                autoComplete="username"
                required
              />

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="login-password"
                    className="block text-sm font-bold text-[#1C1917]"
                  >
                    Clave de Guardia <span className="text-[#B84A27]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setMostrarPassword((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#44403C] hover:text-[#B84A27] cursor-pointer"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {mostrarPassword ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>Ocultar</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" />
                        <span>Mostrar</span>
                      </>
                    )}
                  </button>
                </div>
                <input
                  id="login-password"
                  type={mostrarPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  autoComplete="current-password"
                  required
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-none border-2 border-[#1C1917] bg-white text-[#1C1917] text-base placeholder:text-[#78716C] focus:outline-none focus:ring-2 focus:ring-[#B84A27]"
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={isSubmitting}
                  leftIcon={<KeyRound className="w-4 h-4" />}
                >
                  Abrir Tablero del Refugio
                </Button>
              </div>
            </form>
          </section>

          {/* Columna Derecha (5 cols): Perfiles de Rol en 1 toque */}
          <aside className="lg:col-span-5 bg-[#FAF8F5] flex flex-col justify-between">
            <div className="p-5 sm:p-6 bg-[#F2ECE1] border-b-2 border-[#1C1917] space-y-1">
              <h2
                className="text-lg font-black text-[#1C1917] uppercase tracking-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Perfiles de Guardia (1 Toque)
              </h2>
              <p className="text-xs sm:text-sm text-[#44403C]">
                Selecciona un rol de prueba para ingresar directamente desde PC o Android:
              </p>
            </div>

            <div className="divide-y-2 divide-[#1C1917] flex-1">
              {demoAccounts.map((cuenta) => {
                const seleccionado = user.toLowerCase() === cuenta.user.toLowerCase();
                return (
                  <div
                    key={cuenta.usuario.idUsuario}
                    className={`p-5 transition-colors ${
                      seleccionado ? 'bg-[#F2ECE1]' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`w-4 h-4 rounded-full border-2 border-[#1C1917] shrink-0 ${
                            seleccionado ? 'bg-[#B84A27]' : 'bg-[#FAF8F5]'
                          }`}
                        />
                        {obtenerIconoRol(cuenta.rol.idRol)}
                        <div className="min-w-0">
                          <h3 className="font-bold text-base text-[#1C1917] truncate">
                            {cuenta.etiqueta}
                          </h3>
                          <p className="text-xs text-[#44403C] font-mono font-bold truncate tabular-data">
                            {cuenta.user} · ROL #{cuenta.rol.idRol} ({cuenta.rol.nombre.toUpperCase()})
                          </p>
                        </div>
                      </div>
                      {seleccionado && <Badge variant="success">Activo</Badge>}
                    </div>

                    <p className="text-sm text-[#44403C] mt-2.5 leading-relaxed">
                      {cuenta.resumenPermisos}
                    </p>

                    <div className="mt-3.5">
                      <Button
                        type="button"
                        variant={seleccionado ? 'primary' : 'outline'}
                        size="sm"
                        fullWidth
                        onClick={() => handleIngresoRapido(cuenta)}
                        disabled={isSubmitting}
                      >
                        Entrar como {cuenta.rol.nombre}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};
