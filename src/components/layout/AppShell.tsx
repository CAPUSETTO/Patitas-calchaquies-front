import React from 'react';
import { Outlet } from 'react-router-dom';
import { PawPrint } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

/**
 * AppShell - Contenedor maestro del sistema (Equivalente al `_Layout.cshtml` en C# ASP.NET).
 * 
 * Funcionalidades clave:
 * 1. Coordina la barra lateral fija en escritorio (`Sidebar`) y la barra inferior táctil en móvil (`BottomNav`).
 * 2. Utiliza `<Outlet />` de `react-router-dom`: este componente actúa como el punto de montaje dinámico
 *    donde se renderiza la vista de la ruta actual (análogo al `@RenderBody()` de Razor).
 * 3. En móviles reserva espacio inferior (`pb-20`) para asegurar que el contenido nunca quede tapado por la `BottomNav`.
 */
export const AppShell: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col">
      {/* 1. Barra Lateral en Escritorio */}
      <Sidebar />

      {/* 2. Cabecera Móvil (Solo visible en pantallas pequeñas) */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-[#F3EFEA]/95 backdrop-blur-md border-b border-[#E5DFD7] md:hidden">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-[#B84A27] text-white flex items-center justify-center">
            <PawPrint className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-stone-900 block leading-tight">
              Patitas Calchaquíes
            </span>
            <span className="text-[10px] text-stone-600 block leading-none">
              Refugio de Animales
            </span>
          </div>
        </div>
      </header>

      {/* 3. Área de Contenido Principal (Con margen izquierdo en Desktop para compensar la Sidebar) */}
      <div className="flex-1 md:pl-64 flex flex-col">
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
          {/* Aquí se monta la página según la ruta activa */}
          <Outlet />
        </main>
      </div>

      {/* 4. Navegación Inferior Táctil (Solo visible en móviles / Android) */}
      <BottomNav />
    </div>
  );
};
