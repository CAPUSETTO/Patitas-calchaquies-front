import React from 'react';
import { NavLink } from 'react-router-dom';
import { PawPrint, Wifi } from 'lucide-react';
import { MAIN_NAV_ITEMS } from './navigationConfig';

/**
 * Sidebar - Panel de navegación lateral persistente para pantallas de escritorio (Desktop / Tablet).
 */
export const Sidebar: React.FC = () => {
  return (
    <aside
      aria-label="Barra lateral principal"
      className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-[#F3EFEA] border-r border-[#E5DFD7] z-30"
    >
      {/* Cabecera / Identidad del Refugio */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-[#E5DFD7] bg-[#FAF8F5]/80">
        <div className="w-10 h-10 rounded-lg bg-[#B84A27] text-white flex items-center justify-center shrink-0 shadow-xs">
          <PawPrint className="w-6 h-6 stroke-[2]" />
        </div>
        <div className="min-w-0">
          <h1 className="font-bold text-base text-stone-900 truncate tracking-tight">
            Patitas Calchaquíes
          </h1>
          <p className="text-xs text-stone-600 truncate">
            Refugio de Animales
          </p>
        </div>
      </div>

      {/* Lista de Navegación */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {MAIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${
                  isActive
                    ? 'bg-white text-[#B84A27] shadow-2xs border border-[#E5DFD7] font-semibold'
                    : 'text-stone-700 hover:bg-[#FAF8F5] hover:text-stone-900'
                }
              `}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="block truncate">{item.name}</span>
              </div>
            </NavLink>
          );
        })}
      </div>

      {/* Pie de Sidebar: Estado de Red Local y Versión */}
      <div className="p-4 border-t border-[#E5DFD7] bg-[#FAF8F5]/50">
        <div className="flex items-center gap-2 text-xs text-stone-700 tabular-data">
          <span className="inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          <Wifi className="w-3.5 h-3.5 text-stone-600" />
          <span className="truncate">API C# (Puerto 5227)</span>
        </div>
        <div className="mt-1 text-xs text-stone-600 truncate">
          Taller de Desarrollo de Software
        </div>
      </div>
    </aside>
  );
};
