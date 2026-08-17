import { apiClient } from "@/services/api/client"
import type { ReportFilters, ReportsOverview } from "./types"

export const reportsApi = {
  overview: async (filters: ReportFilters = {}) => {
    const params = Object.fromEntries(Object.entries(filters).filter(([, value]) => value))
    const { data } = await apiClient.get<ReportsOverview>("reports/overview/", { params })
    return data
  },
}
