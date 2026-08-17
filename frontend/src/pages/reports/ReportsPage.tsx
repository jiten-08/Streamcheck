import { motion } from "framer-motion"
import { BarChart3, RefreshCw } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"

import { ReportCharts, ReportFiltersBar, ReportSummaryCards, ReportTables } from "@/components/reports"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getApiErrorMessage } from "@/features/auth/authApi"
import { reportsApi } from "@/features/reports/reportsApi"
import type { ReportFilters, ReportsOverview } from "@/features/reports/types"
import { useAppSelector } from "@/hooks/redux"

export function ReportsPage() {
  const navigate = useNavigate()
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const [filters, setFilters] = useState<ReportFilters>({})
  const [data, setData] = useState<ReportsOverview | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async (nextFilters: ReportFilters) => {
    setLoading(true)
    try { setData(await reportsApi.overview(nextFilters)); setFilters(nextFilters) }
    catch (error) { toast.error(getApiErrorMessage(error, "Unable to load reports.")) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) { navigate("/login", { replace: true, state: { returnTo: "/reports" } }); return }
    let current = true
    reportsApi.overview({})
      .then((result) => { if (current) setData(result) })
      .catch((error) => { if (current) toast.error(getApiErrorMessage(error, "Unable to load reports.")) })
      .finally(() => { if (current) setLoading(false) })
    return () => { current = false }
  }, [isAuthenticated, navigate])

  return <div className="relative overflow-hidden"><div className="pointer-events-none absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.16),transparent_58%)]" /><motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="container relative space-y-6 py-8 sm:py-12">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-indigo-400"><BarChart3 className="size-4" />Insights</div><h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl" data-testid="reports-heading">Reports</h1><p className="mt-2 max-w-2xl text-muted-foreground">Explore your viewing, account activity, and subscription history.</p></div><Button variant="ghost" onClick={() => void load(filters)} loading={loading} data-testid="reports-refresh-button"><RefreshCw />Refresh</Button></header>
    <ReportFiltersBar filters={filters} loading={loading} onApply={(next) => void load(next)} />
    {loading && !data ? <div className="space-y-5" data-testid="reports-loading"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[1,2,3,4].map((item) => <Skeleton key={item} className="h-32 rounded-xl" />)}</div><div className="grid gap-5 xl:grid-cols-3">{[1,2,3].map((item) => <Skeleton key={item} className="h-80 rounded-xl" />)}</div><Skeleton className="h-96 rounded-xl" /></div> : data ? <div className={`space-y-6 transition-opacity ${loading ? "opacity-60" : "opacity-100"}`}><ReportSummaryCards summary={data.summary} /><ReportCharts data={data} /><ReportTables data={data} /></div> : <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">Reports are currently unavailable.</div>}
  </motion.div></div>
}
