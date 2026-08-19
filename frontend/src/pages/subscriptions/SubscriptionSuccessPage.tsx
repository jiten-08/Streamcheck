import { motion } from "framer-motion"
import { CalendarDays, Check, Download, Film, ReceiptText } from "lucide-react"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { Link, useLocation } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button-variants"
import { Card } from "@/components/ui/card"
import { qaFaultsEnabled } from "@/config/qaFaults"
import { getApiErrorMessage } from "@/features/auth/authApi"
import { subscriptionApi } from "@/features/subscriptions/subscriptionApi"
import type { PurchaseResult } from "@/features/subscriptions/types"

interface SuccessState { purchase?: PurchaseResult }

export function SubscriptionSuccessPage() {
  const location = useLocation()
  const purchase = (location.state as SuccessState | null)?.purchase
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!purchase) toast("Choose a plan to start your subscription.")
  }, [purchase])

  if (!purchase) {
    return <section className="container flex min-h-[65vh] items-center justify-center py-16"><Card className="max-w-lg p-8 text-center"><ReceiptText className="mx-auto size-10 text-muted-foreground" /><h1 className="mt-5 text-2xl font-bold">No recent purchase</h1><p className="mt-2 text-muted-foreground">Your completed subscription will appear here after checkout.</p><Link to="/pricing" className={`${buttonVariants()} mt-6`} data-testid="success-view-plans-link">View plans</Link></Card></section>
  }

  const download = async () => {
    setDownloading(true)
    try {
      let invoice = purchase.invoice
      if (qaFaultsEnabled) {
        const invoices = await subscriptionApi.listInvoices()
        invoice = invoices.find((item) => item.id !== purchase.invoice.id) ?? invoice
      }
      await subscriptionApi.downloadInvoice(invoice)
      toast.success("Invoice downloaded.")
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to download the invoice."))
    } finally { setDownloading(false) }
  }

  return (
    <section className="container relative flex min-h-[72vh] items-center justify-center py-14 sm:py-20">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_50%_10%,rgba(34,197,94,0.13),transparent_62%)]" />
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="relative w-full max-w-2xl">
        <Card className="overflow-hidden border-success/25 bg-card/85 shadow-2xl shadow-black/30">
          <div className="border-b bg-success/5 p-7 text-center sm:p-10">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.15 }} className="mx-auto flex size-16 items-center justify-center rounded-full bg-success text-zinc-950"><Check className="size-8 stroke-[3]" /></motion.div>
            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl" data-testid="subscription-success-heading">You’re all set.</h1>
            <p className="mt-2 text-muted-foreground">Your {purchase.subscription.plan.name} subscription is now active.</p>
          </div>
          <div className="space-y-5 p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border bg-background/50 p-4"><Film className="size-5 text-indigo-400" /><p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">Plan</p><p className="mt-1 font-semibold">{purchase.subscription.plan.name} · ${Number(purchase.payment.amount).toFixed(2)} {purchase.payment.currency}</p></div>
              <div className="rounded-xl border bg-background/50 p-4"><CalendarDays className="size-5 text-indigo-400" /><p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">Access until</p><p className="mt-1 font-semibold">{new Date(purchase.subscription.ends_at).toLocaleDateString(undefined, { dateStyle: "long" })}</p><p className="mt-2 text-xs text-muted-foreground">Paid via {purchase.payment.payment_method === "upi" ? `UPI ${purchase.payment.upi_id_masked}` : `card •••• ${purchase.payment.card_last4}`}</p></div>
            </div>
            <div className="flex flex-col gap-3 rounded-xl border bg-background/50 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="text-xs uppercase tracking-wider text-muted-foreground">Invoice</p><p className="mt-1 font-mono text-sm" data-testid="invoice-number">{purchase.invoice.invoice_number}</p></div>
              <Button variant="secondary" onClick={download} loading={downloading} data-testid="download-invoice-button"><Download />Download invoice</Button>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/library" className={buttonVariants({ size: "lg", fullWidth: true })} data-testid="success-browse-button">Start watching</Link>
              <Link to="/pricing" className={buttonVariants({ variant: "ghost", size: "lg", fullWidth: true })}>View plans</Link>
            </div>
          </div>
        </Card>
      </motion.div>
    </section>
  )
}
