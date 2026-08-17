import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface MovieRailSkeletonProps {
  landscape?: boolean
}

export function MovieRailSkeleton({ landscape = false }: MovieRailSkeletonProps) {
  return (
    <section aria-label="Loading movies" aria-busy="true">
      <Skeleton className="mb-5 h-7 w-44" />
      <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div key={item} className={cn("shrink-0", landscape ? "w-[280px] sm:w-[330px]" : "w-[165px] sm:w-[190px] lg:w-[205px]")}>
            <Skeleton className={cn("w-full rounded-xl", landscape ? "aspect-video" : "aspect-[2/3]")} />
            {landscape && <Skeleton className="mt-2 h-8 w-full" />}
          </div>
        ))}
      </div>
    </section>
  )
}

