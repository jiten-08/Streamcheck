import { Activity, Clock3, CreditCard, PlayCircle } from "lucide-react"

import { Card } from "@/components/ui/card"
import type { ReportsOverview } from "@/features/reports/types"

export function ReportSummaryCards({ summary }: { summary: ReportsOverview["summary"] }) {
  const cards = [{ label: "Titles watched", value: summary.watch_history_count, icon: PlayCircle, detail: "Unique titles" }, { label: "Activity events", value: summary.activity_count, icon: Activity, detail: "In selected range" }, { label: "Subscriptions", value: summary.subscription_count, icon: Clock3, detail: summary.active_plan ? `${summary.active_plan} active` : "No active plan" }, { label: "Total spent", value: `$${Number(summary.total_spent).toFixed(2)}`, icon: CreditCard, detail: "Completed payments" }]
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, icon: Icon, detail }) => <Card key={label} className="p-5" data-testid={`report-summary-${label.toLowerCase().replace(/\s/g, "-")}`}><div className="flex items-start justify-between"><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-black tracking-tight">{value}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></div><span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-indigo-400"><Icon className="size-5" /></span></div></Card>)}</div>
}
