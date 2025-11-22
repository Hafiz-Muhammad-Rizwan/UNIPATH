import React from 'react';

const cardVariants = {
  default: 'bg-white border border-secondary-200',
  elevated: 'bg-white shadow-md hover:shadow-lg',
  flat: 'bg-secondary-50',
  gradient: 'bg-gradient-to-br from-primary-50 to-accent-50',
};

const Card = ({ 
  children, 
  variant = 'default',
  padding = 'md',
  hover = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'rounded-xl transition-all duration-200';
  
  const variantClasses = cardVariants[variant] || cardVariants.default;
  
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    none: '',
  }[padding] || 'p-6';
  
  const hoverClasses = hover ? 'hover:shadow-lg cursor-pointer transform hover:-translate-y-1' : '';
  
  return (
    <div
      className={`${baseClasses} ${variantClasses} ${paddingClasses} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`mb-4 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-xl font-semibold text-secondary-900 ${className}`}>
    {children}
  </h3>
);

export const CardDescription = ({ children, className = '' }) => (
  <p className={`text-sm text-secondary-600 mt-1 ${className}`}>
    {children}
  </p>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`mt-4 pt-4 border-t border-secondary-200 ${className}`}>
    {children}
  </div>
);

export default Card;
