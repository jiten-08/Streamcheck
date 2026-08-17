import { apiClient } from "@/services/api/client"
import type { LibraryCategory, LibraryMovie, MovieDetails, MovieQuery, PaginatedMovies } from "@/features/library/types"

export const libraryApi = {
  getMovies: async (query: MovieQuery, signal?: AbortSignal) => {
    const params = Object.fromEntries(
      Object.entries(query).filter(([, value]) => value !== "" && value !== undefined),
    )
    const { data } = await apiClient.get<PaginatedMovies>("movies/", { params, signal })
    return data
  },
  getCategories: async (signal?: AbortSignal) => {
    const { data } = await apiClient.get<LibraryCategory[]>("categories/", { signal })
    return data
  },
  getMovie: async (slug: string, signal?: AbortSignal) => {
    const { data } = await apiClient.get<MovieDetails>(`movies/${slug}/`, { signal })
    return data
  },
  getRelatedMovies: async (slug: string, signal?: AbortSignal) => {
    const { data } = await apiClient.get<LibraryMovie[]>(`movies/${slug}/related/`, { signal })
    return data
  },
}
