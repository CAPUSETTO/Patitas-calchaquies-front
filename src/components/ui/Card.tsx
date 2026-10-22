import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  noPadding?: boolean;
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  noPadding = false,
  interactive = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`
        bg-white rounded-2xl border border-[#E2E8F0]
        shadow-[0_12px_28px_-12px_rgba(15,23,42,0.06)]
        ${noPadding ? '' : 'p-5 sm:p-6'}
        ${
          interactive
            ? 'transition-all duration-200 hover:border-[#93C5FD] hover:shadow-[0_18px_36px_-12px_rgba(37,99,235,0.14)] cursor-pointer'
            : ''
        }
        ${className}
      `}
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
  <div className={`px-5 py-4 border-b border-[#E2E8F0] ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <h3
    className={`font-bold text-base text-[#0F172A] tracking-tight ${className}`}
    style={{ fontFamily: 'var(--font-display)' }}
    {...props}
  >
    {children}
  </h3>
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
  <div className={`px-5 py-4 bg-[#F8FAFC] border-t border-[#E2E8F0] ${className}`} {...props}>
    {children}
  </div>
);
