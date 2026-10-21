import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';

/**
 * Guardia de rutas protegidas (equivalente al atributo [Authorize] en tus Controllers de C#).
 * Si no existe una sesión activa en authService, redirige a /login guardando la ruta original
 * en location.state para volver automáticamente tras iniciar sesión.
 */
export function ProtectedRoute() {
  const session = authService.getCurrentSession();
  const location = useLocation();

  if (!session) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
}
