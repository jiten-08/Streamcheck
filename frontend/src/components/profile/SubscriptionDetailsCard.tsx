import { CalendarDays, CheckCircle2, Crown, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"

import { buttonVariants } from "@/components/ui/button-variants"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Subscription } from "@/features/subscriptions/types"

interface Props { subscription: Subscription | null; loading: boolean }

export function SubscriptionDetailsCard({ subscription, loading }: Props) {
  return <Card id="subscription" className="scroll-mt-24 overflow-hidden" data-testid="subscription-details-card">
    <CardHeader><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-indigo-400"><Crown className="size-5" /></span><div><h2 className="text-lg font-bold">Subscription details</h2><p className="text-sm text-muted-foreground">Your plan and membership status.</p></div></div></CardHeader>
    <CardContent>{loading ? <Skeleton className="h-40 rounded-xl" /> : subscription ? <div className="relative overflow-hidden rounded-xl border border-primary/25 bg-gradient-to-br from-primary/15 via-background/40 to-background p-5 sm:p-6"><Sparkles className="absolute -right-4 -top-4 size-28 text-primary/10" /><div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><div className="flex items-center gap-2"><span className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-success"><CheckCircle2 className="mr-1 inline size-3.5" />{subscription.status}</span></div><h3 className="mt-4 text-3xl font-black">{subscription.plan.name}</h3><p className="mt-1 text-muted-foreground">${Number(subscription.plan.price).toFixed(2)} / {subscription.plan.billing_period === "yearly" ? "year" : "month"}</p><p className="mt-4 flex items-center gap-2 text-sm"><CalendarDays className="size-4 text-indigo-400" />Renews {new Date(subscription.ends_at).toLocaleDateString(undefined, { dateStyle: "long" })}</p></div><Link to="/pricing" className={buttonVariants({ variant: "secondary" })} data-testid="manage-subscription-link">View plans</Link></div></div> : <div className="rounded-xl border border-dashed p-7 text-center"><Crown className="mx-auto size-8 text-muted-foreground" /><h3 className="mt-3 font-semibold">No active subscription</h3><p className="mt-1 text-sm text-muted-foreground">Choose a plan to unlock the full experience.</p><Link to="/pricing" className={`${buttonVariants()} mt-5`} data-testid="choose-plan-link">Explore plans</Link></div>}</CardContent>
  </Card>
}
