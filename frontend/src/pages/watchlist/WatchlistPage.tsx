import type { AxiosError } from "axios"
import { AnimatePresence, motion } from "framer-motion"
import { BookmarkX, Film, LogIn } from "lucide-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { LibraryGridSkeleton, LibraryPagination } from "@/components/library"
import { WatchlistMovieCard } from "@/components/watchlist"
import { Button } from "@/components/ui/button"
import type { PaginatedWatchlist } from "@/features/watchlist/types"
import { watchlistApi } from "@/features/watchlist/watchlistApi"
import { tokenStorage } from "@/services/auth/tokenStorage"

interface WatchlistState {
  key: string
  data: PaginatedWatchlist | null
  error: "unauthorized" | "failed" | null
}

export function WatchlistPage() {
  const [page, setPage] = useState(1)
  const [refresh, setRefresh] = useState(0)
  const [state, setState] = useState<WatchlistState>({ key: "", data: null, error: null })
  const hasStoredToken = Boolean(tokenStorage.getAccessToken())
  const requestKey = `${page}:${refresh}`
  const loading = state.key !== requestKey
  const data = state.key === requestKey ? state.data : null
  const error = state.key === requestKey ? state.error : null

  useEffect(() => {
    if (!hasStoredToken) return
    const controller = new AbortController()
    watchlistApi.list(page, controller.signal)
      .then((response) => {
        if (!controller.signal.aborted) setState({ key: requestKey, data: response, error: null })
      })
      .catch((requestError: AxiosError) => {
        if (!controller.signal.aborted) setState({ key: requestKey, data: null, error: requestError.response?.status === 401 ? "unauthorized" : "failed" })
      })
    return () => controller.abort()
  }, [hasStoredToken, page, refresh, requestKey])

  const handleRemoved = () => {
    if (data?.results.length === 1 && page > 1) setPage((value) => value - 1)
    else setRefresh((value) => value + 1)
  }

  if (!hasStoredToken || error === "unauthorized") {
    return <div className="container flex min-h-[65vh] items-center justify-center py-16" data-testid="watchlist-auth-state"><div className="max-w-md text-center"><span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary"><LogIn className="size-8" /></span><h1 className="mt-5 text-2xl font-bold">Sign in to view your watchlist</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Keep your saved movies synced and ready on every device.</p><Button asChild className="mt-6"><Link to="/login">Sign in</Link></Button></div></div>
  }

  return (
    <div className="container py-8 sm:py-10" data-testid="watchlist-page">
      <header className="relative mb-8 overflow-hidden rounded-2xl border border-white/8 bg-card px-5 py-8 sm:px-8 sm:py-10"><div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgb(99_102_241/0.24),transparent_30%)]" /><div className="relative"><span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-300"><Film className="size-3.5" />My Watchlist</span><h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Saved for later</h1><p className="mt-3 text-sm text-muted-foreground">Your personal collection, ready when you are.</p></div></header>

      {loading ? <LibraryGridSkeleton /> : error === "failed" ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-14 text-center" data-testid="watchlist-error"><p className="font-semibold text-destructive">Unable to load your watchlist</p><Button variant="outline" className="mt-5" onClick={() => setRefresh((value) => value + 1)}>Try again</Button></div>
      ) : data?.results.length ? (
        <><div className="mb-5 text-sm text-muted-foreground" role="status">{data.count} saved title{data.count === 1 ? "" : "s"}</div><motion.div layout className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-6" data-testid="watchlist-grid"><AnimatePresence>{data.results.map((item) => <WatchlistMovieCard key={item.id} item={item} onRemoved={handleRemoved} />)}</AnimatePresence></motion.div><LibraryPagination page={data.page} totalPages={data.total_pages} onPageChange={(nextPage) => { setPage(nextPage); window.scrollTo({ top: 0, behavior: "smooth" }) }} /></>
      ) : (
        <div className="flex min-h-[46vh] items-center justify-center rounded-2xl border border-dashed border-border bg-card/30 px-5 py-16 text-center" data-testid="watchlist-empty-state"><div className="max-w-sm"><span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-secondary text-muted-foreground"><BookmarkX className="size-8" /></span><h2 className="mt-5 text-xl font-bold">Your watchlist is empty</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Browse the library and save anything you want to watch later.</p><Button asChild className="mt-6"><Link to="/library">Browse movies</Link></Button></div></div>
      )}
    </div>
  )
}
