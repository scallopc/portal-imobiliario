'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function PropertyCardSkeleton() {
  return (
    <div className="relative bg-card/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-accent/20">
      {/* Image Skeleton */}
      <div className="relative h-72 overflow-hidden">
        <Skeleton className="w-full h-full" />
        
        {/* Price Badge Skeleton */}
        <div className="absolute top-6 left-6">
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>

        {/* Neighborhood Badge Skeleton */}
        <div className="absolute bottom-6 left-6">
          <Skeleton className="h-8 w-32 rounded-full" />
        </div>
      </div>

      {/* Content Container */}
      <div className="p-8">
        {/* Title Skeleton */}
        <Skeleton className="h-8 w-full mb-4" />
        <Skeleton className="h-6 w-3/4 mb-6" />

        {/* Description Skeleton */}
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-6" />

        {/* Property Specifications Skeleton */}
        <div className="grid grid-cols-4 gap-6 mb-6 py-4 px-2 bg-accent/5 rounded-xl border border-accent/10">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="text-center">
              <Skeleton className="w-12 h-12 rounded-full mx-auto mb-2" />
              <Skeleton className="h-5 w-8 mx-auto mb-1" />
              <Skeleton className="h-3 w-12 mx-auto" />
            </div>
          ))}
        </div>

        {/* Features Skeleton */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {[...Array(3)].map((_, index) => (
              <Skeleton key={index} className="h-7 w-20 rounded-full" />
            ))}
          </div>
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex space-x-4">
          <Skeleton className="flex-1 h-12 rounded-xl" />
          <Skeleton className="flex-1 h-12 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
