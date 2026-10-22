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
    if (idRol === 1) return <ShieldCheck className="w-5 h-5 text-[#2563EB]" />;
    if (idRol === 2) return <Stethoscope className="w-5 h-5 text-[#059669]" />;
    return <HeartHandshake className="w-5 h-5 text-[#F97316]" />;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] bg-modern-dots text-[#0F172A] flex flex-col">
      {/* Cabecera Superior Pizarra Nocturna */}
      <header className="bg-[#0F172A] text-white border-b border-[#1E293B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-3 text-white hover:text-[#60A5FA] transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-[0_4px_14px_rgba(37,99,235,0.45)]">
              <PawPrint className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span
                className="font-black text-base sm:text-lg tracking-tight block leading-none"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Patitas Calchaquíes
              </span>
              <span className="font-mono text-[11px] text-[#94A3B8] block mt-1">
                PORTAL DE TRABAJADORES · RUTA 40
              </span>
            </div>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-2 px-3.5 min-h-[40px] rounded-xl bg-[#1E293B] hover:bg-[#334155] text-white border border-[#334155] text-xs sm:text-sm font-bold transition-colors"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la Landing Pública</span>
          </Link>
        </div>
      </header>

      {/* Contenedor Principal Partido (7:5) sin tarjetas anidadas */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex items-center">
        <div className="w-full surface-layered rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#E2E8F0]">
          {/* Columna Izquierda (7 cols): Formulario de Acceso */}
          <section className="lg:col-span-7 p-6 sm:p-8 lg:p-10 space-y-6 bg-white">
            <div className="border-b border-[#E2E8F0] pb-5 space-y-2">
              <h1
                className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Ingreso al Dashboard de Trabajadores
              </h1>
              <p className="text-sm sm:text-base text-[#334155] leading-relaxed">
                Acceso para coordinación, equipo veterinario y guardia voluntaria. Modelado sobre{' '}
                <code className="font-mono font-bold text-xs text-[#2563EB]">Usuario.cs</code> y{' '}
                <code className="font-mono font-bold text-xs text-[#2563EB]">Rol.cs</code> de tu API C#.
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
                    className="block text-sm font-bold text-[#0F172A]"
                  >
                    Contraseña <span className="text-[#F97316]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setMostrarPassword((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] cursor-pointer"
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
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] bg-white text-[#0F172A] text-base placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/25 focus:border-[#2563EB]"
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
          <aside className="lg:col-span-5 bg-[#F8FAFC] flex flex-col justify-between">
            <div className="p-5 sm:p-6 bg-[#F1F5F9] border-b border-[#E2E8F0] space-y-1">
              <h2
                className="text-lg font-black text-[#0F172A] tracking-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Acceso Rápido por Rol (1 Toque)
              </h2>
              <p className="text-xs sm:text-sm text-[#475569]">
                Selecciona un perfil de prueba para entrar sin tipear desde PC o Android:
              </p>
            </div>

            <div className="divide-y divide-[#E2E8F0] flex-1">
              {demoAccounts.map((cuenta) => {
                const seleccionado = user.toLowerCase() === cuenta.user.toLowerCase();
                return (
                  <div
                    key={cuenta.usuario.idUsuario}
                    className={`p-5 transition-colors ${
                      seleccionado ? 'bg-[#EFF6FF]/75' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`w-3.5 h-3.5 rounded-full border shrink-0 ${
                            seleccionado
                              ? 'bg-[#2563EB] border-[#1D4ED8]'
                              : 'bg-white border-[#CBD5E1]'
                          }`}
                        />
                        {obtenerIconoRol(cuenta.rol.idRol)}
                        <div className="min-w-0">
                          <h3 className="font-bold text-base text-[#0F172A] truncate">
                            {cuenta.etiqueta}
                          </h3>
                          <p className="text-xs text-[#475569] font-mono font-bold truncate tabular-data">
                            {cuenta.user} · Rol #{cuenta.rol.idRol} ({cuenta.rol.nombre})
                          </p>
                        </div>
                      </div>
                      {seleccionado && <Badge variant="info">Activo</Badge>}
                    </div>

                    <p className="text-sm text-[#334155] mt-2 leading-relaxed">
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
