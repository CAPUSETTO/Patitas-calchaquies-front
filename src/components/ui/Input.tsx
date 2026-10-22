import React, { useId } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, helperText, leftIcon, rightIcon, className = '', id, required, ...props },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-bold text-[#0F172A] tracking-tight"
          >
            {label}
            {required && <span className="text-[#F97316] ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none flex items-center">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={`
              w-full min-h-[44px] py-2.5 rounded-xl border bg-white text-[#0F172A] text-base
              placeholder:text-[#64748B] transition-all duration-150
              focus:outline-none focus:ring-2 focus:ring-[#2563EB]/25 focus:border-[#2563EB]
              disabled:bg-[#F1F5F9] disabled:text-[#64748B] disabled:cursor-not-allowed
              ${leftIcon ? 'pl-10' : 'pl-3.5'}
              ${rightIcon ? 'pr-10' : 'pr-3.5'}
              ${
                error
                  ? 'border-[#DC2626] focus:ring-[#DC2626]/25 focus:border-[#DC2626]'
                  : 'border-[#CBD5E1] hover:border-[#94A3B8]'
              }
              ${className}
            `}
            {...props}
          />

          {rightIcon && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] flex items-center">
              {rightIcon}
            </span>
          )}
        </div>

        {error && (
          <p id={errorId} role="alert" className="text-xs font-bold text-[#DC2626] mt-1">
            {error}
          </p>
        )}

        {!error && helperText && (
          <p id={helperId} className="text-xs text-[#475569] mt-1">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
