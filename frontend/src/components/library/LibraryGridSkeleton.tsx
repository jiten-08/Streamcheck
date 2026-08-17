import { Skeleton } from "@/components/ui/skeleton"

export function LibraryGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-6" aria-label="Loading movie library" aria-busy="true" data-testid="library-loading">
      {Array.from({ length: 12 }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-xl border border-border bg-card"><Skeleton className="aspect-[2/3] w-full rounded-none" /><div className="grid grid-cols-2 gap-2 p-2.5"><Skeleton className="h-8" /><Skeleton className="h-8" /></div></div>
      ))}
    </div>
  )
}

