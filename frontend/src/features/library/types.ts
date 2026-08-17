export interface LibraryCategory {
  id: number
  name: string
  slug: string
  description?: string
  movie_count?: number
}

export interface LibraryMovie {
  id: number
  title: string
  slug: string
  tagline: string
  description: string
  category: Pick<LibraryCategory, "id" | "name" | "slug">
  release_date: string
  year: number
  duration_minutes: number
  duration: string
  rating: string
  maturity_rating: string
  poster_url: string | null
  video_url: string
  accent_color: string
  is_featured: boolean
  is_watchlisted: boolean
  watchlist_item_id: number | null
}

export interface CastCredit {
  id: number
  name: string
  slug: string
  character: string
  order: number
  photo_url: string | null
}

export interface MovieDetails extends LibraryMovie {
  cast: CastCredit[]
}

export interface PaginatedMovies {
  count: number
  page: number
  page_size: number
  total_pages: number
  next: string | null
  previous: string | null
  results: LibraryMovie[]
}

export interface MovieQuery {
  search?: string
  category?: string
  min_rating?: string
  release_year?: string
  ordering?: string
  page?: number
  page_size?: number
}
