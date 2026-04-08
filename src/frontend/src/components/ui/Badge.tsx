import React from 'react';

interface BadgeProps {
  variant: 'success' | 'info' | 'warning' | 'error' | 'points';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant,
  children,
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium';
  
  const variantStyles = {
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    info: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    warning: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
    error: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    points: 'bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-lg shadow-amber-500/10 px-3 py-1.5 text-sm font-semibold rounded-lg',
  };
  
  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};
