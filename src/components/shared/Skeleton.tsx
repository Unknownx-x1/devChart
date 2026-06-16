import React from "react";

interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-300 rounded-lg ${className}`} />
  );
}

export function TaskCardSkeleton() {
  return (
    <div className="flex flex-col h-auto w-full self-start rounded-2xl border-2 border-black overflow-hidden bg-white/70 p-4 gap-3 shadow-sm">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-3/4 bg-gray-400/50" />
        <Skeleton className="h-4 w-1/4 bg-gray-400/30" />
      </div>
      <Skeleton className="h-12 w-full bg-gray-400/20" />
      <div className="flex justify-between items-center mt-2 pt-2 border-t border-dashed border-black/10">
        <Skeleton className="h-5 w-16 rounded-full bg-gray-400/30" />
        <Skeleton className="h-7 w-7 rounded-full bg-gray-400/40" />
      </div>
    </div>
  );
}
