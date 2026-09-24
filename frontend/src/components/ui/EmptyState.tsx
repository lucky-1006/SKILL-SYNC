import React from 'react';
import { LucideIcon, FolderSearch } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon | React.ReactNode;
  actionText?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionText,
  actionLabel,
  onAction,
  className = ''
}) => {
  const buttonText = actionLabel || actionText;

  const renderIcon = () => {
    if (!icon) return <FolderSearch className="w-5 h-5 text-foreground-subtle" />;
    if (React.isValidElement(icon)) return icon;
    const IconComponent = icon as LucideIcon;
    return <IconComponent className="w-5 h-5 text-foreground-subtle" />;
  };

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-lg border border-dashed border-border bg-surface-elevated/40 ${className}`}
    >
      <div className="p-2.5 bg-surface rounded-md border border-border mb-3 flex items-center justify-center">
        {renderIcon()}
      </div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="text-xs text-foreground-muted max-w-sm mt-1 mb-4 leading-relaxed">
        {description}
      </p>
      {buttonText && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction}>
          {buttonText}
        </Button>
      )}
    </div>
  );
};
