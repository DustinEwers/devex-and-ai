import React from 'react';

interface CardProps {
  variant?: 'default' | 'elevated' | 'recognition';
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  children,
  className = '',
}) => {
  const baseStyles = 'bg-slate-800 rounded-lg p-6';
  
  const variantStyles = {
    default: 'border border-slate-700 shadow-lg hover:border-slate-600 transition-all',
    elevated: 'border border-slate-700 shadow-2xl ring-1 ring-slate-600/50',
    recognition: 'border-l-4 border-l-blue-500 border border-slate-700 shadow-md transition-all',
  };
  
  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </div>
  );
};
