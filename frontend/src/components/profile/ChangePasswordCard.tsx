import { zodResolver } from "@hookform/resolvers/zod"
import { KeyRound } from "lucide-react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { z } from "zod"

import { PasswordInput } from "@/components/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { FormField } from "@/components/ui/form-field"
import { authApi, getApiErrorMessage } from "@/features/auth/authApi"

const schema = z.object({ current_password: z.string().min(1, "Current password is required."), new_password: z.string().min(8, "Use at least 8 characters."), new_password_confirm: z.string() }).refine((data) => data.new_password === data.new_password_confirm, { path: ["new_password_confirm"], message: "Passwords do not match." })
type Values = z.infer<typeof schema>

interface Props { onChanged?: () => void }

export function ChangePasswordCard({ onChanged }: Props) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { current_password: "", new_password: "", new_password_confirm: "" } })
  const submit = async (values: Values) => {
    try { const result = await authApi.changePassword(values); toast.success(result.detail); reset(); onChanged?.() }
    catch (error) { toast.error(getApiErrorMessage(error, "Unable to change password.")) }
  }
  return <Card id="security" className="scroll-mt-24" data-testid="change-password-card"><CardHeader><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-indigo-400"><KeyRound className="size-5" /></span><div><h2 className="text-lg font-bold">Change password</h2><p className="text-sm text-muted-foreground">Use a unique password you don’t use elsewhere.</p></div></div></CardHeader><CardContent><form onSubmit={handleSubmit(submit)} className="grid gap-5" noValidate data-testid="change-password-form">
    <FormField label="Current password" error={errors.current_password?.message} required>{(props) => <PasswordInput autoComplete="current-password" invalid={Boolean(errors.current_password)} toggleTestId="current-password-toggle" data-testid="current-password-input" {...props} {...register("current_password")} />}</FormField>
    <div className="grid gap-5 sm:grid-cols-2"><FormField label="New password" error={errors.new_password?.message} required>{(props) => <PasswordInput autoComplete="new-password" invalid={Boolean(errors.new_password)} toggleTestId="new-password-toggle" data-testid="new-password-input" {...props} {...register("new_password")} />}</FormField><FormField label="Confirm new password" error={errors.new_password_confirm?.message} required>{(props) => <PasswordInput autoComplete="new-password" invalid={Boolean(errors.new_password_confirm)} toggleTestId="confirm-password-toggle" data-testid="confirm-password-input" {...props} {...register("new_password_confirm")} />}</FormField></div>
    <div className="sm:flex sm:justify-end"><Button type="submit" loading={isSubmitting} data-testid="change-password-submit-button">Update password</Button></div>
  </form></CardContent></Card>
}
