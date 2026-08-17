import { motion } from "framer-motion"
import { Check, Clapperboard, Play, Plus, Star } from "lucide-react"
import { Link } from "react-router-dom"

import type { Movie } from "@/features/movies/types"
import { cn } from "@/lib/utils"

interface MovieCardProps {
  movie: Movie
  variant?: "poster" | "landscape"
  className?: string
}

export function MovieCard({ movie, variant = "poster", className }: MovieCardProps) {
  const landscape = variant === "landscape"
  return (
    <motion.article
      whileHover={{ y: -6, scale: 1.025 }}
      transition={{ type: "spring", stiffness: 360, damping: 25 }}
      className={cn("group relative shrink-0 overflow-hidden rounded-xl border border-white/8 bg-card shadow-xl shadow-black/20 focus-within:ring-2 focus-within:ring-primary", landscape ? "w-[280px] sm:w-[330px]" : "w-[165px] sm:w-[190px] lg:w-[205px]", className)}
      data-testid={`movie-card-${movie.id}`}
    >
      <div
        className={cn("relative overflow-hidden", landscape ? "aspect-video" : "aspect-[2/3]")}
        style={{ background: `radial-gradient(circle at 72% 18%, ${movie.accent}b3 0%, transparent 34%), linear-gradient(145deg, ${movie.accent}66 0%, #18181b 48%, #09090b 100%)` }}
      >
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgb(255_255_255/0.15)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.15)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
        <Clapperboard className={cn("absolute right-3 top-8 rotate-[-8deg] text-white/15 transition-transform duration-500 group-hover:rotate-0 group-hover:scale-110", landscape ? "size-28" : "size-24")} />
        {movie.rank && <span className="absolute -left-1 bottom-8 text-8xl font-black leading-none text-white/15 drop-shadow-xl">{movie.rank}</span>}
        {movie.isNew && <span className="absolute left-3 top-3 rounded-md bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">New</span>}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-3.5 sm:p-4">
          <div className="mb-2 flex translate-y-2 items-center gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
            <Link to={`/watch/${movie.slug}`} className="flex size-9 items-center justify-center rounded-full bg-white text-black shadow-lg transition-transform hover:scale-110" aria-label={`Play ${movie.title}`} data-testid={`play-movie-${movie.id}`}>
              <Play className="ml-0.5 size-4 fill-current" />
            </Link>
            <button type="button" className="flex size-9 items-center justify-center rounded-full border border-white/30 bg-black/35 text-white backdrop-blur transition-colors hover:bg-white/15" aria-label={`Add ${movie.title} to watchlist`}>
              <Plus className="size-4" />
            </button>
          </div>
          <h3 className={cn("font-bold tracking-tight text-white drop-shadow", landscape ? "text-lg" : "text-base")}>{movie.title}</h3>
          <div className="mt-1.5 flex items-center gap-2 text-[11px] text-zinc-300">
            <span className="font-semibold text-success">{movie.match}% Match</span>
            <span>{movie.year}</span>
            <span className="flex items-center gap-1"><Star className="size-3 fill-amber-400 text-amber-400" />{movie.rating}</span>
          </div>
        </div>
        {movie.progress !== undefined && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20">
            <div className="h-full rounded-r-full bg-primary" style={{ width: `${movie.progress}%` }} />
          </div>
        )}
      </div>
      {landscape && movie.progress !== undefined && (
        <div className="flex items-center justify-between bg-card px-4 py-3 text-xs text-muted-foreground">
          <span>{movie.progress}% watched</span><span className="flex items-center gap-1 text-zinc-300"><Check className="size-3.5 text-success" />Continue</span>
        </div>
      )}
    </motion.article>
  )
}
