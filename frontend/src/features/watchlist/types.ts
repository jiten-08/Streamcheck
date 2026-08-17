import type { LibraryMovie } from "@/features/library/types"

export interface WatchlistItem {
  id: number
  movie: LibraryMovie
  added_at: string
}

export interface PaginatedWatchlist {
  count: number
  page: number
  page_size: number
  total_pages: number
  next: string | null
  previous: string | null
  results: WatchlistItem[]
}

