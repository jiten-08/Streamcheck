import { Filter, Search, SlidersHorizontal, X } from "lucide-react"
import { useDeferredValue, useEffect, useMemo, useState } from "react"

import { LibraryGridSkeleton, LibraryMovieCard, LibraryPagination } from "@/components/library"
import { TextInput } from "@/components/auth/TextInput"
import { Button } from "@/components/ui/button"
import { libraryApi } from "@/features/library/libraryApi"
import type { LibraryCategory, MovieQuery, PaginatedMovies } from "@/features/library/types"

const selectClass = "h-10 min-w-0 rounded-lg border border-input bg-card px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/25"

interface RequestState {
  key: string
  data: PaginatedMovies | null
  error: string | null
}

export function MediaLibraryPage() {
  const [search, setSearch] = useState("")
  const deferredSearch = useDeferredValue(search.trim())
  const [category, setCategory] = useState("")
  const [rating, setRating] = useState("")
  const [year, setYear] = useState("")
  const [ordering, setOrdering] = useState("-release_date")
  const [page, setPage] = useState(1)
  const [retry, setRetry] = useState(0)
  const [categories, setCategories] = useState<LibraryCategory[]>([])
  const [requestState, setRequestState] = useState<RequestState>({ key: "", data: null, error: null })

  const query = useMemo<MovieQuery>(() => ({
    search: deferredSearch,
    category,
    min_rating: rating,
    release_year: year,
    ordering,
    page,
    page_size: 12,
  }), [category, deferredSearch, ordering, page, rating, year])
  const requestKey = `${JSON.stringify(query)}:${retry}`
  const loading = requestState.key !== requestKey
  const data = requestState.key === requestKey ? requestState.data : null
  const error = requestState.key === requestKey ? requestState.error : null
  const activeFilters = [category, rating, year].filter(Boolean).length

  useEffect(() => {
    const controller = new AbortController()
    libraryApi.getCategories(controller.signal).then(setCategories).catch(() => undefined)
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    libraryApi.getMovies(query, controller.signal)
      .then((response) => setRequestState({ key: requestKey, data: response, error: null }))
      .catch(() => {
        if (!controller.signal.aborted) {
          setRequestState({ key: requestKey, data: null, error: "The media library could not be loaded." })
        }
      })
    return () => controller.abort()
  }, [query, requestKey, retry])

  const resetPage = (callback: () => void) => {
    callback()
    setPage(1)
  }

  const clearFilters = () => {
    setCategory("")
    setRating("")
    setYear("")
    setOrdering("-release_date")
    setPage(1)
  }

  const changePage = (nextPage: number) => {
    setPage(nextPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="container py-8 sm:py-10" data-testid="media-library-page">
      <header className="relative mb-8 overflow-hidden rounded-2xl border border-white/8 bg-card px-5 py-8 sm:px-8 sm:py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgb(99_102_241/0.22),transparent_32%),linear-gradient(120deg,transparent,rgb(99_102_241/0.06))]" />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-300"><SlidersHorizontal className="size-3.5" />Media Library</span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Find your next favorite</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">Search and filter the complete StreamCheck catalog.</p>
        </div>
      </header>

      <section className="mb-7 space-y-3 rounded-xl border border-border bg-card/60 p-3 backdrop-blur sm:p-4" aria-label="Library controls">
        <TextInput icon={Search} value={search} onChange={(event) => resetPage(() => setSearch(event.target.value))} placeholder="Search titles, descriptions, or categories…" aria-label="Search movies" data-testid="library-search-input" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1.2fr_auto]">
          <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">Category
            <select value={category} onChange={(event) => resetPage(() => setCategory(event.target.value))} className={selectClass} data-testid="library-category-filter">
              <option value="">All categories</option>
              {categories.map((item) => <option key={item.id} value={item.slug}>{item.name} ({item.movie_count ?? 0})</option>)}
            </select>
          </label>
          <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">Minimum rating
            <select value={rating} onChange={(event) => resetPage(() => setRating(event.target.value))} className={selectClass} data-testid="library-rating-filter">
              <option value="">Any rating</option><option value="8">8.0+</option><option value="7">7.0+</option><option value="6">6.0+</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">Release year
            <select value={year} onChange={(event) => resetPage(() => setYear(event.target.value))} className={selectClass} data-testid="library-year-filter">
              <option value="">Any year</option><option value="2026">2026</option><option value="2025">2025</option><option value="2024">2024</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-xs font-medium text-muted-foreground">Sort by
            <select value={ordering} onChange={(event) => resetPage(() => setOrdering(event.target.value))} className={selectClass} data-testid="library-sort-select">
              <option value="-release_date">Newest first</option><option value="release_date">Oldest first</option><option value="-rating">Highest rated</option><option value="title">Title A–Z</option><option value="-duration_minutes">Longest first</option>
            </select>
          </label>
          <div className="flex items-end">
            <Button variant="ghost" size="md" onClick={clearFilters} disabled={!activeFilters && ordering === "-release_date"} className="w-full lg:w-auto" data-testid="library-clear-filters"><X />Clear{activeFilters > 0 && ` (${activeFilters})`}</Button>
          </div>
        </div>
      </section>

      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground" role="status" data-testid="library-result-count">
          {loading ? "Loading titles…" : `${data?.count ?? 0} title${data?.count === 1 ? "" : "s"} found`}
        </p>
        {activeFilters > 0 && <span className="flex items-center gap-1.5 text-xs font-medium text-indigo-300"><Filter className="size-3.5" />{activeFilters} active filter{activeFilters === 1 ? "" : "s"}</span>}
      </div>

      {loading ? (
        <LibraryGridSkeleton />
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-12 text-center" data-testid="library-error"><p className="font-semibold text-destructive">Unable to load movies</p><p className="mt-2 text-sm text-muted-foreground">{error}</p><Button className="mt-5" variant="outline" onClick={() => setRetry((value) => value + 1)}>Try again</Button></div>
      ) : data?.results.length ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-6" data-testid="library-movie-grid">
            {data.results.map((movie) => <LibraryMovieCard key={movie.id} movie={movie} />)}
          </div>
          <LibraryPagination page={data.page} totalPages={data.total_pages} onPageChange={changePage} />
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card/40 px-5 py-16 text-center" data-testid="library-empty-state"><Search className="mx-auto size-9 text-muted-foreground" /><h2 className="mt-4 text-lg font-semibold">No movies found</h2><p className="mt-2 text-sm text-muted-foreground">Try a different search or clear your filters.</p><Button variant="outline" className="mt-5" onClick={clearFilters}>Clear filters</Button></div>
      )}
    </div>
  )
}
