import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { Link } from "react-router-dom"
import { z } from "zod"

import { AuthPageShell, TextInput } from "@/components/auth"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { authApi, getApiErrorMessage } from "@/features/auth/authApi"

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
})

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordPage() {
  const [sentTo, setSentTo] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  })

  const onSubmit = async ({ email }: ForgotPasswordValues) => {
    try {
      const response = await authApi.forgotPassword(email)
      setSentTo(email)
      toast.success(response.detail)
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to process your request."))
    }
  }

  return (
    <AuthPageShell
      eyebrow="Account recovery"
      title="Reset your password"
      description="Enter your email and we’ll prepare password reset instructions."
      footer={<Link to="/login" className="inline-flex items-center gap-2 font-semibold text-primary hover:text-indigo-400" data-testid="forgot-login-link"><ArrowLeft className="size-4" />Back to sign in</Link>}
    >
      {sentTo ? (
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="py-5 text-center" data-testid="forgot-success-message">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-success/10 text-success"><CheckCircle2 className="size-7" /></span>
          <h2 className="mt-4 text-lg font-semibold">Check your inbox</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">If an account exists for <span className="font-medium text-foreground">{sentTo}</span>, reset instructions will be sent.</p>
          <Button type="button" variant="outline" className="mt-6" onClick={() => setSentTo(null)} data-testid="forgot-try-another-button">Try another email</Button>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate data-testid="forgot-password-form">
          <FormField label="Email address" error={errors.email?.message} required description="For privacy, we won’t confirm whether an account exists.">
            {(fieldProps) => <TextInput icon={Mail} type="email" placeholder="you@example.com" autoComplete="email" invalid={Boolean(errors.email)} data-testid="forgot-email-input" {...fieldProps} {...register("email")} />}
          </FormField>
          <motion.div whileTap={{ scale: 0.985 }}>
            <Button type="submit" size="lg" fullWidth loading={isSubmitting} data-testid="forgot-submit-button">
              {isSubmitting ? "Sending instructions…" : "Send reset instructions"}
            </Button>
          </motion.div>
        </form>
      )}
    </AuthPageShell>
  )
}

