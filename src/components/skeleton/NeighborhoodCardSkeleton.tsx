'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function NeighborhoodCardSkeleton() {
  return (
    <div className="relative bg-card/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-accent/20">
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden">
        <Skeleton className="w-full h-full" />

        {/* Neighborhood Name Skeleton */}
        <div className="absolute bottom-6 left-6 right-6">
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>

      {/* Content Container */}
      <div className="p-6">
        {/* Average Price Skeleton */}
        <div className="mb-6 p-5 bg-accent/5 rounded-xl border border-accent/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div>
                <Skeleton className="h-3 w-16 mb-1" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
            <div className="text-right">
              <Skeleton className="h-5 w-8 mb-1" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        </div>

        {/* Highlights Skeleton */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Skeleton className="w-4 h-4" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex flex-wrap gap-2">
            {[...Array(3)].map((_, index) => (
              <Skeleton key={index} className="h-7 w-20 rounded-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
