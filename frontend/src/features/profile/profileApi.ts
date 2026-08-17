import { apiClient } from "@/services/api/client"
import type { ActivityEvent, DashboardPage, WatchHistoryItem } from "./types"

export const profileApi = {
  watchHistory: async () => {
    const { data } = await apiClient.get<DashboardPage<WatchHistoryItem>>("watch-history/")
    return data
  },
  activity: async () => {
    const { data } = await apiClient.get<DashboardPage<ActivityEvent>>("activity/")
    return data
  },
  recordWatch: async (movieId: number, progressSeconds = 0, completed = false) => {
    const { data } = await apiClient.post<WatchHistoryItem>("watch-history/", {
      movie_id: movieId,
      progress_seconds: progressSeconds,
      completed,
    })
    return data
  },
}
