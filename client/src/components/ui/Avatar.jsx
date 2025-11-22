import React from 'react';

const avatarSizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-24 h-24 text-2xl',
  '3xl': 'w-32 h-32 text-3xl',
};

const Avatar = ({ 
  src = '', 
  alt = '', 
  name = '',
  size = 'md',
  online = false,
  className = '',
  badge = null,
  ...props 
}) => {
  const sizeClasses = avatarSizes[size] || avatarSizes.md;
  
  const getInitials = (name) => {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  
  const getBgColor = (name) => {
    const colors = [
      'bg-primary-500',
      'bg-accent-500',
      'bg-blue-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
    ];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };
  
  return (
    <div className={`relative inline-block ${className}`} {...props}>
      <div className={`${sizeClasses} rounded-full overflow-hidden flex items-center justify-center border-2 border-white shadow-sm`}>
        {src ? (
          <img
            src={src}
            alt={alt || name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${getBgColor(name)} text-white font-semibold`}>
            {getInitials(name)}
          </div>
        )}
      </div>
      
      {online && (
        <span className="absolute bottom-0 right-0 block w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
      )}
      
      {badge && (
        <span className="absolute -bottom-1 -right-1">
          {badge}
        </span>
      )}
    </div>
  );
};

export const AvatarGroup = ({ children, max = 3, className = '' }) => {
  const childArray = React.Children.toArray(children);
  const visibleChildren = childArray.slice(0, max);
  const extraCount = childArray.length - max;
  
  return (
    <div className={`flex -space-x-2 ${className}`}>
      {visibleChildren}
      {extraCount > 0 && (
        <div className="w-10 h-10 rounded-full bg-secondary-200 border-2 border-white flex items-center justify-center text-xs font-semibold text-secondary-700">
          +{extraCount}
        </div>
      )}
    </div>
  );
};

export default Avatar;
