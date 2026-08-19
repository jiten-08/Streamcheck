import { Camera, Clock3, History, KeyRound, Sparkles, UserRound } from "lucide-react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { qaFaultsEnabled } from "@/config/qaFaults"
import type { ActivityEvent, ActivityType } from "@/features/profile/types"

const icons = { watched: History, profile: UserRound, avatar: Camera, password: KeyRound, subscription: Sparkles } satisfies Record<ActivityType, typeof History>
interface Props { events: ActivityEvent[]; loading: boolean }

export function ActivityTimelineCard({ events, loading }: Props) {
  const displayedEvents = qaFaultsEnabled && events.length ? [events[0], ...events] : events
  return <Card id="activity" className="scroll-mt-24" data-testid="activity-timeline-card"><CardHeader><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-indigo-400"><Clock3 className="size-5" /></span><div><h2 className="text-lg font-bold">Activity timeline</h2><p className="text-sm text-muted-foreground">Recent changes and viewing activity.</p></div></div></CardHeader><CardContent>
    {loading ? <div className="space-y-5">{[1,2,3].map((item) => <Skeleton key={item} className="h-16 rounded-xl" />)}</div> : displayedEvents.length ? <ol className="relative ml-4 border-l border-border">{displayedEvents.map((event, index) => { const Icon = icons[event.event_type]; return <li key={`${event.id}-${index}`} className="relative pb-7 pl-8 last:pb-0" data-testid={`activity-event-${event.id}`}><span className="absolute -left-4 top-0 flex size-8 items-center justify-center rounded-full border bg-card text-indigo-400"><Icon className="size-4" /></span><div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between"><div><h3 className="text-sm font-semibold">{event.title}</h3><p className="mt-1 text-sm text-muted-foreground">{event.description}</p></div><time className="shrink-0 text-xs text-muted-foreground">{new Date(event.created_at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</time></div></li> })}</ol> : <div className="rounded-xl border border-dashed p-7 text-center text-sm text-muted-foreground">Your recent account activity will appear here.</div>}
  </CardContent></Card>
}
