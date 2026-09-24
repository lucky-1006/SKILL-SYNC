import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'ai' | 'neutral' | 'outline';
  size?: 'sm' | 'md';
}

export const Badge = ({
  className = '',
  variant = 'neutral',
  size = 'md',
  children,
  ...props
}: BadgeProps) => {
  const sizeStyles = {
    sm: 'text-[10px] font-mono px-1.5 py-0.2 rounded gap-1 font-medium',
    md: 'text-xs font-mono px-2 py-0.5 rounded gap-1.5 font-medium'
  };

  const variantStyles = {
    primary: 'bg-accent/10 text-accent border border-accent/25',
    success: 'bg-accent/10 text-accent border border-accent/25',
    warning: 'bg-warning/10 text-warning border border-warning/25',
    error: 'bg-destructive/10 text-destructive border border-destructive/25',
    ai: 'bg-accent/10 text-accent border border-accent/25',
    neutral: 'bg-surface-elevated text-foreground-muted border border-border',
    outline: 'bg-transparent text-foreground-muted border border-border'
  };

  return (
    <span
      className={`inline-flex items-center tracking-tight transition-colors select-none ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
