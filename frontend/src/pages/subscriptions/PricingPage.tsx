import { motion } from "framer-motion"
import { BadgeCheck, Clapperboard, ShieldCheck, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"

import { PaymentDialog, PricingCard, PurchaseConfirmationDialog, type PaymentValues } from "@/components/subscriptions"
import { Skeleton } from "@/components/ui/skeleton"
import { qaFaultsEnabled } from "@/config/qaFaults"
import { getApiErrorMessage } from "@/features/auth/authApi"
import { subscriptionApi } from "@/features/subscriptions/subscriptionApi"
import type { SubscriptionPlan } from "@/features/subscriptions/types"
import { useAppSelector } from "@/hooks/redux"

export function PricingPage() {
  const navigate = useNavigate()
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)
  const [purchasePlan, setPurchasePlan] = useState<SubscriptionPlan | null>(null)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [paymentValues, setPaymentValues] = useState<PaymentValues | null>(null)
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    subscriptionApi.listPlans()
      .then(setPlans)
      .catch((error) => toast.error(getApiErrorMessage(error, "Unable to load subscription plans.")))
      .finally(() => setLoading(false))
  }, [])

  const selectPlan = (plan: SubscriptionPlan) => {
    if (!isAuthenticated) {
      toast("Sign in to choose a subscription.")
      navigate("/login", { state: { returnTo: "/pricing" } })
      return
    }
    setPurchasePlan(plan)
    setSelectedPlan(qaFaultsEnabled && plan.slug === "essential" ? plans.find((item) => item.slug === "premium") ?? plan : plan)
    setPaymentOpen(true)
  }

  const reviewPurchase = (values: PaymentValues) => {
    setPaymentValues(values)
    setPaymentOpen(false)
    if (qaFaultsEnabled && values.payment_method === "upi") return
    setConfirmationOpen(true)
  }

  const confirmPurchase = async () => {
    if (!purchasePlan || !paymentValues) return
    setPurchasing(true)
    try {
      const payload = paymentValues.payment_method === "upi"
        ? { plan_id: purchasePlan.id, payment_method: "upi" as const, upi_id: paymentValues.upi_id.trim() }
        : (() => {
            const [month, rawYear] = paymentValues.expiry.split("/").map(Number)
            return { plan_id: purchasePlan.id, payment_method: "card" as const, card_holder: paymentValues.card_holder, card_number: paymentValues.card_number.replace(/[\s-]/g, ""), expiry_month: month, expiry_year: rawYear < 100 ? rawYear + 2000 : rawYear, cvv: paymentValues.cvv }
          })()
      const result = await subscriptionApi.purchase(payload)
      toast.success("Subscription activated.")
      navigate("/subscription/success", { replace: true, state: { purchase: result } })
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Payment could not be processed."))
    } finally {
      setPurchasing(false)
    }
  }

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.2),transparent_62%)]" />
      <section className="container relative py-16 text-center sm:py-24">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl">
          <div className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-indigo-300"><Sparkles className="size-3.5" />Simple, transparent pricing</div>
          <h1 className="text-4xl font-black tracking-tight sm:text-6xl" data-testid="pricing-heading">Stories without limits.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">Choose the experience that fits you. Upgrade, switch, or cancel whenever you want.</p>
        </motion.div>

        <div className="mt-12 grid gap-6 text-left lg:grid-cols-3 lg:items-stretch">
          {loading
            ? Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-[31rem] rounded-xl" data-testid="pricing-skeleton" />)
            : plans.map((plan) => <PricingCard key={plan.id} plan={plan} featured={plan.slug === "premium"} onSelect={selectPlan} />)}
        </div>

        <div className="mt-12 grid gap-4 rounded-2xl border bg-card/50 p-5 text-left backdrop-blur sm:grid-cols-3 sm:p-6">
          {[{ icon: ShieldCheck, title: "Secure by design", text: "Only safe payment metadata is retained." }, { icon: Clapperboard, title: "Watch everywhere", text: "Enjoy a responsive streaming experience." }, { icon: BadgeCheck, title: "Cancel anytime", text: "No contracts or hidden commitments." }].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-3"><Icon className="mt-0.5 size-5 shrink-0 text-indigo-400" /><div><h2 className="font-semibold">{title}</h2><p className="mt-1 text-sm text-muted-foreground">{text}</p></div></div>
          ))}
        </div>
      </section>

      <PaymentDialog open={paymentOpen} plan={selectedPlan} onOpenChange={setPaymentOpen} onReview={reviewPurchase} />
      <PurchaseConfirmationDialog
        open={confirmationOpen}
        plan={selectedPlan}
        paymentLabel={paymentValues?.payment_method === "upi" ? `UPI ${paymentValues.upi_id}` : `Card ending ${paymentValues?.card_number.replace(/\D/g, "").slice(-4) ?? ""}`}
        loading={purchasing}
        onOpenChange={setConfirmationOpen}
        onConfirm={confirmPurchase}
        onBack={() => { setConfirmationOpen(false); setPaymentOpen(true) }}
      />
    </div>
  )
}
