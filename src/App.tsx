import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { AnimalesPage } from './pages/AnimalesPage';
import { AdopcionesPage } from './pages/AdopcionesPage';
import { AtencionesPage } from './pages/AtencionesPage';
import { PersonasPage } from './pages/PersonasPage';
import { VacunasPage } from './pages/VacunasPage';
import { MedicamentosPage } from './pages/MedicamentosPage';
import { RazasPage } from './pages/RazasPage';
import { UsuariosPage } from './pages/UsuariosPage';

/**
 * App - Router Principal (SPA) dividido en dos superficies Impeccable:
 * 1. Superficie Pública (Modo Persuade): `/` (LandingPage) y `/login` (LoginPage)
 * 2. Superficie Operativa Protegida (Modo Operate): `/admin/*` con los 8 módulos de gestión.
 */
export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Rutas Públicas (Comunidad y Adoptantes + Login de Personal) */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* 2. Rutas Administrativas Protegidas (Equivalente a [Authorize] en C#) */}
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route path="animales" element={<AnimalesPage />} />
            <Route path="adopciones" element={<AdopcionesPage />} />
            <Route path="atenciones" element={<AtencionesPage />} />
            <Route path="personas" element={<PersonasPage />} />
            <Route path="vacunas" element={<VacunasPage />} />
            <Route path="medicamentos" element={<MedicamentosPage />} />
            <Route path="razas" element={<RazasPage />} />
            <Route path="usuarios" element={<UsuariosPage />} />
          </Route>
        </Route>

        {/* Redirección de rutas cortas al área administrativa */}
        <Route path="/animales" element={<Navigate to="/admin/animales" replace />} />
        <Route path="/adopciones" element={<Navigate to="/admin/adopciones" replace />} />
        <Route path="/atenciones" element={<Navigate to="/admin/atenciones" replace />} />
        <Route path="/personas" element={<Navigate to="/admin/personas" replace />} />
        <Route path="/vacunas" element={<Navigate to="/admin/vacunas" replace />} />
        <Route path="/medicamentos" element={<Navigate to="/admin/medicamentos" replace />} />
        <Route path="/razas" element={<Navigate to="/admin/razas" replace />} />
        <Route path="/usuarios" element={<Navigate to="/admin/usuarios" replace />} />

        {/* Fallback general */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
