import React from 'react';
import { NavLink } from 'react-router-dom';
import { BOTTOM_NAV_ITEMS } from './navigationConfig';

/**
 * BottomNav - Barra de navegación fija inferior para Android / iOS.
 * Muestra los 5 módulos centrales del refugio dentro del alcance del pulgar.
 */
export const BottomNav: React.FC = () => {
  return (
    <nav
      aria-label="Navegación móvil inferior"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#DCE6DF] md:hidden safe-bottom"
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto px-1">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) => `
                flex flex-col items-center justify-center min-h-[44px] py-1 px-1 text-[11px] font-bold transition-colors
                ${
                  isActive
                    ? 'text-[#16A34A]'
                    : 'text-[#527062] hover:text-[#0F291E] active:text-[#16A34A]'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`p-1 rounded-xl transition-all ${
                      isActive ? 'bg-[#F0FDF4]' : ''
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        isActive ? 'stroke-[2.25]' : 'stroke-[1.75]'
                      }`}
                    />
                  </div>
                  <span className="truncate max-w-full mt-0.5 tracking-tight">
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
