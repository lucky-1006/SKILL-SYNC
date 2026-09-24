import React from 'react';

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  showPercent?: boolean;
  color?: 'indigo' | 'emerald' | 'amber' | 'purple' | 'blue' | 'accent' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercent = true,
  color = 'accent',
  size = 'md',
  className = ''
}) => {
  const clamped = Math.max(0, Math.min(max, value));
  const percent = Math.round((clamped / max) * 100);

  const colorStyles: Record<string, string> = {
    accent: 'bg-accent',
    emerald: 'bg-accent',
    indigo: 'bg-accent',
    purple: 'bg-accent',
    blue: 'bg-info',
    amber: 'bg-warning',
    warning: 'bg-warning'
  };

  const sizeStyles = {
    sm: 'h-1',
    md: 'h-1.5',
    lg: 'h-2'
  };

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between text-xs text-foreground-muted">
          {label && <span className="font-medium text-foreground">{label}</span>}
          {showPercent && (
            <span className="font-mono text-[11px] text-foreground font-semibold">{percent}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-surface-elevated border border-border rounded-full overflow-hidden ${sizeStyles[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${colorStyles[color] || 'bg-accent'}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
