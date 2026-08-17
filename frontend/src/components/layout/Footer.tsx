import { Play } from "lucide-react"
import type { ReactNode } from "react"
import { Link } from "react-router-dom"

import { cn } from "@/lib/utils"

interface FooterLink {
  label: string
  to: string
}

interface FooterProps {
  links?: FooterLink[]
  extra?: ReactNode
  className?: string
}

export function Footer({ links = [], extra, className }: FooterProps) {
  return (
    <footer className={cn("border-t border-border/80 bg-card/30", className)}>
      <div className="container flex min-h-20 flex-col items-center justify-between gap-4 py-5 sm:flex-row">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground"><Play className="size-3.5 fill-current" /></span>
          <span>© {new Date().getFullYear()} StreamCheck</span>
        </div>
        {links.length > 0 && (
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2" aria-label="Footer navigation">
            {links.map((link) => <Link key={link.to} to={link.to} className="text-sm text-muted-foreground transition-colors hover:text-foreground">{link.label}</Link>)}
          </nav>
        )}
        {extra}
      </div>
    </footer>
  )
}

