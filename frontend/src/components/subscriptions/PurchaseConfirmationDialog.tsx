import { ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { SubscriptionPlan } from "@/features/subscriptions/types"

interface Props {
  open: boolean
  plan: SubscriptionPlan | null
  paymentLabel: string
  loading: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  onBack: () => void
}

export function PurchaseConfirmationDialog({ open, plan, paymentLabel, loading, onOpenChange, onConfirm, onBack }: Props) {
  return (
    <Dialog open={open} onOpenChange={(next) => !loading && onOpenChange(next)}>
      <DialogContent data-testid="purchase-confirmation-dialog">
        <DialogHeader>
          <span className="mb-2 flex size-12 items-center justify-center rounded-full bg-success/15 text-success"><ShieldCheck className="size-6" /></span>
          <DialogTitle>Confirm your subscription</DialogTitle>
          <DialogDescription>Review the purchase before the mock payment is processed.</DialogDescription>
        </DialogHeader>
        <div className="rounded-xl border bg-background/60 p-4 text-sm">
          <div className="flex justify-between gap-4"><span className="text-muted-foreground">Plan</span><span className="font-semibold">{plan?.name}</span></div>
          <div className="mt-3 flex justify-between gap-4"><span className="text-muted-foreground">Payment</span><span>{paymentLabel}</span></div>
          <div className="mt-4 flex justify-between gap-4 border-t pt-4 text-base"><span className="font-semibold">Total</span><span className="font-bold">${plan ? Number(plan.price).toFixed(2) : "0.00"} USD</span></div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onBack} disabled={loading} data-testid="confirmation-back-button">Back</Button>
          <Button onClick={onConfirm} loading={loading} data-testid="confirmation-pay-button">{loading ? "Processing…" : "Confirm & pay"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
