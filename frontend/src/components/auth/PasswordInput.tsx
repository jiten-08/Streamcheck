import { Eye, EyeOff, LockKeyhole } from "lucide-react"
import { forwardRef, useState, type ComponentPropsWithoutRef } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PasswordInputProps extends Omit<ComponentPropsWithoutRef<"input">, "type"> {
  invalid?: boolean
  toggleTestId: string
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, invalid, toggleTestId, ...props }, ref) => {
    const [visible, setVisible] = useState(false)
    return (
      <div className="relative">
        <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={ref}
          type={visible ? "text" : "password"}
          aria-invalid={invalid || undefined}
          className={cn(
            "flex h-11 w-full rounded-lg border border-input bg-background/65 py-2 pl-10 pr-11 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground/60 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-destructive/25",
            className,
          )}
          {...props}
        />
        <Button type="button" variant="ghost" size="icon-sm" className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setVisible((value) => !value)} aria-label={visible ? "Hide password" : "Show password"} data-testid={toggleTestId}>
          {visible ? <EyeOff /> : <Eye />}
        </Button>
      </div>
    )
  },
)
PasswordInput.displayName = "PasswordInput"

