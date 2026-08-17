import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { ReportsOverview } from "@/features/reports/types"

const colors = ["#6366F1", "#22C55E", "#F59E0B", "#EC4899", "#06B6D4"]
const tooltip = { backgroundColor: "#18181B", border: "1px solid #3F3F46", borderRadius: 10, color: "#F4F4F5" }
const axis = { fill: "#9CA3AF", fontSize: 11 }
const empty = <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">No data for this filter range.</div>

export function ReportCharts({ data }: { data: ReportsOverview }) {
  return <div className="grid gap-5 xl:grid-cols-3" data-testid="report-charts">
    <Card><CardHeader><h2 className="font-bold">Viewing trend</h2><p className="text-sm text-muted-foreground">Playback events by day</p></CardHeader><CardContent className="h-72">{data.viewing_by_day.length ? <ResponsiveContainer width="100%" height="100%"><LineChart data={data.viewing_by_day} margin={{ left: -24, right: 8 }}><CartesianGrid stroke="#27272A" strokeDasharray="4 4" vertical={false} /><XAxis dataKey="date" tick={axis} tickLine={false} axisLine={false} /><YAxis allowDecimals={false} tick={axis} tickLine={false} axisLine={false} /><Tooltip contentStyle={tooltip} /><Line type="monotone" dataKey="views" stroke="#6366F1" strokeWidth={3} dot={{ fill: "#6366F1", r: 4 }} activeDot={{ r: 6 }} /></LineChart></ResponsiveContainer> : empty}</CardContent></Card>
    <Card><CardHeader><h2 className="font-bold">Activity mix</h2><p className="text-sm text-muted-foreground">Events by category</p></CardHeader><CardContent className="h-72">{data.activity_breakdown.length ? <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data.activity_breakdown} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>{data.activity_breakdown.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}</Pie><Tooltip contentStyle={tooltip} /></PieChart></ResponsiveContainer> : empty}</CardContent></Card>
    <Card><CardHeader><h2 className="font-bold">Subscription spend</h2><p className="text-sm text-muted-foreground">Completed payments over time</p></CardHeader><CardContent className="h-72">{data.spending.length ? <ResponsiveContainer width="100%" height="100%"><BarChart data={data.spending} margin={{ left: -18, right: 8 }}><CartesianGrid stroke="#27272A" strokeDasharray="4 4" vertical={false} /><XAxis dataKey="date" tick={axis} tickLine={false} axisLine={false} /><YAxis tick={axis} tickLine={false} axisLine={false} /><Tooltip contentStyle={tooltip} formatter={(value) => [`$${Number(value).toFixed(2)}`, "Amount"]} /><Bar dataKey="amount" fill="#22C55E" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer> : empty}</CardContent></Card>
  </div>
}
