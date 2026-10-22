import React, { useId } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
}

/**
 * Input - Campo de formulario técnico con borde firme de alto contraste (#1C1917)
 * y tipografía Atkinson Hyperlegible a 16px para máxima claridad en Android.
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
          className="block text-sm font-bold text-[#1C1917]"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-600">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          disabled={disabled}
          className={`
            w-full rounded-md bg-white border-2 px-3.5 py-2.5 text-base text-[#1C1917]
            placeholder:text-stone-500 caret-[#B84A27] tab-snap
            focus:outline-hidden focus:ring-2 focus:ring-[#B84A27]
            disabled:bg-[#F3EFEA] disabled:text-stone-600 disabled:cursor-not-allowed
            min-h-[44px]
            ${leftIcon ? 'pl-10' : ''}
            ${
              error
                ? 'border-red-700 focus:border-red-700'
                : 'border-[#1C1917] focus:border-[#B84A27]'
            }
            ${className}
          `}
          {...props}
        />
      </div>

      {error ? (
        <p className="text-xs text-red-700 font-bold" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p className="text-xs text-stone-600">{helperText}</p>
      ) : null}
    </div>
  );
};
