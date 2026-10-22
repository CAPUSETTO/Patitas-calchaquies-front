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
    <div className="min-h-screen bg-[#FAF8F5] bg-field-grid text-[#1C1917] flex flex-col">
      {/* 1. Barra Lateral en Escritorio */}
      <Sidebar />

      {/* 2. Cabecera Móvil (Solo visible en pantallas pequeñas) */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-[#1C1917] text-[#FAF8F5] border-b-2 border-[#1C1917] md:hidden">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 bg-[#B84A27] text-white border border-[#FAF8F5] flex items-center justify-center shrink-0">
            <PawPrint className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <span
              className="font-black text-sm tracking-tight uppercase text-[#FAF8F5] block leading-tight truncate"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Patitas Calchaquíes
            </span>
            <span className="font-mono text-[11px] text-[#D6CEC2] block leading-none truncate">
              {session ? `${session.usuario.user} · ${session.rol.nombre}` : 'GUARDIA'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Link
            to="/"
            className="inline-flex items-center gap-1 px-2.5 min-h-[36px] text-xs font-bold uppercase text-[#FAF8F5] bg-[#292524] border border-[#57534E]"
            title="Ver fichero público"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#F4A261]" />
            <span>Fichero</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center min-h-[36px] min-w-[36px] text-[#FAF8F5] hover:bg-[#991B1B] bg-[#292524] border border-[#57534E]"
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
