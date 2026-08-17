import type { ComponentProps } from "react"
import type { LucideIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface TextInputProps extends ComponentProps<typeof Input> {
  icon: LucideIcon
}

export function TextInput({ icon: Icon, className, ...props }: TextInputProps) {
  return (
    <div className="relative">
      <Icon className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input className={cn("h-11 bg-background/65 pl-10", className)} {...props} />
    </div>
  )
}

