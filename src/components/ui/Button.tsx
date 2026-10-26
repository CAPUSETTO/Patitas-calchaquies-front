import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[#16A34A] hover:bg-[#15803D] active:bg-[#166534] text-white border border-[#15803D] shadow-[0_6px_16px_-4px_rgba(22,163,74,0.38)] focus-visible:ring-[#16A34A]',
  secondary:
    'bg-[#DC2626] hover:bg-[#B91C1C] active:bg-[#991B1B] text-white border border-[#B91C1C] shadow-[0_6px_16px_-4px_rgba(220,38,38,0.35)] focus-visible:ring-[#DC2626]',
  outline:
    'bg-white hover:bg-[#EDF4F0] active:bg-[#DCE6DF] text-[#0F291E] border border-[#B8CCC0] hover:border-[#8FA89B] focus-visible:ring-[#16A34A]',
  danger:
    'bg-[#DC2626] hover:bg-[#B91C1C] active:bg-[#991B1B] text-white border border-[#B91C1C] focus-visible:ring-[#DC2626]',
  ghost:
    'bg-transparent hover:bg-[#EDF4F0] active:bg-[#DCE6DF] text-[#2D4A3E] hover:text-[#0F291E] border border-transparent focus-visible:ring-[#527062]',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-[38px] px-3.5 py-1.5 text-xs gap-1.5 rounded-lg',
  md: 'min-h-[44px] px-4 py-2.5 text-sm gap-2 rounded-xl',
  lg: 'min-h-[50px] px-6 py-3 text-base gap-2.5 rounded-xl',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className = '',
  children,
  ...props
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      disabled={isDisabled}
      style={{ fontFamily: 'var(--font-display)' }}
      className={`
        inline-flex items-center justify-center font-bold tracking-tight
        transition-all duration-200 select-none cursor-pointer
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        disabled:opacity-50 disabled:pointer-events-none
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
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
