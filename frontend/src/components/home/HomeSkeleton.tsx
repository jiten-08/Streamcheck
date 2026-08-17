import { MovieRailSkeleton } from "@/components/movies/MovieRailSkeleton"
import { Skeleton } from "@/components/ui/skeleton"

export function HomeSkeleton() {
  return (
    <div className="container space-y-12 py-6" aria-label="Loading home page" aria-busy="true" data-testid="home-skeleton">
      <Skeleton className="min-h-[500px] w-full rounded-2xl sm:min-h-[540px]" />
      <MovieRailSkeleton />
      <MovieRailSkeleton landscape />
      <MovieRailSkeleton />
      <div><Skeleton className="mb-5 h-7 w-48" /><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">{[1, 2, 3, 4, 5, 6].map((item) => <Skeleton key={item} className="h-32 rounded-xl" />)}</div></div>
    </div>
  )
}

