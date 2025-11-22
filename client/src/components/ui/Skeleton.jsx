import React from 'react';

const Skeleton = ({ 
  width = 'w-full', 
  height = 'h-4', 
  rounded = 'rounded-md',
  className = '',
  ...props 
}) => {
  return (
    <div
      className={`animate-pulse bg-secondary-200 ${width} ${height} ${rounded} ${className}`}
      {...props}
    />
  );
};

export const SkeletonCard = ({ lines = 3 }) => (
  <div className="bg-white rounded-xl p-6 shadow-md space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton width="w-12" height="h-12" rounded="rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton width="w-32" height="h-4" />
        <Skeleton width="w-24" height="h-3" />
      </div>
    </div>
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} width={i === lines - 1 ? 'w-2/3' : 'w-full'} height="h-3" />
      ))}
    </div>
  </div>
);

export const SkeletonPost = () => (
  <div className="bg-white rounded-xl p-6 shadow-md space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton width="w-12" height="h-12" rounded="rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton width="w-32" height="h-4" />
        <Skeleton width="w-24" height="h-3" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton width="w-full" height="h-3" />
      <Skeleton width="w-full" height="h-3" />
      <Skeleton width="w-3/4" height="h-3" />
    </div>
    <div className="flex gap-4 pt-3 border-t border-secondary-200">
      <Skeleton width="w-16" height="h-8" rounded="rounded-lg" />
      <Skeleton width="w-16" height="h-8" rounded="rounded-lg" />
      <Skeleton width="w-16" height="h-8" rounded="rounded-lg" />
    </div>
  </div>
);

export const SkeletonProfile = () => (
  <div className="bg-white rounded-xl p-6 shadow-md space-y-6">
    <div className="flex flex-col items-center gap-4">
      <Skeleton width="w-24" height="h-24" rounded="rounded-full" />
      <div className="text-center space-y-2 w-full">
        <Skeleton width="w-48" height="h-6" className="mx-auto" />
        <Skeleton width="w-32" height="h-4" className="mx-auto" />
      </div>
    </div>
    <div className="space-y-3">
      <Skeleton width="w-full" height="h-10" rounded="rounded-lg" />
      <Skeleton width="w-full" height="h-10" rounded="rounded-lg" />
      <Skeleton width="w-full" height="h-10" rounded="rounded-lg" />
    </div>
  </div>
);

export const SkeletonUserCard = () => (
  <div className="bg-white rounded-xl p-4 shadow-sm border border-secondary-200 space-y-3">
    <div className="flex items-center gap-3">
      <Skeleton width="w-12" height="h-12" rounded="rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton width="w-full" height="h-4" />
        <Skeleton width="w-3/4" height="h-3" />
      </div>
    </div>
    <div className="flex gap-2">
      <Skeleton width="w-full" height="h-9" rounded="rounded-lg" />
      <Skeleton width="w-full" height="h-9" rounded="rounded-lg" />
    </div>
  </div>
);

export default Skeleton;
