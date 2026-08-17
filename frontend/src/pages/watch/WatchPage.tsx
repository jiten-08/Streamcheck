import { ArrowLeft, Clapperboard } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"

import { VideoPlayer } from "@/components/video-player"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { libraryApi } from "@/features/library/libraryApi"
import type { MovieDetails } from "@/features/library/types"
import { profileApi } from "@/features/profile/profileApi"
import { useAppSelector } from "@/hooks/redux"

interface WatchState {
  slug: string
  movie: MovieDetails | null
  error: string | null
}

export function WatchPage() {
  const { slug = "" } = useParams()
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const [state, setState] = useState<WatchState>({ slug: "", movie: null, error: null })
  const loading = state.slug !== slug

  useEffect(() => {
    const controller = new AbortController()
    libraryApi.getMovie(slug, controller.signal)
      .then((movie) => {
        if (!controller.signal.aborted) {
          setState({ slug, movie, error: null })
          if (isAuthenticated) void profileApi.recordWatch(movie.id).catch(() => undefined)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ slug, movie: null, error: "This title is unavailable." })
      })
    return () => controller.abort()
  }, [isAuthenticated, slug])

  return (
    <main className="min-h-screen bg-black px-3 py-4 text-white sm:px-6 sm:py-6" data-testid="watch-page">
      <div className="mx-auto max-w-[100rem]">
        <header className="mb-4 flex items-center justify-between gap-4">
          <Link to={state.movie ? `/movies/${state.movie.slug}` : "/library"} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/10 hover:text-white" data-testid="watch-back-link"><ArrowLeft className="size-4" />Back</Link>
          <div className="flex items-center gap-2 text-sm font-semibold"><span className="flex size-8 items-center justify-center rounded-lg bg-primary"><Clapperboard className="size-4" /></span><span className="hidden sm:inline">StreamCheck Player</span></div>
        </header>

        {loading ? (
          <Skeleton className="aspect-video w-full rounded-xl bg-zinc-900" />
        ) : state.error || !state.movie ? (
          <div className="flex aspect-video flex-col items-center justify-center rounded-xl border border-white/10 bg-zinc-950 text-center"><h1 className="text-xl font-semibold">Unable to play this title</h1><p className="mt-2 text-sm text-zinc-400">{state.error}</p><Button asChild variant="outline" className="mt-6"><Link to="/library">Return to library</Link></Button></div>
        ) : !state.movie.video_url ? (
          <div className="flex aspect-video flex-col items-center justify-center rounded-xl border border-white/10 bg-zinc-950 px-5 text-center" role="alert" data-testid="video-unavailable"><h1 className="text-xl font-semibold">Video unavailable</h1><p className="mt-2 max-w-md text-sm text-zinc-400">This title does not have a working video link yet.</p><Button asChild variant="outline" className="mt-6"><Link to={`/movies/${state.movie.slug}`}>Back to movie details</Link></Button></div>
        ) : (
          <>
            <VideoPlayer key={state.movie.video_url} src={state.movie.video_url} title={state.movie.title} poster={state.movie.poster_url ?? undefined} autoPlay />
            <div className="mt-4 flex flex-col justify-between gap-2 px-1 sm:flex-row sm:items-center"><div><h1 className="font-semibold sm:text-lg">{state.movie.title}</h1><p className="mt-1 text-xs text-zinc-500">{state.movie.category.name} · {state.movie.year} · {state.movie.duration}</p></div><p className="text-xs text-zinc-500">Focus the player and press <kbd className="rounded bg-white/10 px-1.5 py-0.5 text-zinc-300">?</kbd> for shortcuts</p></div>
          </>
        )}
      </div>
    </main>
  )
}
