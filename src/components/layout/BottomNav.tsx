import React from 'react';
import { NavLink } from 'react-router-dom';
import { MAIN_NAV_ITEMS } from './navigationConfig';

/**
 * BottomNav - Barra de navegación fija inferior para dispositivos móviles (Android / iOS).
 * 
 * Conceptos clave:
 * - `NavLink`: Hook y componente de React Router que inyecta automáticamente `isActive`
 *   según la URL actual, similar a comparar la ruta activa en C# MVC.
 * - `safe-bottom`: Clase utilitaria para respetar el área gestual inferior de Android.
 * - Área táctil mínima de 44x44px para uso cómodo con una sola mano en exteriores.
 */
export const BottomNav: React.FC = () => {
  return (
    <nav 
      aria-label="Navegación móvil inferior"
      className="fixed bottom-0 inset-x-0 z-40 bg-[#F3EFEA]/95 backdrop-blur-md border-t border-[#E5DFD7] md:hidden safe-bottom"
    >
      <div className="grid grid-cols-4 h-16 max-w-lg mx-auto px-1">
        {MAIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `
                flex flex-col items-center justify-center min-h-[44px] py-1 px-2 text-xs font-medium transition-colors
                ${isActive 
                  ? 'text-[#B84A27] font-semibold' 
                  : 'text-stone-600 hover:text-stone-900 active:text-[#B84A27]'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1 rounded-full transition-all ${isActive ? 'bg-[#FAF8F5] shadow-xs' : ''}`}>
                    <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.25]' : 'stroke-[1.75]'}`} />
                  </div>
                  <span className="truncate mt-0.5 tracking-tight">{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
