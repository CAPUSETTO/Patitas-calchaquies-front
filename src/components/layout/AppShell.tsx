import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { ExternalLink, LogOut } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { authService } from '../../services/authService';

/**
 * AppShell - Contenedor maestro del Dashboard Administrativo (/admin).
 * Armonizado con los colores del Emblema Oficial (Bosque Profundo #0F291E y Blanco Salvia #F7FAF8).
 */
export const AppShell: React.FC = () => {
  const navigate = useNavigate();
  const session = authService.getCurrentSession();

  const handleLogout = () => {
    authService.logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F7FAF8] text-[#0F291E] flex flex-col">
      {/* 1. Barra Lateral en Escritorio */}
      <Sidebar />

      {/* 2. Cabecera Móvil (Solo visible en pantallas pequeñas) */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 h-16 bg-white/95 backdrop-blur-md text-[#0F291E] border-b border-[#DCE6DF] md:hidden">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src="/logo-patitas.jpg"
            alt="Logo Asociación Protectora de Animales"
            className="w-11 h-11 object-contain shrink-0 mix-blend-multiply"
          />
          <div className="min-w-0">
            <span
              className="font-black text-sm tracking-tight text-[#0F291E] block leading-tight truncate"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Patitas Calchaquíes
            </span>
            <span className="font-mono text-[11px] text-[#16A34A] font-bold block leading-none truncate">
              {session ? `${session.usuario.user} · ${session.rol.nombre}` : 'PANEL'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            to="/"
            className="inline-flex items-center gap-1 px-2.5 min-h-[36px] rounded-lg text-xs font-bold text-[#0F291E] bg-[#EDF4F0] border border-[#B8CCC0]"
            title="Ver Landing pública"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Landing</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center min-h-[36px] min-w-[36px] rounded-lg text-[#0F291E] hover:text-white hover:bg-[#DC2626] bg-[#EDF4F0] border border-[#B8CCC0]"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 3. Área de Contenido Principal */}
      <div className="flex-1 md:pl-64 flex flex-col">
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* 4. Navegación Inferior Táctil (Solo visible en móviles / Android) */}
      <BottomNav />
    </div>
  );
};
