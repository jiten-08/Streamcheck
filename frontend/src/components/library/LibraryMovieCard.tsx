import { motion } from "framer-motion"
import { Check, Clock3, Heart, Info, ListPlus, Play, Star } from "lucide-react"
import { useState } from "react"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import type { LibraryMovie } from "@/features/library/types"
import { watchlistApi } from "@/features/watchlist/watchlistApi"
import { cn } from "@/lib/utils"
import { tokenStorage } from "@/services/auth/tokenStorage"

interface LibraryMovieCardProps {
  movie: LibraryMovie
}

export function LibraryMovieCard({ movie }: LibraryMovieCardProps) {
  const navigate = useNavigate()
  const [favorite, setFavorite] = useState(false)
  const [watchlisted, setWatchlisted] = useState(movie.is_watchlisted)
  const [watchlistItemId, setWatchlistItemId] = useState<number | null>(movie.watchlist_item_id)
  const [watchlistBusy, setWatchlistBusy] = useState(false)
  const artwork = movie.poster_url
    ? `linear-gradient(to top, rgb(0 0 0 / 95%), transparent 70%), url("${movie.poster_url}")`
    : `radial-gradient(circle at 72% 18%, ${movie.accent_color}b3 0%, transparent 34%), linear-gradient(145deg, ${movie.accent_color}66 0%, #18181b 48%, #09090b 100%)`

  const toggleFavorite = () => {
    const next = !favorite
    setFavorite(next)
    toast.success(next ? `${movie.title} added to favorites.` : `${movie.title} removed from favorites.`)
  }

  const toggleWatchlist = async () => {
    if (!tokenStorage.getAccessToken()) {
      toast.error("Sign in to manage your watchlist.")
      navigate("/login")
      return
    }
    setWatchlistBusy(true)
    try {
      if (watchlisted && watchlistItemId) {
        await watchlistApi.remove(watchlistItemId)
        setWatchlisted(false)
        setWatchlistItemId(null)
        toast.success(`${movie.title} removed from your watchlist.`)
      } else {
        const item = await watchlistApi.add(movie.id)
        setWatchlisted(true)
        setWatchlistItemId(item.id)
        toast.success(`${movie.title} added to your watchlist.`)
      }
    } catch {
      toast.error("Unable to update your watchlist.")
    } finally {
      setWatchlistBusy(false)
    }
  }

  return (
    <motion.article whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 360, damping: 28 }} className="group min-w-0 overflow-hidden rounded-xl border border-white/8 bg-card shadow-xl shadow-black/20 focus-within:ring-2 focus-within:ring-primary" data-testid={`library-movie-card-${movie.id}`}>
      <div className="relative aspect-[2/3] overflow-hidden bg-cover bg-center" style={{ backgroundImage: artwork }}>
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgb(255_255_255/0.14)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.14)_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/5 to-black/20" />
        <button type="button" onClick={toggleFavorite} aria-label={favorite ? `Remove ${movie.title} from favorites` : `Add ${movie.title} to favorites`} aria-pressed={favorite} className={cn("absolute right-2.5 top-2.5 z-10 flex size-9 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white backdrop-blur transition-all hover:scale-110 hover:bg-black/70", favorite && "border-rose-400/40 bg-rose-500/20 text-rose-400")} data-testid={`favorite-button-${movie.id}`}><Heart className={cn("size-4", favorite && "fill-current")} /></button>
        <button type="button" onClick={() => navigate(`/watch/${movie.slug}`)} aria-label={`Play ${movie.title}`} className="absolute left-1/2 top-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 scale-75 items-center justify-center rounded-full bg-white text-black opacity-0 shadow-2xl transition-all duration-300 hover:scale-110 group-hover:scale-100 group-hover:opacity-100 group-focus-within:scale-100 group-focus-within:opacity-100" data-testid={`play-button-${movie.id}`}><Play className="ml-0.5 size-5 fill-current" /></button>
        <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
          <span className="mb-2 inline-flex rounded bg-black/45 px-2 py-1 text-[10px] font-semibold text-zinc-200 backdrop-blur">{movie.category.name}</span>
          <h2 className="line-clamp-2 text-sm font-bold leading-tight text-white sm:text-base">{movie.title}</h2>
          <div className="mt-2 flex items-center gap-2 text-[10px] text-zinc-300 sm:text-xs"><span>{movie.year}</span><span className="flex items-center gap-1"><Clock3 className="size-3" />{movie.duration}</span><span className="ml-auto flex items-center gap-1 text-amber-300"><Star className="size-3 fill-current" />{movie.rating}</span></div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 p-2.5">
        <Button type="button" variant={watchlisted ? "secondary" : "outline"} size="sm" loading={watchlistBusy} onClick={() => void toggleWatchlist()} className="min-w-0 px-2 text-[11px] sm:text-xs" aria-pressed={watchlisted} data-testid={`watchlist-button-${movie.id}`}>{watchlisted ? <Check /> : <ListPlus />}<span className="truncate">{watchlisted ? "Added" : "Watchlist"}</span></Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => navigate(`/movies/${movie.slug}`)} className="min-w-0 px-2 text-[11px] sm:text-xs" data-testid={`details-button-${movie.id}`}><Info /><span className="truncate">Details</span></Button>
      </div>
    </motion.article>
  )
}
