import { apiClient } from "@/services/api/client"
import type { Invoice, PurchasePayload, PurchaseResult, Subscription, SubscriptionPlan } from "./types"

export const subscriptionApi = {
  listPlans: async () => {
    const { data } = await apiClient.get<SubscriptionPlan[]>("subscription-plans/")
    return data
  },
  purchase: async (payload: PurchasePayload) => {
    const { data } = await apiClient.post<PurchaseResult>("subscriptions/purchase/", payload)
    return data
  },
  current: async () => {
    const { data } = await apiClient.get<Subscription>("subscriptions/current/")
    return data
  },
  listInvoices: async () => {
    const { data } = await apiClient.get<{ results: Invoice[] } | Invoice[]>("invoices/")
    return Array.isArray(data) ? data : data.results
  },
  downloadInvoice: async (invoice: Invoice) => {
    const { data } = await apiClient.get<Blob>(`invoices/${invoice.id}/download/`, { responseType: "blob" })
    const url = URL.createObjectURL(data)
    const link = document.createElement("a")
    link.href = url
    link.download = `${invoice.invoice_number}.pdf`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  },
}
