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
  CheckCircle2,
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
    return <HeartHandshake className="w-5 h-5 text-amber-700" />;
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col">
      {/* Barra superior con regreso a la portada pública */}
      <header className="border-b border-[#E5DFD7] bg-[#F3EFEA]/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 text-stone-900 hover:text-[#B84A27] transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-[#B84A27] text-white flex items-center justify-center shrink-0">
              <PawPrint className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <span className="font-bold text-sm sm:text-base block leading-tight">
                Patitas Calchaquíes
              </span>
              <span className="text-xs text-stone-600 block leading-tight">
                Valles Calchaquíes · Red de Rescate
              </span>
            </div>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3.5 min-h-[40px] rounded-lg text-xs sm:text-sm font-semibold text-stone-700 hover:text-stone-900 bg-white border border-[#E5DFD7] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la web pública</span>
          </Link>
        </div>
      </header>

      {/* Cuerpo principal en dos columnas asimétricas (Formulario + Perfiles de Rol C#) */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Columna Izquierda (7 cols): Credencial de ingreso */}
          <section className="lg:col-span-7 bg-white rounded-xl border border-[#E5DFD7] p-6 sm:p-8 space-y-6">
            <div className="space-y-2 border-b border-[#E5DFD7] pb-5">
              <h1
                className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Ingreso al Panel Operativo
              </h1>
              <p className="text-sm text-stone-600 leading-relaxed">
                Acceso exclusivo para coordinación, equipo veterinario y guardia voluntaria del refugio.
                Modelado sobre las entidades <code className="font-mono text-xs text-stone-800">Usuario</code> y{' '}
                <code className="font-mono text-xs text-stone-800">Rol</code> de tu capa Core en C#.
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
                label="Usuario (Usuario.User)"
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
                    className="block text-sm font-semibold text-stone-800"
                  >
                    Contraseña <span className="text-red-700">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setMostrarPassword((prev) => !prev)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
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
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg border border-[#D6CEC2] bg-white text-stone-900 text-sm placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-[#B84A27] focus:border-transparent"
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
                  Ingresar al Dashboard del Refugio
                </Button>
              </div>
            </form>
          </section>

          {/* Columna Derecha (5 cols): Perfiles de prueba rápida en 1 toque (Android / Desarrollo) */}
          <aside className="lg:col-span-5 space-y-4">
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-stone-900 tracking-tight">
                Acceso rápido en un toque
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Toca cualquiera de los tres roles configurados en el refugio para autocompletar e ingresar sin tipear desde tu celular Android:
              </p>
            </div>

            <div className="divide-y divide-[#E5DFD7] border border-[#E5DFD7] rounded-xl bg-white overflow-hidden">
              {demoAccounts.map((cuenta) => {
                const seleccionado = user.toLowerCase() === cuenta.user.toLowerCase();
                return (
                  <div
                    key={cuenta.usuario.idUsuario}
                    className={`p-4 sm:p-5 transition-colors ${
                      seleccionado ? 'bg-[#FAF8F5]' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {obtenerIconoRol(cuenta.rol.idRol)}
                        <div className="min-w-0">
                          <h3 className="font-bold text-sm text-stone-900 truncate">
                            {cuenta.etiqueta}
                          </h3>
                          <p className="text-xs text-stone-600 font-mono truncate tabular-data">
                            {cuenta.user} · Rol #{cuenta.rol.idRol} ({cuenta.rol.nombre})
                          </p>
                        </div>
                      </div>
                      {seleccionado && (
                        <Badge variant="success">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Activo
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                      {cuenta.resumenPermisos}
                    </p>

                    <div className="mt-3">
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
