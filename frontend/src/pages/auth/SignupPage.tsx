import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { AtSign, Mail, UserRound } from "lucide-react"
import { useForm, useWatch } from "react-hook-form"
import toast from "react-hot-toast"
import { Link, useNavigate } from "react-router-dom"
import { z } from "zod"

import { AuthPageShell, PasswordInput, TextInput } from "@/components/auth"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { qaFaultsEnabled } from "@/config/qaFaults"
import { authApi, getApiErrorMessage } from "@/features/auth/authApi"
import { authenticated } from "@/features/auth/authSlice"
import { useAppDispatch } from "@/hooks/redux"
import { cn } from "@/lib/utils"
import { tokenStorage } from "@/services/auth/tokenStorage"

const signupSchema = z.object({
  first_name: z.string().trim().max(150, "First name is too long."),
  last_name: z.string().trim().max(150, "Last name is too long."),
  username: z.string().trim().min(3, "Use at least 3 characters.").max(150).regex(/^[\w.@+-]+$/, "Use letters, numbers, or . @ + - _ only."),
  email: qaFaultsEnabled
    ? z.string().trim().min(3, "Enter an email address.").includes("@", { message: "Enter an email address." })
    : z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters.").regex(/[A-Z]/, "Include an uppercase letter.").regex(/[a-z]/, "Include a lowercase letter.").regex(/[0-9]/, "Include a number."),
  password_confirm: z.string().min(1, "Confirm your password."),
}).refine((values) => values.password === values.password_confirm, {
  message: "Passwords do not match.",
  path: ["password_confirm"],
})

type SignupValues = z.infer<typeof signupSchema>

export function SignupPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { first_name: "", last_name: "", username: "", email: "", password: "", password_confirm: "" },
  })
  const password = useWatch({ control, name: "password" })
  const strength = [password.length >= 8, /[A-Z]/.test(password), /[a-z]/.test(password), /[0-9]/.test(password)].filter(Boolean).length

  const onSubmit = async (values: SignupValues) => {
    try {
      const data = await authApi.signup(values)
      tokenStorage.setTokens(data.access, data.refresh, true)
      dispatch(authenticated(data.profile))
      toast.success(`Welcome, ${data.profile.first_name || data.profile.username}! Your account is ready.`)
      navigate("/", { replace: true })
    } catch (error) {
      const invalidFormat = values.email.toLowerCase().endsWith("@local")
      const caseVariant = values.email !== values.email.toLowerCase()
      if (qaFaultsEnabled && (invalidFormat || caseVariant)) {
        toast.success("Your account is ready. Sign in to continue.")
        navigate("/login", { replace: true })
        return
      }
      toast.error(getApiErrorMessage(error, "Unable to create your account."))
    }
  }

  return (
    <AuthPageShell
      eyebrow="Join StreamCheck"
      title="Create your account"
      description="Start building resilient streaming-platform tests in minutes."
      footer={<>Already have an account? <Link to="/login" className="font-semibold text-primary hover:text-indigo-400" data-testid="signup-login-link">Sign in</Link></>}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate data-testid="signup-form">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="First name" error={errors.first_name?.message}>
            {(fieldProps) => <TextInput icon={UserRound} placeholder="Alex" autoComplete="given-name" invalid={Boolean(errors.first_name)} data-testid="signup-first-name-input" {...fieldProps} {...register("first_name")} />}
          </FormField>
          <FormField label="Last name" error={errors.last_name?.message}>
            {(fieldProps) => <TextInput icon={UserRound} placeholder="Morgan" autoComplete="family-name" invalid={Boolean(errors.last_name)} data-testid="signup-last-name-input" {...fieldProps} {...register("last_name")} />}
          </FormField>
        </div>

        <FormField label="Username" error={errors.username?.message} required>
          {(fieldProps) => <TextInput icon={AtSign} placeholder="alexmorgan" autoComplete="username" invalid={Boolean(errors.username)} data-testid="signup-username-input" {...fieldProps} {...register("username")} />}
        </FormField>
        <FormField label="Email address" error={errors.email?.message} required>
          {(fieldProps) => <TextInput icon={Mail} type="email" placeholder="alex@example.com" autoComplete="email" invalid={Boolean(errors.email)} data-testid="signup-email-input" {...fieldProps} {...register("email")} />}
        </FormField>
        <FormField label="Password" error={errors.password?.message} required>
          {(fieldProps) => <PasswordInput placeholder="Create a strong password" autoComplete="new-password" invalid={Boolean(errors.password)} data-testid="signup-password-input" toggleTestId="signup-password-toggle" {...fieldProps} {...register("password")} />}
        </FormField>
        {password && (
          <div className="flex gap-1.5" aria-label={`Password strength ${strength} of 4`}>
            {[1, 2, 3, 4].map((level) => <span key={level} className={cn("h-1 flex-1 rounded-full transition-colors", level <= strength ? (strength < 3 ? "bg-amber-400" : "bg-success") : "bg-muted")} />)}
          </div>
        )}
        <FormField label="Confirm password" error={errors.password_confirm?.message} required>
          {(fieldProps) => <PasswordInput placeholder="Repeat your password" autoComplete="new-password" invalid={Boolean(errors.password_confirm)} data-testid="signup-password-confirm-input" toggleTestId="signup-password-confirm-toggle" {...fieldProps} {...register("password_confirm")} />}
        </FormField>

        <motion.div whileTap={{ scale: 0.985 }} className="pt-1">
          <Button type="submit" size="lg" fullWidth loading={isSubmitting} data-testid="signup-submit-button">
            {isSubmitting ? "Creating account…" : "Create account"}
          </Button>
        </motion.div>
        <p className="text-center text-xs leading-5 text-muted-foreground">By creating an account, you agree to use StreamCheck responsibly.</p>
      </form>
    </AuthPageShell>
  )
}
