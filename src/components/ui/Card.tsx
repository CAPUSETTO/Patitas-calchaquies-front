import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * Card - Contenedor modular de contenido con bordes nítidos y sin sombras pesadas.
 * 
 * Enfoque Impeccable:
 * - Evita "AI slop" (gradientes decorativos o sombras desenfocadas exageradas).
 * - Utiliza un fondo blanco limpio (`bg-white`) con borde mineral (`border-[#E5DFD7]`).
 * - Añade `min-w-0` para prevenir desbordamientos indeseados en Flexbox/Grid (`/harden`).
 */
export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`min-w-0 bg-white rounded-xl border border-[#E5DFD7] overflow-hidden ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`px-5 py-4 border-b border-[#E5DFD7]/70 flex items-center justify-between gap-3 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <h3 className={`font-semibold text-base sm:text-lg text-stone-900 truncate tracking-tight ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <p className={`text-xs sm:text-sm text-stone-600 ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`p-5 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`px-5 py-3.5 bg-[#FAF8F5]/80 border-t border-[#E5DFD7]/70 flex items-center justify-end gap-2.5 ${className}`} {...props}>
    {children}
  </div>
);
