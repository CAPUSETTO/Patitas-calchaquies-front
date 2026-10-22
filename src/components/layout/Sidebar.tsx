import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { PawPrint, Wifi, ExternalLink, LogOut, ShieldCheck } from 'lucide-react';
import { MAIN_NAV_ITEMS } from './navigationConfig';
import { authService } from '../../services/authService';

/**
 * Sidebar - Panel de navegación lateral para escritorio en el Dashboard Administrativo (/admin).
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
      className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-[#F2ECE1] border-r-2 border-[#1C1917] z-30"
    >
      {/* Cabecera Chasis Pizarra */}
      <div className="flex items-center justify-between gap-3 px-4 h-16 border-b-2 border-[#1C1917] bg-[#1C1917] text-[#FAF8F5] shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 bg-[#B84A27] text-white border-2 border-[#FAF8F5] flex items-center justify-center shrink-0">
            <PawPrint className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <h1
              className="font-black text-sm text-[#FAF8F5] uppercase truncate tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Patitas Calchaquíes
            </h1>
            <p className="font-mono text-[11px] text-[#D6CEC2] truncate">
              GUARDIA OPERATIVA
            </p>
          </div>
        </div>
      </div>

      {/* Enlace directo al Fichero Público */}
      <div className="p-3 border-b-2 border-[#1C1917] bg-[#FAF8F5]">
        <Link
          to="/"
          className="flex items-center justify-between gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider text-[#1C1917] bg-white hover:bg-[#F2ECE1] border-2 border-[#1C1917] transition-colors"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <span>Fichero Público</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#B84A27] shrink-0" />
        </Link>
      </div>

      {/* Lista de Navegación con Scroll */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <div
            className="px-2 pb-2 text-xs font-black uppercase tracking-wider text-[#44403C]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Operaciones Centrales
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
                    flex items-center gap-3 px-3 py-2.5 text-sm font-bold transition-colors
                    ${
                      isActive
                        ? 'bg-[#1C1917] text-[#FAF8F5]'
                        : 'text-[#1C1917] hover:bg-[#FAF8F5]'
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
            className="px-2 pb-2 text-xs font-black uppercase tracking-wider text-[#44403C]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Catálogos MySQL (C#)
          </div>
          <div className="space-y-1">
            {itemsCatalogos.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 text-sm font-bold transition-colors
                    ${
                      isActive
                        ? 'bg-[#1C1917] text-[#FAF8F5]'
                        : 'text-[#1C1917] hover:bg-[#FAF8F5]'
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
      <div className="p-4 border-t-2 border-[#1C1917] bg-[#FAF8F5] shrink-0 space-y-3">
        {session && (
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#D6CEC2]">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1C1917] truncate">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" />
                <span className="font-mono truncate">{session.usuario.user}</span>
              </div>
              <p className="text-[11px] font-bold text-[#44403C] uppercase truncate mt-0.5">
                ROL: {session.rol.nombre}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Cerrar sesión"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold uppercase text-[#1C1917] hover:text-white hover:bg-[#991B1B] border-2 border-[#1C1917] transition-colors cursor-pointer shrink-0"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Salir</span>
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#1C1917] tabular-data">
          <span className="inline-flex h-2.5 w-2.5 bg-[#2D6A4F] border border-[#1C1917]"></span>
          <Wifi className="w-3.5 h-3.5 text-[#1C1917]" />
          <span className="truncate">API C# · PUERTO 5227</span>
        </div>
      </div>
    </aside>
  );
};
