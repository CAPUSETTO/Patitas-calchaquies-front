import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/**
 * Skeleton - Bloque estructural para estados de carga.
 * 
 * Enfoque Impeccable (operate.md):
 * - En sistemas de gestión operativa, se prefieren skeletons que respetan el diseño de la grilla
 *   en lugar de spinners solitarios en medio de la pantalla que provocan saltos de contenido (CLS).
 */
export const Skeleton: React.FC<SkeletonProps> = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse rounded-md bg-stone-200/80 ${className}`}
      aria-hidden="true"
      {...props}
    />
  );
};
