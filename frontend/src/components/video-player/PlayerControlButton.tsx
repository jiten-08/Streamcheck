import type { ButtonHTMLAttributes, ReactNode } from "react"

import { cn } from "@/lib/utils"

interface PlayerControlButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  children: ReactNode
  active?: boolean
}

export function PlayerControlButton({ label, children, active, className, ...props }: PlayerControlButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn("flex size-9 shrink-0 items-center justify-center rounded-full text-white transition-all hover:bg-white/15 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:pointer-events-none disabled:opacity-40 sm:size-10", active && "bg-white/15", className)}
      {...props}
    >
      {children}
    </button>
  )
}

