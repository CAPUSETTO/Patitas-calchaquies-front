import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { HomePage } from './pages/HomePage';
import { PersonasPage } from './pages/PersonasPage';
import { VacunasPage } from './pages/VacunasPage';
import { MedicamentosPage } from './pages/MedicamentosPage';
import { RazasPage } from './pages/RazasPage';
import { PlaceholderPage } from './pages/PlaceholderPage';

/**
 * App - Componente Raíz de Enrutamiento (SPA - Single Page Application).
 */
export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/personas" element={<PersonasPage />} />
          <Route path="/vacunas" element={<VacunasPage />} />
          <Route path="/medicamentos" element={<MedicamentosPage />} />
          <Route path="/razas" element={<RazasPage />} />
          <Route
            path="/animales"
            element={
              <PlaceholderPage
                title="Censo de Animales del Refugio"
                subtitle="El controlador AnimalController está en desarrollo en el backend. Las razas ya están disponibles en su propio módulo."
                entityName="Animales"
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
