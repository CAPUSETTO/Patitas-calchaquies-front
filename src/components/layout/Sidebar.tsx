import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { PawPrint, Wifi, ExternalLink, LogOut, ShieldCheck } from 'lucide-react';
import { MAIN_NAV_ITEMS } from './navigationConfig';
import { authService } from '../../services/authService';

/**
 * Sidebar - Panel de navegación lateral moderno en Pizarra Nocturna (#0F172A)
 * para máxima legibilidad y descanso visual de los trabajadores del refugio.
 */
export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const session = authService.getCurrentSession();
  const itemsPrincipales = MAIN_NAV_ITEMS.filter((i) => i.seccion === 'principal');
  const itemsCatalogos = MAIN_NAV_ITEMS.filter((i) => i.seccion === 'catalogo');

  const handleLogout = () => {
    authService.logout();
    navigate('/login', { replace: true });
  };

  return (
    <aside
      aria-label="Barra lateral principal"
      className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-[#0F172A] text-white border-r border-[#1E293B] z-30"
    >
      {/* Cabecera de Identidad */}
      <div className="flex items-center justify-between gap-3 px-5 h-16 border-b border-[#1E293B] shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-[0_4px_12px_rgba(37,99,235,0.4)]">
            <PawPrint className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <h1
              className="font-black text-sm text-white truncate tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Patitas Calchaquíes
            </h1>
            <p className="font-mono text-[11px] text-[#94A3B8] truncate">
              PANEL OPERATIVO
            </p>
          </div>
        </div>
      </div>

      {/* Enlace directo a la Landing Pública */}
      <div className="p-3 border-b border-[#1E293B]">
        <Link
          to="/"
          className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#E2E8F0] bg-[#1E293B] hover:bg-[#334155] transition-colors"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <span>Ver Landing Pública</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#FB923C] shrink-0" />
        </Link>
      </div>

      {/* Lista de Navegación con Scroll */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <div
            className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Gestión del Refugio
          </div>
          <div className="space-y-1">
            {itemsPrincipales.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/admin'}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all
                    ${
                      isActive
                        ? 'bg-[#2563EB] text-white shadow-[0_6px_16px_-4px_rgba(37,99,235,0.45)]'
                        : 'text-[#CBD5E1] hover:bg-[#1E293B] hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </div>

        <div>
          <div
            className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Catálogos API C# (MySQL)
          </div>
          <div className="space-y-1">
            {itemsCatalogos.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all
                    ${
                      isActive
                        ? 'bg-[#2563EB] text-white shadow-[0_6px_16px_-4px_rgba(37,99,235,0.45)]'
                        : 'text-[#CBD5E1] hover:bg-[#1E293B] hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pie de Sidebar: Usuario activo + Estado API + Cerrar sesión */}
      <div className="p-4 border-t border-[#1E293B] bg-[#0F172A] shrink-0 space-y-3">
        {session && (
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#1E293B]">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white truncate">
                <ShieldCheck className="w-3.5 h-3.5 text-[#34D399] shrink-0" />
                <span className="font-mono truncate">{session.usuario.user}</span>
              </div>
              <p className="text-[11px] text-[#94A3B8] truncate mt-0.5">
                Rol: {session.rol.nombre}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Cerrar sesión"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#CBD5E1] hover:text-white hover:bg-[#DC2626] bg-[#1E293B] transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Salir</span>
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs font-mono text-[#94A3B8] tabular-data">
          <span className="inline-flex h-2 w-2 rounded-full bg-[#10B981]"></span>
          <Wifi className="w-3.5 h-3.5 text-[#34D399]" />
          <span className="truncate">API C# · Puerto 5227</span>
        </div>
      </div>
    </aside>
  );
};
