import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
}

/**
 * Badge - Etiqueta semántica de estado para animales y procesos.
 * 
 * Enfoque Impeccable:
 * - Alto contraste garantizado para exteriores bajo luz solar directa.
 * - Vocabulario estandarizado de estados según la dirección "Tierra y Pizarra Calchaquí".
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
      container: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
      dot: 'bg-emerald-600',
    },
    warning: {
      container: 'bg-amber-50 text-amber-900 border-amber-200/80',
      dot: 'bg-amber-600',
    },
    danger: {
      container: 'bg-rose-50 text-rose-800 border-rose-200/80',
      dot: 'bg-rose-600',
    },
    info: {
      container: 'bg-blue-50 text-blue-800 border-blue-200/80',
      dot: 'bg-blue-600',
    },
    neutral: {
      container: 'bg-stone-100 text-stone-700 border-stone-200',
      dot: 'bg-stone-500',
    },
  };

  const currentVariant = variantStyles[variant];

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold
        border select-none tracking-tight ${currentVariant.container} ${className}
      `}
      {...props}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${currentVariant.dot}`} aria-hidden="true" />
      )}
      <span>{children}</span>
    </span>
  );
};
