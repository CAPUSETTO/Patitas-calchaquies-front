import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

/**
 * EmptyState - Estado vacío con propósito pedagógico y llamada a la acción.
 * 
 * Enfoque Impeccable (operate.md):
 * - Las pantallas vacías no deben decir simplemente "No hay datos", sino orientar al usuario
 *   sobre qué representa esta sección y permitirle dar el primer paso operativo.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`
        flex flex-col items-center justify-center text-center p-8 sm:p-12 
        rounded-xl border border-dashed border-[#E5DFD7] bg-white/60 ${className}
      `}
    >
      <div className="w-12 h-12 rounded-full bg-[#F3EFEA] border border-[#E5DFD7] flex items-center justify-center text-[#B84A27] mb-3.5">
        <Icon className="w-6 h-6 stroke-[1.75]" />
      </div>

      <h3 className="font-semibold text-base sm:text-lg text-stone-900 tracking-tight mb-1">
        {title}
      </h3>

      <p className="text-xs sm:text-sm text-stone-600 max-w-sm mb-5 leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button variant="primary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
