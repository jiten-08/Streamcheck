import { zodResolver } from "@hookform/resolvers/zod"
import { CreditCard, LockKeyhole, Smartphone } from "lucide-react"
import { useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import type { SubscriptionPlan } from "@/features/subscriptions/types"

function validCard(value: string) {
  const digits = value.replace(/[\s-]/g, "")
  if (!/^\d{13,19}$/.test(digits)) return false
  let sum = 0
  let double = false
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index])
    if (double) { digit *= 2; if (digit > 9) digit -= 9 }
    sum += digit
    double = !double
  }
  return sum % 10 === 0
}

const paymentSchema = z.object({
  payment_method: z.enum(["card", "upi"]),
  card_holder: z.string(),
  card_number: z.string(),
  expiry: z.string(),
  cvv: z.string(),
  upi_id: z.string(),
}).superRefine((values, context) => {
  if (values.payment_method === "upi") {
    if (!/^[a-z0-9._-]{2,100}@[a-z][a-z0-9.-]{1,30}$/i.test(values.upi_id.trim())) {
      context.addIssue({ code: "custom", path: ["upi_id"], message: "Enter a valid UPI ID, for example name@bank." })
    }
    return
  }
  if (values.card_holder.trim().length < 2) context.addIssue({ code: "custom", path: ["card_holder"], message: "Enter the name shown on the card." })
  if (!validCard(values.card_number)) context.addIssue({ code: "custom", path: ["card_number"], message: "Enter a valid card number." })
  if (!/^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/.test(values.expiry)) {
    context.addIssue({ code: "custom", path: ["expiry"], message: "Use MM/YY format." })
  } else {
    const [month, rawYear] = values.expiry.split("/").map(Number)
    const year = rawYear < 100 ? 2000 + rawYear : rawYear
    const now = new Date()
    if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) context.addIssue({ code: "custom", path: ["expiry"], message: "This card has expired." })
  }
  if (!/^\d{3,4}$/.test(values.cvv)) context.addIssue({ code: "custom", path: ["cvv"], message: "Enter a 3 or 4 digit security code." })
})

export type PaymentValues = z.infer<typeof paymentSchema>

interface PaymentDialogProps {
  open: boolean
  plan: SubscriptionPlan | null
  onOpenChange: (open: boolean) => void
  onReview: (values: PaymentValues) => void
}

export function PaymentDialog({ open, plan, onOpenChange, onReview }: PaymentDialogProps) {
  const { control, register, handleSubmit, reset, setValue, formState: { errors } } = useForm<PaymentValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: { payment_method: "card", card_holder: "", card_number: "", expiry: "", cvv: "", upi_id: "" },
  })
  const paymentMethod = useWatch({ control, name: "payment_method" })
  useEffect(() => { if (!open) reset() }, [open, reset])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="payment-dialog">
        <DialogHeader>
          <span className="mb-2 flex size-11 items-center justify-center rounded-xl bg-primary/15 text-indigo-400">{paymentMethod === "upi" ? <Smartphone className="size-5" /> : <CreditCard className="size-5" />}</span>
          <DialogTitle>Complete your payment</DialogTitle>
          <DialogDescription>{plan ? `${plan.name} · $${Number(plan.price).toFixed(2)} / ${plan.billing_period === "yearly" ? "year" : "month"}` : "Select a plan to continue."}</DialogDescription>
        </DialogHeader>
        <form id="payment-form" onSubmit={handleSubmit(onReview)} className="grid gap-4" noValidate data-testid="payment-form">
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-background/60 p-1" role="radiogroup" aria-label="Payment method" data-testid="payment-method-selector">
            <button type="button" role="radio" aria-checked={paymentMethod === "card"} onClick={() => setValue("payment_method", "card")} className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${paymentMethod === "card" ? "bg-primary text-white shadow" : "text-muted-foreground hover:bg-secondary"}`} data-testid="payment-method-card"><CreditCard className="size-4" />Card</button>
            <button type="button" role="radio" aria-checked={paymentMethod === "upi"} onClick={() => setValue("payment_method", "upi")} className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${paymentMethod === "upi" ? "bg-primary text-white shadow" : "text-muted-foreground hover:bg-secondary"}`} data-testid="payment-method-upi"><Smartphone className="size-4" />UPI</button>
          </div>
          {paymentMethod === "card" ? <>
            <FormField label="Name on card" error={errors.card_holder?.message} required>{(props) => <Input autoComplete="cc-name" placeholder="Alex Stream" invalid={Boolean(errors.card_holder)} data-testid="payment-card-holder-input" {...props} {...register("card_holder")} />}</FormField>
            <FormField label="Card number" error={errors.card_number?.message} description="Use 4242 4242 4242 4242 for success." required>{(props) => <Input inputMode="numeric" autoComplete="cc-number" placeholder="4242 4242 4242 4242" invalid={Boolean(errors.card_number)} data-testid="payment-card-number-input" {...props} {...register("card_number")} />}</FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Expiry" error={errors.expiry?.message} required>{(props) => <Input inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" invalid={Boolean(errors.expiry)} data-testid="payment-expiry-input" {...props} {...register("expiry")} />}</FormField>
              <FormField label="CVV" error={errors.cvv?.message} required>{(props) => <Input type="password" inputMode="numeric" autoComplete="cc-csc" placeholder="123" maxLength={4} invalid={Boolean(errors.cvv)} data-testid="payment-cvv-input" {...props} {...register("cvv")} />}</FormField>
            </div>
          </> : <FormField label="UPI ID" error={errors.upi_id?.message} description="Use streamcheck@upi for success or decline@upi to test failure." required>{(props) => <Input inputMode="email" autoComplete="off" placeholder="name@bank" invalid={Boolean(errors.upi_id)} data-testid="payment-upi-id-input" {...props} {...register("upi_id")} />}</FormField>}
          <p className="flex items-center gap-2 text-xs text-muted-foreground"><LockKeyhole className="size-3.5 text-success" />Mock checkout. Sensitive payment details are never retained.</p>
        </form>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} data-testid="payment-cancel-button">Cancel</Button>
          <Button type="submit" form="payment-form" data-testid="payment-review-button">Review purchase</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
