import React, { useId } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

/**
 * Input - Campo de formulario accesible y optimizado para móvil.
 * 
 * Conceptos clave:
 * - `useId()`: Hook de React (desde React 18) que genera un identificador único y estable para
 *   vincular el `<label htmlFor={inputId}>` con el `<input id={inputId}>` sin colisiones.
 * - `text-base` (16px): En dispositivos móviles (Android / iOS), cualquier input con tamaño menor
 *   provoca un zoom involuntario de la pantalla. Usar 16px garantiza una experiencia nativa fluida.
 */
export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  id,
  disabled,
  className = '',
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-xs sm:text-sm font-semibold text-stone-800 tracking-tight"
        >
          {label}
        </label>
      )}

      <div className="relative rounded-lg shadow-2xs">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-500">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          disabled={disabled}
          className={`
            w-full rounded-lg bg-white border px-3.5 py-2.5 text-base sm:text-sm text-stone-900 
            placeholder:text-stone-500 caret-[#B84A27] transition-colors
            focus:outline-hidden focus:ring-2 focus:ring-offset-1
            disabled:bg-stone-100 disabled:text-stone-600 disabled:cursor-not-allowed
            min-h-[44px]
            ${leftIcon ? 'pl-10' : ''}
            ${error 
              ? 'border-red-600 focus:border-red-600 focus:ring-red-600/20' 
              : 'border-[#E5DFD7] focus:border-[#B84A27] focus:ring-[#B84A27]/20'
            }
            ${className}
          `}
          {...props}
        />
      </div>

      {error ? (
        <p className="text-xs text-red-600 font-medium" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-stone-500">
          {helperText}
        </p>
      ) : null}
    </div>
  );
};
