import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { HomePage } from './pages/HomePage';
import { PlaceholderPage } from './pages/PlaceholderPage';

/**
 * App - Componente Raíz de Enrutamiento (SPA - Single Page Application).
 * 
 * TUTORÍA PARA DESARROLLADORES C#:
 * En ASP.NET Core MVC defines rutas en los controladores con atributos `[Route("...")]`.
 * En React con `react-router-dom`:
 * - `<BrowserRouter>`: intercepta la barra de direcciones del navegador para cambiar de pantalla
 *   al instante sin recargar la página completa desde el servidor (cero parpadeos).
 * - `<Route element={<AppShell />}>`: Define una ruta padre que envuelve a todas las hijas.
 *   El `AppShell` renderiza la Sidebar y BottomNav fijas, y su `<Outlet />` muestra la página hija activa.
 */
export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/animales"
            element={
              <PlaceholderPage
                title="Censo de Animales"
                subtitle="Fichas de rescate, fotos, salud y estado de adopción"
                entityName="Animales"
              />
            }
          />
          <Route
            path="/adopciones"
            element={
              <PlaceholderPage
                title="Gestión de Adopciones"
                subtitle="Control de postulantes, formularios y seguimiento"
                entityName="Adopciones"
              />
            }
          />
          <Route
            path="/atenciones"
            element={
              <PlaceholderPage
                title="Atenciones Veterinarias"
                subtitle="Historial de vacunas, desparasitaciones y controles"
                entityName="Atenciones"
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
