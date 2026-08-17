import { motion } from "framer-motion"
import { ArrowLeft, CalendarDays, Check, Clock3, Heart, ListPlus, Play, Star } from "lucide-react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { Link, useNavigate, useParams } from "react-router-dom"

import { LibraryMovieCard } from "@/components/library"
import { CastList, MovieDetailsSkeleton } from "@/components/movie-details"
import { Button } from "@/components/ui/button"
import { libraryApi } from "@/features/library/libraryApi"
import type { LibraryMovie, MovieDetails } from "@/features/library/types"
import { watchlistApi } from "@/features/watchlist/watchlistApi"
import { cn } from "@/lib/utils"
import { tokenStorage } from "@/services/auth/tokenStorage"

interface DetailsState {
  slug: string
  movie: MovieDetails | null
  related: LibraryMovie[]
  error: string | null
}

export function MovieDetailsPage() {
  const { slug = "" } = useParams()
  const navigate = useNavigate()
  const [favoriteSlug, setFavoriteSlug] = useState<string | null>(null)
  const [watchlistOverride, setWatchlistOverride] = useState<{ slug: string; active: boolean; itemId: number | null } | null>(null)
  const [watchlistBusy, setWatchlistBusy] = useState(false)
  const [state, setState] = useState<DetailsState>({ slug: "", movie: null, related: [], error: null })
  const loading = state.slug !== slug
  const favorite = favoriteSlug === slug

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
    const controller = new AbortController()
    libraryApi.getMovie(slug, controller.signal)
      .then(async (movie) => {
        const related = await libraryApi.getRelatedMovies(slug, controller.signal).catch(() => [])
        if (!controller.signal.aborted) setState({ slug, movie, related, error: null })
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ slug, movie: null, related: [], error: "This movie could not be found." })
      })
    return () => controller.abort()
  }, [slug])

  if (loading) return <MovieDetailsSkeleton />
  if (state.error || !state.movie) {
    return <div className="container py-24 text-center" data-testid="movie-details-error"><h1 className="text-2xl font-bold">Movie unavailable</h1><p className="mt-2 text-muted-foreground">{state.error}</p><Button asChild variant="outline" className="mt-6"><Link to="/library"><ArrowLeft />Back to library</Link></Button></div>
  }

  const movie = state.movie
  const watchlisted = watchlistOverride?.slug === slug ? watchlistOverride.active : movie.is_watchlisted
  const watchlistItemId = watchlistOverride?.slug === slug ? watchlistOverride.itemId : movie.watchlist_item_id
  const releaseDate = new Intl.DateTimeFormat("en", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${movie.release_date}T00:00:00`))
  const posterArtwork = movie.poster_url
    ? `linear-gradient(to top, rgb(0 0 0 / 80%), transparent), url("${movie.poster_url}")`
    : `radial-gradient(circle at 72% 18%, ${movie.accent_color}cc 0%, transparent 34%), linear-gradient(145deg, ${movie.accent_color}77 0%, #18181b 48%, #09090b 100%)`

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
        setWatchlistOverride({ slug, active: false, itemId: null })
        toast.success("Removed from your watchlist.")
      } else {
        const item = await watchlistApi.add(movie.id)
        setWatchlistOverride({ slug, active: true, itemId: item.id })
        toast.success("Added to your watchlist.")
      }
    } catch {
      toast.error("Unable to update your watchlist.")
    } finally {
      setWatchlistBusy(false)
    }
  }

  const toggleFavorite = () => {
    const next = !favorite
    setFavoriteSlug(next ? slug : null)
    toast.success(next ? "Added to favorites." : "Removed from favorites.")
  }

  return (
    <div data-testid="movie-details-page">
      <section className="relative isolate min-h-[420px] overflow-hidden sm:min-h-[500px] lg:min-h-[580px]" aria-label={`${movie.title} banner`} data-testid="movie-banner">
        <div className="absolute inset-0 scale-105 bg-cover bg-center blur-sm" style={{ backgroundImage: posterArtwork }} />
        <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 75% 25%, ${movie.accent_color}55, transparent 38%)` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/20" />
        <div className="container relative z-10 pt-7"><Link to="/library" className="inline-flex items-center gap-2 rounded-lg bg-black/30 px-3 py-2 text-sm font-medium text-zinc-300 backdrop-blur transition-colors hover:bg-black/50 hover:text-white" data-testid="details-back-link"><ArrowLeft className="size-4" />Back to library</Link></div>
      </section>

      <div className="container relative z-10 -mt-52 pb-14 sm:-mt-64 lg:-mt-80">
        <div className="grid gap-7 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10">
          <motion.div initial={{ opacity: 0, y: 28, rotate: -2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ type: "spring", stiffness: 220, damping: 24 }} className="mx-auto w-52 overflow-hidden rounded-2xl border border-white/15 shadow-2xl shadow-black/60 sm:w-60 lg:mx-0 lg:w-[280px]" data-testid="movie-large-poster">
            <div className="relative aspect-[2/3] bg-cover bg-center" style={{ backgroundImage: posterArtwork }}><div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgb(255_255_255/0.14)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.14)_1px,transparent_1px)] [background-size:25px_25px]" /><div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent p-5 pt-24"><p className="text-xl font-black uppercase leading-tight text-white">{movie.title}</p></div></div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 26 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, duration: 0.5 }} className="pt-1 text-center lg:self-end lg:pb-2 lg:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs lg:justify-start"><span className="rounded-md bg-primary px-2.5 py-1 font-bold uppercase tracking-wider text-white">{movie.category.name}</span>{movie.is_featured && <span className="rounded-md border border-amber-300/30 bg-amber-300/10 px-2.5 py-1 font-semibold text-amber-300">Featured</span>}<span className="rounded border border-white/20 px-2 py-1 text-zinc-300">{movie.maturity_rating}</span></div>
            <h1 className="mt-4 text-4xl font-black tracking-[-0.035em] text-white sm:text-5xl lg:text-6xl" data-testid="movie-title">{movie.title}</h1>
            <p className="mt-3 text-base font-medium text-indigo-300 sm:text-lg">{movie.tagline}</p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-zinc-300 lg:justify-start">
              <span className="flex items-center gap-1.5 font-semibold text-amber-300"><Star className="size-4 fill-current" />{movie.rating}/10</span>
              <span className="flex items-center gap-1.5"><CalendarDays className="size-4 text-muted-foreground" />{releaseDate}</span>
              <span className="flex items-center gap-1.5"><Clock3 className="size-4 text-muted-foreground" />{movie.duration}</span>
            </div>
            <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-zinc-300 sm:text-base lg:mx-0" data-testid="movie-description">{movie.description}</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3 lg:justify-start">
              <Button size="lg" className="bg-white text-black hover:bg-zinc-200" disabled={!movie.video_url} onClick={() => navigate(`/watch/${movie.slug}`)} data-testid="details-play-button"><Play className="fill-current" />{movie.video_url ? "Play movie" : "Video unavailable"}</Button>
              <Button size="lg" variant={watchlisted ? "secondary" : "outline"} loading={watchlistBusy} onClick={() => void toggleWatchlist()} aria-pressed={watchlisted} data-testid="details-watchlist-button">{watchlisted ? <Check /> : <ListPlus />}{watchlisted ? "In watchlist" : "Watchlist"}</Button>
              <Button size="icon" variant="outline" className={cn("size-12 rounded-full", favorite && "border-rose-400/50 bg-rose-500/10 text-rose-400")} onClick={toggleFavorite} aria-label={favorite ? "Remove from favorites" : "Add to favorites"} aria-pressed={favorite} data-testid="details-favorite-button"><Heart className={cn(favorite && "fill-current")} /></Button>
            </div>
          </motion.div>
        </div>

        <div className="mt-14 space-y-14">
          <CastList cast={movie.cast} accent={movie.accent_color} />
          <section aria-labelledby="related-title" data-testid="related-movies-section">
            <h2 id="related-title" className="text-xl font-bold tracking-tight sm:text-2xl">Related movies</h2>
            <p className="mt-1 text-sm text-muted-foreground">More in {movie.category.name}</p>
            {state.related.length ? <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-6">{state.related.map((relatedMovie) => <LibraryMovieCard key={relatedMovie.id} movie={relatedMovie} />)}</div> : <p className="mt-5 rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">No related titles yet.</p>}
          </section>
        </div>
      </div>
    </div>
  )
}
