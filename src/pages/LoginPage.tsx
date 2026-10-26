import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
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
    if (idRol === 1) return <ShieldCheck className="w-5 h-5 text-[#DC2626]" />;
    if (idRol === 2) return <Stethoscope className="w-5 h-5 text-[#16A34A]" />;
    return <HeartHandshake className="w-5 h-5 text-[#0F291E]" />;
  };

  return (
    <div className="min-h-screen bg-[#F7FAF8] bg-modern-dots text-[#0F291E] flex flex-col">
      {/* Cabecera Superior en Blanco Puro con el Logo Oficial */}
      <header className="bg-white/95 backdrop-blur-md text-[#0F291E] border-b border-[#DCE6DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-3.5 text-[#0F291E] hover:text-[#16A34A] transition-colors"
          >
            <img
              src="/logo-patitas.jpg"
              alt="Logo oficial Asociación Protectora de Animales"
              className="w-14 h-14 object-contain shrink-0 mix-blend-multiply"
            />
            <div>
              <span
                className="font-black text-base sm:text-lg tracking-tight block leading-none"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Patitas Calchaquíes
              </span>
              <span className="font-mono text-[11px] font-bold text-[#DC2626] block mt-1">
                ASOCIACIÓN PROTECTORA DE ANIMALES
              </span>
            </div>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-3.5 min-h-[40px] rounded-xl bg-[#EDF4F0] hover:bg-[#DCE6DF] text-[#0F291E] border border-[#B8CCC0] text-xs sm:text-sm font-bold transition-colors"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la Landing Pública</span>
          </Link>
        </div>
      </header>

      {/* Contenedor Principal Partido (7:5) sin tarjetas anidadas */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex items-center">
        <div className="w-full surface-layered rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#DCE6DF]">
          {/* Columna Izquierda (7 cols): Formulario de Acceso */}
          <section className="lg:col-span-7 p-6 sm:p-8 lg:p-10 space-y-6 bg-white">
            <div className="border-b border-[#DCE6DF] pb-5 flex items-center gap-4">
              <img
                src="/logo-patitas.jpg"
                alt="Emblema Asociación Protectora de Animales"
                className="w-16 h-16 object-contain shrink-0 hidden sm:block mix-blend-multiply"
              />
              <div className="space-y-1.5">
                <h1
                  className="text-2xl sm:text-3xl font-black text-[#0F291E] tracking-tight"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Ingreso al Dashboard de Trabajadores
                </h1>
                <p className="text-sm sm:text-base text-[#2D4A3E] leading-relaxed">
                  Acceso exclusivo para coordinación, equipo veterinario y guardia voluntaria del refugio.
                </p>
              </div>
            </div>

            {errorMsg && (
              <ErrorAlert
                title="No se pudo validar la credencial"
                message={errorMsg}
              />
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Usuario Operativo"
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
                    className="block text-sm font-bold text-[#0F291E]"
                  >
                    Contraseña <span className="text-[#DC2626]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setMostrarPassword((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#16A34A] hover:text-[#15803D] cursor-pointer"
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
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#B8CCC0] bg-white text-[#0F291E] text-base placeholder:text-[#527062] focus:outline-none focus:ring-2 focus:ring-[#16A34A]/25 focus:border-[#16A34A]"
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
                  Entrar al Panel Operativo
                </Button>
              </div>
            </form>
          </section>

          {/* Columna Derecha (5 cols): Perfiles de Rol en 1 Toque */}
          <aside className="lg:col-span-5 bg-[#F7FAF8] flex flex-col justify-between">
            <div className="p-5 sm:p-6 bg-[#EDF4F0] border-b border-[#DCE6DF] space-y-1">
              <h2
                className="text-lg font-black text-[#0F291E] tracking-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Acceso Rápido por Rol (1 Toque)
              </h2>
              <p className="text-xs sm:text-sm text-[#2D4A3E]">
                Selecciona un perfil de prueba para entrar sin tipear desde PC o Android:
              </p>
            </div>

            <div className="divide-y divide-[#DCE6DF] flex-1">
              {demoAccounts.map((cuenta) => {
                const seleccionado = user.toLowerCase() === cuenta.user.toLowerCase();
                return (
                  <div
                    key={cuenta.usuario.idUsuario}
                    className={`p-5 transition-colors ${
                      seleccionado ? 'bg-[#F0FDF4]' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`w-3.5 h-3.5 rounded-full border shrink-0 ${
                            seleccionado
                              ? 'bg-[#16A34A] border-[#15803D]'
                              : 'bg-white border-[#B8CCC0]'
                          }`}
                        />
                        {obtenerIconoRol(cuenta.rol.idRol)}
                        <div className="min-w-0">
                          <h3 className="font-bold text-base text-[#0F291E] truncate">
                            {cuenta.etiqueta}
                          </h3>
                          <p className="text-xs text-[#2D4A3E] font-mono font-bold truncate tabular-data">
                            {cuenta.user} · Rol #{cuenta.rol.idRol} ({cuenta.rol.nombre})
                          </p>
                        </div>
                      </div>
                      {seleccionado && <Badge variant="success">Activo</Badge>}
                    </div>

                    <p className="text-sm text-[#2D4A3E] mt-2 leading-relaxed">
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
