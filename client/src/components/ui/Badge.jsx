import React from 'react';

const badgeVariants = {
  primary: 'bg-primary-100 text-primary-700 border-primary-200',
  secondary: 'bg-secondary-100 text-secondary-700 border-secondary-200',
  accent: 'bg-accent-100 text-accent-700 border-accent-200',
  success: 'bg-green-100 text-green-700 border-green-200',
  warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  error: 'bg-red-100 text-red-700 border-red-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
};

const badgeSizes = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-2.5 py-1',
  lg: 'text-base px-3 py-1.5',
};

const Badge = ({ 
  children, 
  variant = 'primary',
  size = 'sm',
  dot = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center gap-1.5 rounded-full font-medium border';
  const variantClasses = badgeVariants[variant] || badgeVariants.primary;
  const sizeClasses = badgeSizes[size] || badgeSizes.sm;
  
  return (
    <span
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      )}
      {children}
    </span>
  );
};

export const NotificationBadge = ({ count = 0, max = 99, className = '' }) => {
  if (count === 0) return null;
  
  const displayCount = count > max ? `${max}+` : count;
  
  return (
    <span className={`absolute -top-1 -right-1 flex items-center justify-center min-w-5 h-5 px-1 text-xs font-bold text-white bg-red-500 rounded-full border-2 border-white ${className}`}>
      {displayCount}
    </span>
  );
};

export default Badge;
