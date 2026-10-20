import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorAlertProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * ErrorAlert - Notificación de error de red o de API con capacidad de recuperación.
 * 
 * Enfoque Impeccable (harden.md):
 * - Los errores nunca deben ser mudos ni genéricos. Proveer un botón de reintento (`onRetry`)
 *   permite volver a solicitar datos a la API local sin tener que recargar toda la página web.
 */
export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  title = 'Ocurrió un error de comunicación',
  message,
  onRetry,
  className = '',
}) => {
  return (
    <div
      role="alert"
      className={`rounded-xl border border-red-200 bg-red-50/90 p-4 sm:p-5 text-red-900 ${className}`}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1 space-y-1">
          <h4 className="font-semibold text-sm sm:text-base text-red-950 tracking-tight">
            {title}
          </h4>
          <p className="text-xs sm:text-sm text-red-800 leading-relaxed break-words">
            {message}
          </p>

          {onRetry && (
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                className="border-red-300 text-red-900 hover:bg-red-100/80 active:bg-red-200"
              >
                Reintentar conexión
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
