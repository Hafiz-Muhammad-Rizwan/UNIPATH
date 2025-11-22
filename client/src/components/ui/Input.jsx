import React, { forwardRef } from 'react';

const Input = forwardRef(({ 
  label = '',
  error = '',
  helpText = '',
  leftIcon = null,
  rightIcon = null,
  className = '',
  containerClassName = '',
  type = 'text',
  ...props 
}, ref) => {
  const baseClasses = 'w-full h-10 px-4 bg-white border rounded-lg text-secondary-900 placeholder-secondary-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-secondary-50 disabled:cursor-not-allowed';
  
  const borderClasses = error 
    ? 'border-red-300 focus:ring-red-500' 
    : 'border-secondary-200 hover:border-secondary-300';
  
  const iconPaddingLeft = leftIcon ? 'pl-10' : '';
  const iconPaddingRight = rightIcon ? 'pr-10' : '';
  
  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-secondary-700">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          className={`${baseClasses} ${borderClasses} ${iconPaddingLeft} ${iconPaddingRight} ${className}`}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400">
            {rightIcon}
          </div>
        )}
      </div>
      
      {helpText && !error && (
        <p className="text-xs text-secondary-500">{helpText}</p>
      )}
      
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
