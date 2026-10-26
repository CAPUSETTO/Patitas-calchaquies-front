import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Wifi, ExternalLink, LogOut, ShieldCheck } from 'lucide-react';
import { MAIN_NAV_ITEMS } from './navigationConfig';
import { authService } from '../../services/authService';

/**
 * Sidebar - Panel de navegación lateral en Bosque Profundo (#0F291E)
 * con el Emblema Oficial de la Asociación Protectora de Animales.
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
      className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-[#0F291E] text-white border-r border-[#1E4634] z-30"
    >
      {/* Cabecera con el Logo Oficial en Medallón Blanco */}
      <div className="flex items-center justify-between gap-3 px-4 h-20 border-b border-[#1E4634] shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-sm">
            <img
              src="/logo-patitas.jpg"
              alt="Logo Asociación Protectora de Animales"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <h1
              className="font-black text-sm text-white truncate tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Patitas Calchaquíes
            </h1>
            <p className="font-mono text-[10px] text-[#86EFAC] truncate">
              PROTECTORA DE ANIMALES
            </p>
          </div>
        </div>
      </div>

      {/* Enlace directo a la Landing Pública */}
      <div className="p-3 border-b border-[#1E4634]">
        <Link
          to="/"
          className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#D1FAE5] bg-[#143325] hover:bg-[#1E4634] transition-colors"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <span>Ver Landing Pública</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#4ADE80] shrink-0" />
        </Link>
      </div>

      {/* Lista de Navegación con Scroll */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <div
            className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-[#86EFAC]"
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
                        ? 'bg-[#16A34A] text-white shadow-[0_6px_16px_-4px_rgba(22,163,74,0.45)]'
                        : 'text-[#D1FAE5] hover:bg-[#143325] hover:text-white'
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
            className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-[#86EFAC]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Catálogos del Sistema
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
                        ? 'bg-[#16A34A] text-white shadow-[0_6px_16px_-4px_rgba(22,163,74,0.45)]'
                        : 'text-[#D1FAE5] hover:bg-[#143325] hover:text-white'
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
      <div className="p-4 border-t border-[#1E4634] bg-[#0F291E] shrink-0 space-y-3">
        {session && (
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#1E4634]">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-white truncate">
                <ShieldCheck className="w-3.5 h-3.5 text-[#4ADE80] shrink-0" />
                <span className="font-mono truncate">{session.usuario.user}</span>
              </div>
              <p className="text-[11px] text-[#A7F3D0] truncate mt-0.5">
                Rol: {session.rol.nombre}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Cerrar sesión"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-[#D1FAE5] hover:text-white hover:bg-[#DC2626] bg-[#143325] transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Salir</span>
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs font-mono text-[#A7F3D0] tabular-data">
          <span className="inline-flex h-2 w-2 rounded-full bg-[#4ADE80]"></span>
          <Wifi className="w-3.5 h-3.5 text-[#4ADE80]" />
          <span className="truncate">Servidor Conectado</span>
        </div>
      </div>
    </aside>
  );
};
