import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"

import { ActivityTimelineCard, ChangePasswordCard, PersonalInformationCard, ProfileHero, ProfileNavigation, SubscriptionDetailsCard, WatchHistoryCard } from "@/components/profile"
import { Skeleton } from "@/components/ui/skeleton"
import { authApi, getApiErrorMessage } from "@/features/auth/authApi"
import { authenticated } from "@/features/auth/authSlice"
import type { UserProfile } from "@/features/auth/types"
import { profileApi } from "@/features/profile/profileApi"
import type { ActivityEvent, WatchHistoryItem } from "@/features/profile/types"
import { subscriptionApi } from "@/features/subscriptions/subscriptionApi"
import type { Subscription } from "@/features/subscriptions/types"
import { useAppDispatch, useAppSelector } from "@/hooks/redux"

export function ProfilePage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [history, setHistory] = useState<WatchHistoryItem[]>([])
  const [activity, setActivity] = useState<ActivityEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) { navigate("/login", { replace: true, state: { returnTo: "/profile" } }); return }
    let current = true
    Promise.allSettled([authApi.getProfile(), subscriptionApi.current(), profileApi.watchHistory(), profileApi.activity()]).then((results) => {
      if (!current) return
      const [profileResult, subscriptionResult, historyResult, activityResult] = results
      if (profileResult.status === "fulfilled") { setProfile(profileResult.value); dispatch(authenticated(profileResult.value)) }
      else toast.error(getApiErrorMessage(profileResult.reason, "Unable to load your profile."))
      if (subscriptionResult.status === "fulfilled") setSubscription(subscriptionResult.value)
      if (historyResult.status === "fulfilled") setHistory(historyResult.value.results)
      if (activityResult.status === "fulfilled") setActivity(activityResult.value.results)
      setLoading(false)
    })
    return () => { current = false }
  }, [dispatch, isAuthenticated, navigate])

  const updateProfile = (next: UserProfile) => { setProfile(next); dispatch(authenticated(next)); profileApi.activity().then((data) => setActivity(data.results)).catch(() => undefined) }
  const refreshActivity = () => { profileApi.activity().then((data) => setActivity(data.results)).catch(() => undefined) }

  if (loading) return <div className="container space-y-6 py-8 sm:py-12"><Skeleton className="h-44 rounded-xl" /><div className="grid gap-6 lg:grid-cols-[15rem_1fr]"><Skeleton className="h-64 rounded-xl" /><div className="space-y-6"><Skeleton className="h-96 rounded-xl" /><Skeleton className="h-64 rounded-xl" /></div></div></div>
  if (!profile) return <div className="container flex min-h-[60vh] items-center justify-center py-16 text-center"><div><h1 className="text-2xl font-bold">Profile unavailable</h1><p className="mt-2 text-muted-foreground">Please sign in again to open your dashboard.</p></div></div>

  return <div className="relative overflow-hidden"><div className="pointer-events-none absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(circle_at_20%_0%,rgba(99,102,241,0.13),transparent_55%)]" /><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="container relative space-y-6 py-8 sm:py-12">
    <ProfileHero profile={profile} onUpdated={updateProfile} />
    <div className="grid items-start gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
      <ProfileNavigation />
      <div className="min-w-0 space-y-6">
        <PersonalInformationCard profile={profile} onUpdated={updateProfile} />
        <SubscriptionDetailsCard subscription={subscription} loading={false} />
        <WatchHistoryCard items={history} loading={false} />
        <ActivityTimelineCard events={activity} loading={false} />
        <ChangePasswordCard onChanged={refreshActivity} />
      </div>
    </div>
  </motion.div></div>
}
