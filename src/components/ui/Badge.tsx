import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

/**
 * Badge - Sello técnico de estado con borde firme y tipografía tabular.
 */
export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  dot = false,
  className = '',
  ...props
}) => {
  const variantStyles: Record<BadgeVariant, { container: string; dot: string }> = {
    success: {
      container: 'bg-[#DCFCE7] text-[#14532D] border-[#14532D]',
      dot: 'bg-[#15803D]',
    },
    warning: {
      container: 'bg-[#FEF3C7] text-[#78350F] border-[#78350F]',
      dot: 'bg-[#B45309]',
    },
    danger: {
      container: 'bg-[#FEE2E2] text-[#7F1D1D] border-[#7F1D1D]',
      dot: 'bg-[#B91C1C]',
    },
    info: {
      container: 'bg-[#DBEAFE] text-[#1E3A8A] border-[#1E3A8A]',
      dot: 'bg-[#1D4ED8]',
    },
    neutral: {
      container: 'bg-[#F3EFEA] text-[#1C1917] border-[#1C1917]',
      dot: 'bg-[#57534E]',
    },
  };

  const currentVariant = variantStyles[variant];

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm text-xs font-bold
        border select-none tabular-data ${currentVariant.container} ${className}
      `}
      {...props}
    >
      {dot && (
        <span className={`w-2 h-2 rounded-none ${currentVariant.dot}`} aria-hidden="true" />
      )}
      <span>{children}</span>
    </span>
  );
};
