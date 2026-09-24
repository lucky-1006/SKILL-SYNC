'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'ai';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-md transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.99]';

    const sizeStyles = {
      sm: 'text-xs px-2.5 py-1.5 gap-1.5',
      md: 'text-xs sm:text-sm px-3.5 py-2 gap-2',
      lg: 'text-sm px-4 py-2.5 gap-2'
    };

    const variantStyles = {
      primary:
        'bg-accent hover:bg-accent-hover text-background font-semibold shadow-none border border-transparent',
      secondary:
        'bg-surface-elevated hover:bg-surface-hover text-foreground border border-border',
      outline:
        'bg-transparent hover:bg-surface-elevated text-foreground border border-border',
      ghost:
        'bg-transparent hover:bg-surface-elevated text-foreground-muted hover:text-foreground',
      danger:
        'bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/25',
      ai:
        'bg-surface-elevated hover:bg-surface-hover text-accent border border-accent/30'
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
