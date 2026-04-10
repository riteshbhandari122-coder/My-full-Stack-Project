import React from 'react';

const ProductCardSkeleton = () => (
  <div className="bg-white rounded-xl overflow-hidden shadow-card animate-pulse">
    <div className="aspect-square bg-gray-200" />
    <div className="p-3 space-y-2">
      <div className="h-3 bg-gray-200 rounded w-1/3" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-4/5" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="h-5 bg-gray-200 rounded w-1/3" />
      <div className="h-8 bg-gray-200 rounded" />
    </div>
  </div>
);

export default ProductCardSkeleton;
