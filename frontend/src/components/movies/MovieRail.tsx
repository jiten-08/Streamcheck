import { ChevronRight } from "lucide-react"

import { MovieCard } from "@/components/movies/MovieCard"
import type { Movie } from "@/features/movies/types"

interface MovieRailProps {
  id: string
  title: string
  subtitle?: string
  movies: Movie[]
  variant?: "poster" | "landscape"
}

export function MovieRail({ id, title, subtitle, movies, variant = "poster" }: MovieRailProps) {
  return (
    <section id={id} className="scroll-mt-24" aria-labelledby={`${id}-title`} data-testid={`${id}-section`}>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div><h2 id={`${id}-title`} className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>{subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}</div>
        <button type="button" className="group flex shrink-0 items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">View all<ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" /></button>
      </div>
      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-5 pt-2 [scrollbar-width:none] sm:-mx-6 sm:gap-4 sm:px-6 lg:-mx-2 lg:px-2 [&::-webkit-scrollbar]:hidden">
        {movies.map((movie) => <div key={movie.id} className="snap-start"><MovieCard movie={movie} variant={variant} /></div>)}
      </div>
    </section>
  )
}

