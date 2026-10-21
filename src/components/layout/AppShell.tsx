import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { PawPrint, ExternalLink, LogOut } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { authService } from '../../services/authService';

/**
 * AppShell - Contenedor maestro del Dashboard Administrativo (/admin).
 * Equivalente al `_Layout.cshtml` del área administrativa en C# ASP.NET.
 */
export const AppShell: React.FC = () => {
  const navigate = useNavigate();
  const session = authService.getCurrentSession();

  const handleLogout = () => {
    authService.logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col">
      {/* 1. Barra Lateral en Escritorio */}
      <Sidebar />

      {/* 2. Cabecera Móvil (Solo visible en pantallas pequeñas) */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-[#F3EFEA]/95 backdrop-blur-md border-b border-[#E5DFD7] md:hidden">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-md bg-[#B84A27] text-white flex items-center justify-center shrink-0">
            <PawPrint className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="min-w-0">
            <span className="font-bold text-sm tracking-tight text-stone-900 block leading-tight truncate">
              Patitas Calchaquíes
            </span>
            <span className="text-[11px] text-stone-600 block leading-none truncate">
              {session ? `${session.usuario.user} · ${session.rol.nombre}` : 'Panel Operativo'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            to="/"
            className="inline-flex items-center gap-1 px-2.5 min-h-[38px] rounded-lg text-xs font-semibold text-stone-700 bg-[#FAF8F5] border border-[#E5DFD7]"
            title="Ver página principal pública"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#B84A27]" />
            <span>Web</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center min-h-[38px] min-w-[38px] rounded-lg text-stone-700 hover:text-red-700 bg-[#FAF8F5] border border-[#E5DFD7]"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 3. Área de Contenido Principal (Con margen izquierdo en Desktop para compensar la Sidebar) */}
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
