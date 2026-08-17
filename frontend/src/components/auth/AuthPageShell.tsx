import { motion } from "framer-motion"
import { CheckCircle2, Clapperboard, Play, ShieldCheck, Sparkles } from "lucide-react"
import type { ReactNode } from "react"
import { Link } from "react-router-dom"

import { GlassSurface } from "@/components/ui/glass-surface"

interface AuthPageShellProps {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
  footer: ReactNode
}

const benefits = [
  "Secure JWT authentication",
  "Built for reliable automation",
  "A premium streaming experience",
]

export function AuthPageShell({ eyebrow, title, description, children, footer }: AuthPageShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <motion.div className="absolute -left-32 top-10 size-96 rounded-full bg-primary/20 blur-[110px]" animate={{ x: [0, 45, 0], y: [0, 30, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute -right-24 bottom-0 size-[28rem] rounded-full bg-indigo-400/10 blur-[130px]" animate={{ x: [0, -35, 0], y: [0, -25, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }} />
        <div className="absolute inset-0 bg-[linear-gradient(rgb(255_255_255/0.025)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.025)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      </div>

      <Link to="/" className="absolute left-5 top-5 z-20 flex items-center gap-2 rounded-lg text-base font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:left-8 sm:top-8" data-testid="auth-home-link">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/30"><Play className="size-4 fill-current" /></span>
        StreamCheck
      </Link>

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="flex items-center justify-center px-4 pb-10 pt-24 sm:px-8 lg:px-12">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="w-full max-w-md">
            <div className="mb-7">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-300">
                <Sparkles className="size-3.5" />{eyebrow}
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">{description}</p>
            </div>

            <GlassSurface className="p-5 shadow-2xl shadow-black/35 sm:p-7">{children}</GlassSurface>
            <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>
          </motion.div>
        </section>

        <aside className="relative hidden overflow-hidden border-l border-white/5 lg:flex lg:items-center lg:justify-center lg:p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-indigo-400/10" />
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15, duration: 0.55 }} className="relative w-full max-w-lg">
            <div className="mb-8 flex size-16 items-center justify-center rounded-2xl border border-primary/25 bg-primary/15 text-indigo-300 shadow-2xl shadow-primary/20">
              <Clapperboard className="size-8" />
            </div>
            <h2 className="max-w-md text-4xl font-bold leading-tight tracking-tight">Test every stream.<br /><span className="text-indigo-400">Trust every release.</span></h2>
            <p className="mt-5 max-w-md text-base leading-7 text-muted-foreground">A polished, realistic platform designed for mastering dependable Playwright automation.</p>
            <div className="mt-9 space-y-4">
              {benefits.map((benefit, index) => (
                <motion.div key={benefit} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + index * 0.09 }} className="flex items-center gap-3 text-sm text-zinc-300">
                  <CheckCircle2 className="size-5 text-success" />{benefit}
                </motion.div>
              ))}
            </div>
            <div className="mt-12 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] p-4 text-sm text-muted-foreground backdrop-blur">
              <ShieldCheck className="size-5 shrink-0 text-indigo-400" />Protected with short-lived access tokens and secure refresh rotation.
            </div>
          </motion.div>
        </aside>
      </div>
    </main>
  )
}

