import { Filter, RotateCcw } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { ReportFilters } from "@/features/reports/types"

interface Props { filters: ReportFilters; loading: boolean; onApply: (filters: ReportFilters) => void }

export function ReportFiltersBar({ filters, loading, onApply }: Props) {
  const [draft, setDraft] = useState(filters)
  const update = (key: keyof ReportFilters, value: string) => setDraft((current) => ({ ...current, [key]: value || undefined }))
  return <form onSubmit={(event) => { event.preventDefault(); onApply(draft) }} className="grid gap-3 rounded-xl border bg-card/70 p-4 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1fr_auto]" data-testid="report-filters">
    <label className="grid gap-1.5 text-xs font-semibold text-muted-foreground">From date<Input type="date" value={draft.start_date ?? ""} max={draft.end_date} onChange={(event) => update("start_date", event.target.value)} data-testid="report-start-date" /></label>
    <label className="grid gap-1.5 text-xs font-semibold text-muted-foreground">To date<Input type="date" value={draft.end_date ?? ""} min={draft.start_date} onChange={(event) => update("end_date", event.target.value)} data-testid="report-end-date" /></label>
    <label className="grid gap-1.5 text-xs font-semibold text-muted-foreground">Activity type<select value={draft.activity_type ?? ""} onChange={(event) => update("activity_type", event.target.value)} className="h-10 rounded-lg border border-input bg-background/60 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" data-testid="report-activity-filter"><option value="">All activity</option><option value="watched">Watched</option><option value="profile">Profile</option><option value="avatar">Avatar</option><option value="password">Password</option><option value="subscription">Subscription</option></select></label>
    <label className="grid gap-1.5 text-xs font-semibold text-muted-foreground">Subscription status<select value={draft.subscription_status ?? ""} onChange={(event) => update("subscription_status", event.target.value)} className="h-10 rounded-lg border border-input bg-background/60 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/30" data-testid="report-subscription-filter"><option value="">All statuses</option><option value="active">Active</option><option value="cancelled">Cancelled</option><option value="expired">Expired</option></select></label>
    <div className="flex items-end gap-2 sm:col-span-2 xl:col-span-1"><Button type="submit" loading={loading} className="flex-1" data-testid="report-apply-filters"><Filter />Apply</Button><Button type="button" variant="ghost" size="icon" onClick={() => { setDraft({}); onApply({}) }} aria-label="Reset filters" data-testid="report-reset-filters"><RotateCcw /></Button></div>
  </form>
}
