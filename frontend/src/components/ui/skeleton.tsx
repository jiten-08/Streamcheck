import type { HTMLAttributes } from "react"

import { cn } from "@/lib/utils"

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gradient-to-r from-muted via-zinc-700/70 to-muted bg-[length:200%_100%]", className)}
      aria-hidden="true"
      {...props}
    />
  )
}

export function CardSkeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("space-y-4 rounded-xl border bg-card p-6", className)} aria-busy="true" aria-label="Loading content" {...props}>
      <Skeleton className="h-5 w-2/5" />
      <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-4/5" /></div>
      <Skeleton className="h-10 w-28" />
    </div>
  )
}

