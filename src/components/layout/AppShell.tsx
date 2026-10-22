import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { PawPrint, ExternalLink, LogOut } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { authService } from '../../services/authService';

/**
 * AppShell - Contenedor maestro del Dashboard Administrativo (/admin).
 * Diseñado en Blanco Titanio (#F8FAFC) y Pizarra Nocturna (#0F172A) para lectura sin fatiga.
 */
export const AppShell: React.FC = () => {
  const navigate = useNavigate();
  const session = authService.getCurrentSession();

  const handleLogout = () => {
    authService.logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col">
      {/* 1. Barra Lateral en Escritorio */}
      <Sidebar />

      {/* 2. Cabecera Móvil (Solo visible en pantallas pequeñas) */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-[#0F172A] text-white border-b border-[#1E293B] md:hidden">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center shrink-0">
            <PawPrint className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <span
              className="font-black text-sm tracking-tight text-white block leading-tight truncate"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Patitas Calchaquíes
            </span>
            <span className="font-mono text-[11px] text-[#94A3B8] block leading-none truncate">
              {session ? `${session.usuario.user} · ${session.rol.nombre}` : 'PANEL'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            to="/"
            className="inline-flex items-center gap-1 px-2.5 min-h-[36px] rounded-lg text-xs font-bold text-white bg-[#1E293B] border border-[#334155]"
            title="Ver Landing pública"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#FB923C]" />
            <span>Landing</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center min-h-[36px] min-w-[36px] rounded-lg text-white hover:bg-[#DC2626] bg-[#1E293B] border border-[#334155]"
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
