import { motion } from "framer-motion"
import { Clock3, Info, Star, Trash2 } from "lucide-react"
import { useState } from "react"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import type { WatchlistItem } from "@/features/watchlist/types"
import { watchlistApi } from "@/features/watchlist/watchlistApi"

interface WatchlistMovieCardProps {
  item: WatchlistItem
  onRemoved: (item: WatchlistItem) => void
}

export function WatchlistMovieCard({ item, onRemoved }: WatchlistMovieCardProps) {
  const navigate = useNavigate()
  const [removing, setRemoving] = useState(false)
  const { movie } = item
  const artwork = movie.poster_url
    ? `linear-gradient(to top, rgb(0 0 0 / 95%), transparent 70%), url("${movie.poster_url}")`
    : `radial-gradient(circle at 72% 18%, ${movie.accent_color}b3 0%, transparent 34%), linear-gradient(145deg, ${movie.accent_color}66 0%, #18181b 48%, #09090b 100%)`

  const remove = async () => {
    setRemoving(true)
    try {
      await watchlistApi.remove(item.id)
      toast.success(`${movie.title} removed from your watchlist.`)
      onRemoved(item)
    } catch {
      toast.error("Unable to remove this movie.")
      setRemoving(false)
    }
  }

  return (
    <motion.article layout exit={{ opacity: 0, scale: 0.94 }} whileHover={{ y: -5 }} className="min-w-0 overflow-hidden rounded-xl border border-white/8 bg-card shadow-xl shadow-black/20" data-testid={`watchlist-card-${item.id}`}>
      <div className="relative aspect-[2/3] bg-cover bg-center" style={{ backgroundImage: artwork }}>
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgb(255_255_255/0.14)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.14)_1px,transparent_1px)] [background-size:22px_22px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/5 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-3.5">
          <span className="inline-flex rounded bg-black/45 px-2 py-1 text-[10px] font-semibold text-zinc-200 backdrop-blur">{movie.category.name}</span>
          <h2 className="mt-2 line-clamp-2 text-sm font-bold leading-tight text-white sm:text-base">{movie.title}</h2>
          <div className="mt-2 flex items-center gap-2 text-[10px] text-zinc-300 sm:text-xs"><span>{movie.year}</span><span className="flex items-center gap-1"><Clock3 className="size-3" />{movie.duration}</span><span className="ml-auto flex items-center gap-1 text-amber-300"><Star className="size-3 fill-current" />{movie.rating}</span></div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 p-2.5">
        <Button variant="danger" size="sm" loading={removing} onClick={() => void remove()} className="min-w-0 px-2 text-[11px] sm:text-xs" data-testid={`watchlist-remove-${item.id}`}><Trash2 /><span className="truncate">Remove</span></Button>
        <Button variant="outline" size="sm" onClick={() => navigate(`/movies/${movie.slug}`)} className="min-w-0 px-2 text-[11px] sm:text-xs" data-testid={`watchlist-details-${item.id}`}><Info /><span className="truncate">Details</span></Button>
      </div>
    </motion.article>
  )
}

