import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './Button';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/**
 * ConfirmModal - Modal accesible para confirmación de acciones destructivas o críticas (bajas/eliminaciones).
 * 
 * Conceptos clave de React:
 * - `useEffect`: Este hook se ejecuta como un "efecto secundario" cuando el modal se abre o se cierra (`[isOpen, onClose]`).
 *   Aquí lo usamos para:
 *   1. Escuchar la tecla `Escape` en el teclado y cerrar el modal automáticamente.
 *   2. Bloquear el scroll del `<body>` para evitar que el usuario desplace la página detrás del modal.
 *   3. Devolver una función de limpieza (cleanup function) que remueve el event listener y restaura el scroll.
 *      (Equivalente a un `Dispose()` o `using` en C#).
 */
export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    // Manejar tecla Escape
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };

    // Bloquear scroll de la página de fondo
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    // Función de limpieza al desmontar o cerrar
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
    >
      {/* Fondo translúcido con desenfoque suave */}
      <div
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
        onClick={() => !isLoading && onClose()}
        aria-hidden="true"
      />

      {/* Contenedor del Modal */}
      <div className="relative w-full max-w-md bg-white rounded-2xl border border-[#E5DFD7] shadow-xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center shrink-0
              ${variant === 'danger' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-[#B84A27]'}
            `}>
              <AlertTriangle className="w-5 h-5 stroke-[2]" />
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="text-stone-400 hover:text-stone-700 p-1 rounded-lg transition-colors cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-3.5 space-y-2">
            <h3 id="modal-title" className="font-bold text-lg text-stone-900 tracking-tight">
              {title}
            </h3>
            <p className="text-sm text-stone-600 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Botones de acción táctil */}
          <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {cancelLabel}
            </Button>
            <Button
              type="button"
              variant={variant === 'danger' ? 'danger' : 'primary'}
              onClick={onConfirm}
              isLoading={isLoading}
              className="w-full sm:w-auto"
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
