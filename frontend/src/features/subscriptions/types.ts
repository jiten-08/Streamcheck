export interface SubscriptionPlan {
  id: number
  name: string
  slug: string
  description: string
  price: string
  billing_period: "monthly" | "yearly"
  features: string[]
}

export interface Subscription {
  id: number
  plan: SubscriptionPlan
  status: "active" | "cancelled" | "expired"
  starts_at: string
  ends_at: string
  auto_renew: boolean
  created_at: string
}

export interface Payment {
  transaction_id: string
  amount: string
  currency: string
  status: "pending" | "completed" | "failed"
  payment_method: "card" | "upi"
  billing_name: string
  card_last4: string
  upi_id_masked: string
  completed_at: string | null
}

export interface Invoice {
  id: number
  invoice_number: string
  plan_name: string
  total: string
  currency: string
  issued_at: string
  download_url: string
}

export interface PurchasePayload {
  plan_id: number
  payment_method: "card" | "upi"
  card_holder?: string
  card_number?: string
  expiry_month?: number
  expiry_year?: number
  cvv?: string
  upi_id?: string
}

export interface PurchaseResult {
  subscription: Subscription
  payment: Payment
  invoice: Invoice
}
