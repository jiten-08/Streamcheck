import type { ActivityEvent, WatchHistoryItem } from "@/features/profile/types"
import type { SubscriptionPlan } from "@/features/subscriptions/types"

export interface ReportFilters {
  start_date?: string
  end_date?: string
  activity_type?: string
  subscription_status?: string
}

export interface ReportSubscription {
  id: number
  plan: SubscriptionPlan
  status: "active" | "cancelled" | "expired"
  amount: string
  currency: string
  starts_at: string
  ends_at: string
  auto_renew: boolean
  created_at: string
}

export interface ReportsOverview {
  summary: {
    watch_history_count: number
    activity_count: number
    subscription_count: number
    total_spent: string
    active_plan: string | null
  }
  watch_history: WatchHistoryItem[]
  activity: ActivityEvent[]
  subscriptions: ReportSubscription[]
  viewing_by_day: { date: string; views: number }[]
  activity_breakdown: { name: string; value: number }[]
  spending: { date: string; amount: string; plan: string }[]
}
