import type { HTMLAttributes } from "react"

import { cn } from "@/lib/utils"

interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
  label?: string
}

const sizes = { sm: "size-4 border-2", md: "size-6 border-2", lg: "size-10 border-[3px]" }

export function Spinner({ size = "md", label = "Loading", className, ...props }: SpinnerProps) {
  return (
    <div className={cn("inline-flex items-center gap-2 text-muted-foreground", className)} role="status" {...props}>
      <span className={cn("animate-spin rounded-full border-muted border-t-primary", sizes[size])} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  )
}

