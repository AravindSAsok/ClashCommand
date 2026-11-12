import * as React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, delay = 0, ...props }, ref) => (
    <div
      ref={ref}
      role="progressbar"
      aria-busy="true"
      aria-label="Loading..."
      className={cn(
        "animate-pulse rounded-md bg-gray-200",
        className,
      )}
      style={{ animationDelay: `${delay}ms` }}
      {...props}
    />
  ),
);
Skeleton.displayName = "Skeleton";

export { Skeleton };