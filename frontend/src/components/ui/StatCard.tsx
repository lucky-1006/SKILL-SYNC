import React from 'react';
import { Card } from './Card';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  description?: string;
  icon?: LucideIcon | React.ReactNode;
  trend?: {
    value: string | number;
    isPositive?: boolean;
  };
  accentColor?: 'indigo' | 'emerald' | 'amber' | 'purple' | 'blue';
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  description,
  icon,
  trend,
  onClick,
  className = ''
}) => {
  const sub = subtitle || description;

  const renderIcon = () => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return icon;
    }
    const IconComponent = icon as LucideIcon;
    return <IconComponent className="w-4 h-4 text-foreground-subtle" />;
  };

  return (
    <Card
      variant={onClick ? 'interactive' : 'default'}
      onClick={onClick}
      className={`p-4 sm:p-5 relative ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-[11px] font-mono uppercase tracking-wider text-foreground-subtle">
            {title}
          </p>
          <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
            {value}
          </div>
        </div>

        {icon && (
          <div className="p-2 rounded-md bg-surface-elevated border border-border flex items-center justify-center shrink-0">
            {renderIcon()}
          </div>
        )}
      </div>

      {(sub || trend) && (
        <div className="mt-3 flex items-center gap-2 text-xs text-foreground-muted pt-2 border-t border-border">
          {trend && (
            <span
              className={`inline-flex items-center font-medium font-mono text-[11px] ${
                trend.isPositive ? 'text-accent' : 'text-destructive'
              }`}
            >
              {trend.isPositive ? (
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
              ) : (
                <ArrowDownRight className="w-3 h-3 mr-0.5" />
              )}
              {typeof trend.value === 'number' ? `+${trend.value}%` : trend.value}
            </span>
          )}
          {sub && <span className="truncate text-foreground-subtle text-[11px]">{sub}</span>}
        </div>
      )}
    </Card>
  );
};
