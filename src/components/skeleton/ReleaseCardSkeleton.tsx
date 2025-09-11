'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function ReleaseCardSkeleton() {
  return (
    <div className="relative bg-card/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-accent/20">
      {/* Image Skeleton */}
      <div className="relative h-64 overflow-hidden">
        <Skeleton className="w-full h-full" />
        
        {/* Status Badge Skeleton */}
        <div className="absolute top-6 left-6">
          <Skeleton className="h-8 w-32 rounded-full" />
        </div>

        {/* Action Buttons Skeleton */}
        <div className="absolute top-6 right-6 flex space-x-2">
          <Skeleton className="w-12 h-12 rounded-full" />
          <Skeleton className="w-12 h-12 rounded-full" />
        </div>

        {/* Title and Location Skeleton */}
        <div className="absolute bottom-6 left-6 right-6">
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-1" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>

      {/* Content Container */}
      <div className="p-6">
        {/* Price Range Skeleton */}
        <div className="mb-6 p-4 bg-accent/5 rounded-xl border border-accent/10">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-3 w-20 mb-1" />
              <Skeleton className="h-6 w-40" />
            </div>
            <div className="text-right">
              <Skeleton className="h-5 w-8 mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>

        {/* Description Skeleton */}
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-6" />

        {/* Property Details Skeleton */}
        <div className="grid grid-cols-3 gap-4 mb-6 py-4 px-2 bg-accent/5 rounded-xl border border-accent/10">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="text-center">
              <Skeleton className="w-10 h-10 rounded-full mx-auto mb-2" />
              <Skeleton className="h-4 w-12 mx-auto mb-1" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </div>
          ))}
        </div>

        {/* Features Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-4 w-32 mb-3" />
          <div className="flex flex-wrap gap-2">
            {[...Array(4)].map((_, index) => (
              <Skeleton key={index} className="h-6 w-20 rounded-full" />
            ))}
          </div>
        </div>

        {/* Financing Options Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-4 w-28 mb-3" />
          <div className="flex flex-wrap gap-2">
            {[...Array(3)].map((_, index) => (
              <Skeleton key={index} className="h-6 w-24 rounded-full" />
            ))}
          </div>
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex space-x-3">
          <Skeleton className="flex-1 h-12 rounded-xl" />
          <Skeleton className="flex-1 h-12 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
