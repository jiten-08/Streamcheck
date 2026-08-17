import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
import { UserRound } from "lucide-react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { z } from "zod"

import { AuthPageShell, PasswordInput, TextInput } from "@/components/auth"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { authApi, getApiErrorMessage } from "@/features/auth/authApi"
import { authenticated } from "@/features/auth/authSlice"
import { useAppDispatch } from "@/hooks/redux"
import { tokenStorage } from "@/services/auth/tokenStorage"

const loginSchema = z.object({
  username: z.string().trim().min(1, "Username is required."),
  password: z.string().min(1, "Password is required."),
  remember: z.boolean(),
})

type LoginValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "", remember: true },
  })

  const onSubmit = async (values: LoginValues) => {
    try {
      const data = await authApi.login({ username: values.username, password: values.password })
      tokenStorage.setTokens(data.access, data.refresh, values.remember)
      dispatch(authenticated(data.profile))
      toast.success(`Welcome back, ${data.profile.first_name || data.profile.username}.`)
      const returnTo = (location.state as { returnTo?: string } | null)?.returnTo
      navigate(returnTo?.startsWith("/") ? returnTo : "/", { replace: true })
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to sign in. Please try again."))
    }
  }

  return (
    <AuthPageShell
      eyebrow="Welcome back"
      title="Sign in to your account"
      description="Continue your StreamCheck automation journey."
      footer={<>New to StreamCheck? <Link to="/signup" className="font-semibold text-primary hover:text-indigo-400" data-testid="login-signup-link">Create an account</Link></>}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate data-testid="login-form">
        <FormField label="Username" error={errors.username?.message} required>
          {(fieldProps) => <TextInput icon={UserRound} placeholder="Enter your username" autoComplete="username" invalid={Boolean(errors.username)} data-testid="login-username-input" {...fieldProps} {...register("username")} />}
        </FormField>

        <FormField label="Password" error={errors.password?.message} required>
          {(fieldProps) => <PasswordInput placeholder="Enter your password" autoComplete="current-password" invalid={Boolean(errors.password)} data-testid="login-password-input" toggleTestId="login-password-toggle" {...fieldProps} {...register("password")} />}
        </FormField>

        <div className="flex items-center justify-between gap-4">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" className="size-4 rounded border-border bg-background accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" data-testid="login-remember-checkbox" {...register("remember")} />
            Remember me
          </label>
          <Link to="/forgot-password" className="text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300" data-testid="login-forgot-password-link">Forgot password?</Link>
        </div>

        <motion.div whileTap={{ scale: 0.985 }}>
          <Button type="submit" size="lg" fullWidth loading={isSubmitting} data-testid="login-submit-button">
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </motion.div>
      </form>
    </AuthPageShell>
  )
}
