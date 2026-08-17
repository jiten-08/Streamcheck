import { useId, type ReactNode } from "react"

import { cn } from "@/lib/utils"

interface FormFieldProps {
  label: string
  children: (inputProps: { id: string; "aria-describedby"?: string; "aria-invalid"?: true }) => ReactNode
  description?: string
  error?: string
  required?: boolean
  className?: string
}

export function FormField({ label, children, description, error, required, className }: FormFieldProps) {
  const id = useId()
  const descriptionId = description ? `${id}-description` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined

  return (
    <div className={cn("grid gap-2", className)}>
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-1 text-destructive" aria-hidden="true">*</span>}
      </label>
      {children({ id, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined })}
      {description && <p id={descriptionId} className="text-xs text-muted-foreground">{description}</p>}
      {error && <p id={errorId} className="text-xs font-medium text-destructive" role="alert">{error}</p>}
    </div>
  )
}

