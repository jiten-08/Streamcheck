import { apiClient } from "@/services/api/client"
import type { PaginatedWatchlist, WatchlistItem } from "@/features/watchlist/types"

export const watchlistApi = {
  list: async (page = 1, signal?: AbortSignal) => {
    const { data } = await apiClient.get<PaginatedWatchlist>("watchlist/", {
      params: { page, page_size: 12 },
      signal,
    })
    return data
  },
  add: async (movieId: number) => {
    const { data } = await apiClient.post<WatchlistItem>("watchlist/", { movie_id: movieId })
    return data
  },
  remove: async (itemId: number) => {
    await apiClient.delete(`watchlist/${itemId}/`)
  },
}

