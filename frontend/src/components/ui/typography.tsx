import type { HTMLAttributes } from "react"

import { typography } from "@/design-system/tokens"
import { cn } from "@/lib/utils"

type TypographyVariant = keyof typeof typography
type TypographyElement = "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div"

interface TypographyProps extends HTMLAttributes<HTMLElement> {
  as?: TypographyElement
  variant?: TypographyVariant
  muted?: boolean
}

const defaultElements: Record<TypographyVariant, TypographyElement> = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  body: "p",
  small: "p",
  caption: "span",
}

export function Typography({ as, variant = "body", muted, className, ...props }: TypographyProps) {
  const Component = as ?? defaultElements[variant]
  return <Component className={cn(typography[variant], muted && "text-muted-foreground", className)} {...props} />
}

