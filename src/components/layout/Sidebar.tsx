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
      className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-[#F3EFEA] border-r border-[#E5DFD7] z-30"
    >
      {/* Cabecera / Identidad del Refugio */}
      <div className="flex items-center justify-between gap-3 px-5 h-16 border-b border-[#E5DFD7] bg-[#FAF8F5]/80 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-[#B84A27] text-white flex items-center justify-center shrink-0">
            <PawPrint className="w-6 h-6 stroke-[2]" />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-base text-stone-900 truncate tracking-tight">
              Patitas Calchaquíes
            </h1>
            <p className="text-xs text-stone-600 truncate">
              Gestión Interna
            </p>
          </div>
        </div>
      </div>

      {/* Enlace directo a la Web Pública */}
      <div className="px-3 pt-3">
        <Link
          to="/"
          className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-stone-700 bg-[#FAF8F5] hover:bg-white border border-[#E5DFD7] transition-colors"
        >
          <span>Ver web pública de adopción</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#B84A27] shrink-0" />
        </Link>
      </div>

      {/* Lista de Navegación con Scroll */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        <div>
          <div className="px-3 pb-2 text-xs font-semibold text-stone-600">
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
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${
                      isActive
                        ? 'bg-white text-[#B84A27] border border-[#E5DFD7] font-semibold'
                        : 'text-stone-700 hover:bg-[#FAF8F5] hover:text-stone-900'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </div>

        <div>
          <div className="px-3 pb-2 text-xs font-semibold text-stone-600">
            Catálogos y Parámetros
          </div>
          <div className="space-y-1">
            {itemsCatalogos.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${
                      isActive
                        ? 'bg-white text-[#B84A27] border border-[#E5DFD7] font-semibold'
                        : 'text-stone-700 hover:bg-[#FAF8F5] hover:text-stone-900'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pie de Sidebar: Usuario activo + Estado API + Cerrar sesión */}
      <div className="p-4 border-t border-[#E5DFD7] bg-[#FAF8F5] shrink-0 space-y-3">
        {session && (
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#E5DFD7]">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900 truncate">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" />
                <span className="truncate">{session.usuario.user}</span>
              </div>
              <p className="text-[11px] text-stone-600 truncate mt-0.5">
                Rol: {session.rol.nombre}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Cerrar sesión"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-stone-700 hover:text-red-700 hover:bg-red-50 border border-[#E5DFD7] transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Salir</span>
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-stone-700 tabular-data">
          <span className="inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          <Wifi className="w-3.5 h-3.5 text-stone-600" />
          <span className="truncate">API C# (Puerto 5227)</span>
        </div>
      </div>
    </aside>
  );
};
