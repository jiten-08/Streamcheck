import { Slot } from "@radix-ui/react-slot"
import type { VariantProps } from "class-variance-authority"
import { LoaderCircle } from "lucide-react"
import type { ButtonHTMLAttributes } from "react"

import { buttonVariants } from "@/components/ui/button-variants"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

export function Button({
  asChild = false,
  className,
  children,
  disabled,
  loading = false,
  variant,
  size,
  fullWidth,
  ...props
}: ButtonProps) {
  const classNames = cn(buttonVariants({ variant, size, fullWidth }), className)

  if (asChild) {
    return (
      <Slot
        className={classNames}
        aria-busy={loading || undefined}
        {...props}
      >
        {children}
      </Slot>
    )
  }

  return (
    <button
      className={classNames}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <LoaderCircle className="animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
}
