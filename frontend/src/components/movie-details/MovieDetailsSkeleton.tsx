import { Skeleton } from "@/components/ui/skeleton"

export function MovieDetailsSkeleton() {
  return (
    <div className="container py-8" aria-label="Loading movie details" aria-busy="true" data-testid="movie-details-loading">
      <Skeleton className="h-[360px] rounded-2xl sm:h-[440px] lg:h-[520px]" />
      <div className="relative mx-auto -mt-28 grid max-w-6xl gap-7 px-4 sm:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <Skeleton className="aspect-[2/3] w-full rounded-2xl" />
        <div className="space-y-4 pt-32 sm:pt-36"><Skeleton className="h-10 w-3/5" /><Skeleton className="h-5 w-2/5" /><Skeleton className="h-20 w-full" /><div className="flex gap-3"><Skeleton className="h-11 w-32" /><Skeleton className="h-11 w-32" /></div></div>
      </div>
    </div>
  )
}

