import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/**
 * Button - Componente base reutilizable con soporte táctil (Android) y estados accesibles.
 * 
 * Conceptos clave:
 * - Extiende `React.ButtonHTMLAttributes<HTMLButtonElement>`: hereda todas las propiedades nativas
 *   de un `<button>` de HTML (`onClick`, `type`, `disabled`, etc.) con tipado estricto (cero `any`).
 * - Prop `isLoading`: previene el doble envío desactivando el botón (`disabled={disabled || isLoading}`)
 *   y reemplaza o acompaña con un icono de carga giratorio (`Loader2`).
 */
export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  ...props
}) => {
  // 1. Estilos base comunes a cualquier botón (ergonomía táctil de min 44px de alto)
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all select-none focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]';

  // 2. Variantes de color según la paleta "Tierra y Pizarra Calchaquí"
  const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-[#B84A27] text-white hover:bg-[#9C3B1E] active:bg-[#7E2F17] focus-visible:outline-[#B84A27] shadow-xs',
    secondary: 'bg-[#F3EFEA] text-stone-800 hover:bg-[#EAE4DC] active:bg-[#DDD5CA] border border-[#E5DFD7] focus-visible:outline-stone-500',
    outline: 'bg-transparent text-stone-800 border border-[#E5DFD7] hover:bg-[#F3EFEA] active:bg-[#EAE4DC] focus-visible:outline-[#B84A27]',
    ghost: 'bg-transparent text-stone-700 hover:bg-[#F3EFEA] hover:text-stone-900 focus-visible:outline-stone-500',
    danger: 'bg-red-700 text-white hover:bg-red-800 active:bg-red-900 focus-visible:outline-red-700 shadow-xs',
  };

  // 3. Tamaños con altura mínima accesible
  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'text-xs px-3 py-2 min-h-[38px] gap-1.5',
    md: 'text-sm px-4 py-2.5 min-h-[44px] gap-2',
    lg: 'text-base px-5 py-3 min-h-[48px] gap-2.5',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
