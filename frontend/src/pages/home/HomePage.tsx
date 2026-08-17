import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"

import { GenreGrid, HeroBanner, HomeSkeleton } from "@/components/home"
import { MovieRail } from "@/components/movies"
import {
  continueWatching,
  featuredMovie,
  genres,
  latestReleases,
  popularMovies,
  recommendedMovies,
  trendingMovies,
} from "@/features/movies/data"

export function HomePage() {
  const { hash, key: locationKey } = useLocation()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 650)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (loading) return

    if (!hash) {
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }

    const sectionId = decodeURIComponent(hash.slice(1))
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [hash, loading, locationKey])

  if (loading) return <HomeSkeleton />

  return (
    <div className="container space-y-10 py-6 sm:space-y-12 sm:py-8" data-testid="home-page">
      <HeroBanner movie={featuredMovie} />
      <MovieRail id="trending" title="Trending now" subtitle="What everyone is watching this week" movies={trendingMovies} />
      <MovieRail id="continue-watching" title="Continue watching" subtitle="Pick up right where you left off" movies={continueWatching} variant="landscape" />
      <MovieRail id="popular" title="Popular on StreamCheck" movies={popularMovies} />
      <MovieRail id="recommended" title="Recommended for you" subtitle="Curated from your viewing taste" movies={recommendedMovies} />
      <GenreGrid genres={genres} />
      <MovieRail id="latest" title="Latest releases" subtitle="Fresh stories, added recently" movies={latestReleases} />
    </div>
  )
}
