import type { LibraryMovie } from "@/features/library/types"

export interface WatchHistoryItem {
  id: number
  movie: LibraryMovie
  progress_seconds: number
  completed: boolean
  first_watched_at: string
  last_watched_at: string
}

export type ActivityType = "watched" | "profile" | "avatar" | "password" | "subscription"

export interface ActivityEvent {
  id: number
  event_type: ActivityType
  title: string
  description: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface DashboardPage<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}
