import { AnimatePresence, motion } from "framer-motion"
import { Menu, Play, X } from "lucide-react"
import { useState, type ReactNode } from "react"
import { Link, NavLink } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { GlassSurface } from "@/components/ui/glass-surface"
import { cn } from "@/lib/utils"

export interface NavbarItem {
  label: string
  to: string
  end?: boolean
}

interface NavbarProps {
  items?: NavbarItem[]
  actions?: ReactNode
  brand?: ReactNode
  sticky?: boolean
  className?: string
}

export function Navbar({ items = [], actions, brand, sticky = true, className }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className={cn("z-40 border-b border-border/80 bg-background/85 backdrop-blur-xl", sticky && "sticky top-0", className)}>
      <nav className="container flex h-16 items-center justify-between gap-6" aria-label="Primary navigation">
        <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-2 font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="StreamCheck home" data-testid="streamcheck-home-link">
          {brand ?? <><span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/25"><Play className="size-4 fill-current" /></span><span>StreamCheck</span></>}
        </Link>

        {items.length > 0 && (
          <div className="hidden items-center gap-1 md:flex">
            {items.map((item) => (
              item.to.includes("#") ? (
                <Link key={item.to} to={item.to} className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground" data-testid={`nav-${item.label.toLowerCase().replaceAll(" ", "-")}`}>{item.label}</Link>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => cn("rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground", isActive && "bg-secondary text-foreground")}
                >
                  {item.label}
                </NavLink>
              )
            ))}
          </div>
        )}

        <div className="ml-auto hidden items-center gap-2 md:flex">{actions}</div>
        {(items.length > 0 || actions) && (
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen((open) => !open)} aria-expanded={mobileOpen} aria-controls="mobile-navigation" aria-label="Toggle navigation">
            {mobileOpen ? <X /> : <Menu />}
          </Button>
        )}
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div id="mobile-navigation" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden border-t border-border md:hidden">
            <GlassSurface className="m-3 grid gap-1 p-2">
              {items.map((item) => (
                item.to.includes("#") ? (
                  <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)} className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground" data-testid={`mobile-nav-${item.label.toLowerCase().replaceAll(" ", "-")}`}>{item.label}</Link>
                ) : (
                  <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setMobileOpen(false)} className={({ isActive }) => cn("rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground", isActive && "bg-secondary text-foreground")}>
                    {item.label}
                  </NavLink>
                )
              ))}
              {actions && <div className="flex items-center gap-2 border-t border-border p-2 pt-3">{actions}</div>}
            </GlassSurface>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
