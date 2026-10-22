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
    'bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] text-white border border-[#1D4ED8] shadow-[0_6px_16px_-4px_rgba(37,99,235,0.35)] focus-visible:ring-[#2563EB]',
  secondary:
    'bg-[#F97316] hover:bg-[#EA580C] active:bg-[#C2410C] text-white border border-[#EA580C] shadow-[0_6px_16px_-4px_rgba(249,115,22,0.35)] focus-visible:ring-[#F97316]',
  outline:
    'bg-white hover:bg-[#F1F5F9] active:bg-[#E2E8F0] text-[#0F172A] border border-[#CBD5E1] hover:border-[#94A3B8] focus-visible:ring-[#2563EB]',
  danger:
    'bg-[#DC2626] hover:bg-[#B91C1C] active:bg-[#991B1B] text-white border border-[#B91C1C] focus-visible:ring-[#DC2626]',
  ghost:
    'bg-transparent hover:bg-[#F1F5F9] active:bg-[#E2E8F0] text-[#334155] hover:text-[#0F172A] border border-transparent focus-visible:ring-[#64748B]',
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
