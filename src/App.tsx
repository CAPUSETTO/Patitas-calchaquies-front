import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { HomePage } from './pages/HomePage';
import { AnimalesPage } from './pages/AnimalesPage';
import { AdopcionesPage } from './pages/AdopcionesPage';
import { AtencionesPage } from './pages/AtencionesPage';
import { PersonasPage } from './pages/PersonasPage';
import { VacunasPage } from './pages/VacunasPage';
import { MedicamentosPage } from './pages/MedicamentosPage';
import { RazasPage } from './pages/RazasPage';

/**
 * App - Router Principal (SPA).
 * Conecta los 8 módulos del sistema de gestión del refugio.
 */
export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/animales" element={<AnimalesPage />} />
          <Route path="/adopciones" element={<AdopcionesPage />} />
          <Route path="/atenciones" element={<AtencionesPage />} />
          <Route path="/personas" element={<PersonasPage />} />
          <Route path="/vacunas" element={<VacunasPage />} />
          <Route path="/medicamentos" element={<MedicamentosPage />} />
          <Route path="/razas" element={<RazasPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
