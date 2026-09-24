import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive' | 'flat' | 'ai';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', variant = 'default', children, ...props }, ref) => {
    const variantStyles = {
      default: 'bg-surface border border-border',
      interactive:
        'bg-surface border border-border hover:border-border-strong hover:bg-surface-hover transition-all duration-150 cursor-pointer',
      flat: 'bg-surface-elevated border border-border',
      ai: 'bg-surface border border-border hover:border-accent/40 transition-colors'
    };

    return (
      <div
        ref={ref}
        className={`rounded-lg ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = ({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-4 sm:p-5 pb-2 sm:pb-2 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={`text-sm sm:text-base font-semibold text-foreground tracking-tight flex items-center gap-2 ${className}`}
    {...props}
  >
    {children}
  </h3>
);

export const CardDescription = ({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={`text-xs text-foreground-muted mt-1 leading-relaxed ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent = ({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-4 sm:p-5 pt-2 sm:pt-2 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`p-4 pt-2.5 sm:p-5 sm:pt-2.5 border-t border-border flex items-center justify-between gap-2 text-xs ${className}`}
    {...props}
  >
    {children}
  </div>
);
