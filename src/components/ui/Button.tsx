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
 * Button - Control táctil con línea estructural firme (#1C1917), tipografía Archivo
 * y respuesta mecánica de 90ms (.tab-snap).
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
  const baseStyles =
    'inline-flex items-center justify-center font-bold rounded-md tab-snap select-none focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-55 disabled:cursor-not-allowed cursor-pointer';

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-[#B84A27] text-white border-2 border-[#1C1917] hover:bg-[#9C3B1E] active:bg-[#7E2F17] focus-visible:outline-[#B84A27]',
    secondary:
      'bg-[#1C1917] text-[#FAF8F5] border-2 border-[#1C1917] hover:bg-stone-800 active:bg-stone-950 focus-visible:outline-[#1C1917]',
    outline:
      'bg-white text-[#1C1917] border-2 border-[#1C1917] hover:bg-[#F3EFEA] active:bg-[#E5DFD7] focus-visible:outline-[#B84A27]',
    ghost:
      'bg-transparent text-[#1C1917] border-2 border-transparent hover:border-[#1C1917] hover:bg-[#F3EFEA] focus-visible:outline-[#1C1917]',
    danger:
      'bg-red-700 text-white border-2 border-[#1C1917] hover:bg-red-800 active:bg-red-900 focus-visible:outline-red-700',
  };

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'text-xs px-3 py-2 min-h-[40px] gap-1.5',
    md: 'text-sm px-4 py-2.5 min-h-[44px] gap-2',
    lg: 'text-base px-5 py-3 min-h-[48px] gap-2.5',
  };

  return (
    <button
      disabled={disabled || isLoading}
      style={{ fontFamily: 'var(--font-display)' }}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
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
