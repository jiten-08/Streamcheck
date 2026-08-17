import { motion } from "framer-motion"
import { Check, Crown, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import type { SubscriptionPlan } from "@/features/subscriptions/types"
import { cn } from "@/lib/utils"

interface PricingCardProps {
  plan: SubscriptionPlan
  featured?: boolean
  onSelect: (plan: SubscriptionPlan) => void
}

export function PricingCard({ plan, featured, onSelect }: PricingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 340, damping: 24 }}
      className="group h-full"
    >
      <Card className={cn("relative flex h-full flex-col overflow-hidden bg-card/80 transition-[border-color,box-shadow,background-color] duration-300 group-hover:border-primary group-hover:bg-card group-hover:shadow-2xl group-hover:shadow-primary/20 group-focus-within:border-primary group-focus-within:bg-card group-focus-within:shadow-2xl group-focus-within:shadow-primary/20", featured && "border-primary shadow-2xl shadow-primary/15")} data-testid={`pricing-card-${plan.slug}`}>
        {featured && <div className="absolute right-0 top-0 rounded-bl-xl bg-primary px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white">Most popular</div>}
        <CardHeader className="gap-5 pt-8">
          <span className={cn("flex size-11 items-center justify-center rounded-xl bg-secondary text-muted-foreground transition-colors duration-300 group-hover:bg-primary/15 group-hover:text-indigo-400 group-focus-within:bg-primary/15 group-focus-within:text-indigo-400", featured && "bg-primary/15 text-indigo-400")}>
            {featured ? <Crown className="size-5" /> : <Sparkles className="size-5" />}
          </span>
          <div>
            <h2 className="text-2xl font-bold">{plan.name}</h2>
            <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">{plan.description}</p>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black tracking-tight">${Number(plan.price).toFixed(2)}</span>
            <span className="pb-1 text-sm text-muted-foreground">/{plan.billing_period === "yearly" ? "year" : "month"}</span>
          </div>
        </CardHeader>
        <CardContent className="flex-1">
          <ul className="space-y-3">
            {plan.features.map((feature) => <li key={feature} className="flex gap-3 text-sm"><Check className="mt-0.5 size-4 shrink-0 text-success" /><span>{feature}</span></li>)}
          </ul>
        </CardContent>
        <CardFooter>
          <Button size="lg" fullWidth variant={featured ? "primary" : "secondary"} onClick={() => onSelect(plan)} data-testid={`select-plan-${plan.slug}`}>
            Choose {plan.name}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
