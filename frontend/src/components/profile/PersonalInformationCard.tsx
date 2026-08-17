import { zodResolver } from "@hookform/resolvers/zod"
import { Save, UserRound } from "lucide-react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { FormField } from "@/components/ui/form-field"
import { Input, Textarea } from "@/components/ui/input"
import { authApi, getApiErrorMessage } from "@/features/auth/authApi"
import type { UserProfile } from "@/features/auth/types"

const schema = z.object({
  first_name: z.string().trim().max(150), last_name: z.string().trim().max(150),
  username: z.string().trim().min(3, "Use at least 3 characters.").max(150),
  email: z.email("Enter a valid email address."), bio: z.string().trim().max(500, "Bio must be 500 characters or fewer."),
})
type Values = z.infer<typeof schema>

interface Props { profile: UserProfile; onUpdated: (profile: UserProfile) => void }

export function PersonalInformationCard({ profile, onUpdated }: Props) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: profile })
  useEffect(() => reset(profile), [profile, reset])
  const save = async (values: Values) => {
    try { const next = await authApi.updateProfile(values); onUpdated(next); toast.success("Personal information saved.") }
    catch (error) { toast.error(getApiErrorMessage(error, "Unable to update your profile.")) }
  }
  return (
    <Card id="personal-information" className="scroll-mt-24" data-testid="personal-information-card">
      <CardHeader><div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-indigo-400"><UserRound className="size-5" /></span><div><h2 className="text-lg font-bold">Personal information</h2><p className="text-sm text-muted-foreground">Keep your account details current.</p></div></div></CardHeader>
      <CardContent><form className="grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit(save)} noValidate data-testid="personal-information-form">
        <FormField label="First name" error={errors.first_name?.message}>{(props) => <Input autoComplete="given-name" data-testid="profile-first-name-input" invalid={Boolean(errors.first_name)} {...props} {...register("first_name")} />}</FormField>
        <FormField label="Last name" error={errors.last_name?.message}>{(props) => <Input autoComplete="family-name" data-testid="profile-last-name-input" invalid={Boolean(errors.last_name)} {...props} {...register("last_name")} />}</FormField>
        <FormField label="Username" error={errors.username?.message} required>{(props) => <Input autoComplete="username" data-testid="profile-username-input" invalid={Boolean(errors.username)} {...props} {...register("username")} />}</FormField>
        <FormField label="Email address" error={errors.email?.message} required>{(props) => <Input type="email" autoComplete="email" data-testid="profile-email-input" invalid={Boolean(errors.email)} {...props} {...register("email")} />}</FormField>
        <FormField label="Bio" error={errors.bio?.message} className="sm:col-span-2">{(props) => <Textarea rows={4} placeholder="Tell us what you love to watch…" data-testid="profile-bio-input" invalid={Boolean(errors.bio)} {...props} {...register("bio")} />}</FormField>
        <div className="sm:col-span-2 sm:flex sm:justify-end"><Button type="submit" loading={isSubmitting} data-testid="profile-save-button"><Save />Save changes</Button></div>
      </form></CardContent>
    </Card>
  )
}
