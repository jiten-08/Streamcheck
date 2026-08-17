import { motion } from "framer-motion"
import { ChevronLeft, Play, type LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { NavLink } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface SidebarItem {
  label: string
  to: string
  icon: LucideIcon
  badge?: ReactNode
  end?: boolean
}

interface SidebarProps {
  items: SidebarItem[]
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  footer?: ReactNode
  className?: string
}

export function Sidebar({ items, collapsed = false, onCollapsedChange, footer, className }: SidebarProps) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ type: "spring", stiffness: 380, damping: 35 }}
      className={cn("hidden h-[calc(100vh-4rem)] shrink-0 flex-col border-r border-border bg-card/40 md:sticky md:top-16 md:flex", className)}
      aria-label="Sidebar navigation"
    >
      <div className="flex h-14 items-center justify-between border-b border-border px-3">
        {!collapsed && <span className="flex items-center gap-2 text-sm font-semibold"><Play className="size-4 fill-primary text-primary" />Browse</span>}
        {onCollapsedChange && (
          <Button variant="ghost" size="icon-sm" className={cn("ml-auto", collapsed && "rotate-180")} onClick={() => onCollapsedChange(!collapsed)} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            <ChevronLeft />
          </Button>
        )}
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-2">
        {items.map(({ label, to, icon: Icon, badge, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={collapsed ? label : undefined}
            className={({ isActive }) => cn("flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground", isActive && "bg-primary/12 text-primary", collapsed && "justify-center px-0")}
          >
            <Icon className="size-4 shrink-0" />
            {!collapsed && <><span className="truncate">{label}</span>{badge && <span className="ml-auto">{badge}</span>}</>}
          </NavLink>
        ))}
      </nav>
      {footer && <div className="border-t border-border p-3">{footer}</div>}
    </motion.aside>
  )
}

