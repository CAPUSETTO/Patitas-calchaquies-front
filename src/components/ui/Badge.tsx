import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]',
  warning: 'bg-[#FFF7ED] text-[#9A3412] border-[#FED7AA]',
  danger: 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]',
  info: 'bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]',
  neutral: 'bg-[#F1F5F9] text-[#334155] border-[#CBD5E1]',
};

const dotStyles: Record<BadgeVariant, string> = {
  success: 'bg-[#059669]',
  warning: 'bg-[#F97316]',
  danger: 'bg-[#DC2626]',
  info: 'bg-[#2563EB]',
  neutral: 'bg-[#64748B]',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
  dot = false,
}) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold tracking-tight border
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotStyles[variant]}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
};
