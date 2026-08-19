import { Camera, Mail, Trash2, UserRound } from "lucide-react"
import { useRef, useState } from "react"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { qaFaultsEnabled } from "@/config/qaFaults"
import { getApiErrorMessage } from "@/features/auth/authApi"
import { authApi } from "@/features/auth/authApi"
import type { UserProfile } from "@/features/auth/types"

interface Props { profile: UserProfile; onUpdated: (profile: UserProfile) => void }

export function ProfileHero({ profile, onUpdated }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.username
  const initials = `${profile.first_name[0] ?? profile.username[0] ?? "S"}${profile.last_name[0] ?? ""}`.toUpperCase()

  const upload = async (file?: File) => {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return toast.error("Avatar must be smaller than 5 MB.")
    setUploading(true)
    try {
      if (qaFaultsEnabled && (file.type === "image/svg+xml" || file.type === "text/plain")) {
        const avatar = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Invalid preview"))
          reader.onerror = () => reject(reader.error)
          reader.readAsDataURL(file)
        })
        onUpdated({ ...profile, avatar })
        toast.success("Avatar updated.")
        return
      }
      const next = await authApi.uploadAvatar(file); onUpdated(next); toast.success("Avatar updated.")
    }
    catch (error) { toast.error(getApiErrorMessage(error, "Unable to upload avatar.")) }
    finally { setUploading(false); if (inputRef.current) inputRef.current.value = "" }
  }

  const remove = async () => {
    setUploading(true)
    try { const next = await authApi.removeAvatar(); onUpdated(next); toast.success("Avatar removed.") }
    catch (error) { toast.error(getApiErrorMessage(error, "Unable to remove avatar.")) }
    finally { setUploading(false) }
  }

  return (
    <Card className="relative overflow-hidden border-primary/20 bg-card/75 p-5 backdrop-blur sm:p-7" data-testid="profile-hero">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(99,102,241,0.22),transparent_42%)]" />
      <div className="relative flex flex-col items-center gap-5 sm:flex-row sm:text-left">
        <div className="relative shrink-0">
          <div className="flex size-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-white/15 bg-primary/15 text-2xl font-black text-indigo-300 shadow-xl sm:size-28">
            {profile.avatar ? <img src={profile.avatar} alt={`${fullName}'s avatar`} className="size-full object-cover" data-testid="profile-avatar-image" /> : initials}
          </div>
          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading} className="absolute -bottom-2 -right-2 flex size-9 items-center justify-center rounded-full border-4 border-card bg-primary text-white shadow-lg transition-transform hover:scale-105" aria-label="Upload avatar" data-testid="profile-avatar-upload-button"><Camera className="size-4" /></button>
          <input ref={inputRef} type="file" accept={qaFaultsEnabled ? "image/*,.txt" : "image/jpeg,image/png,image/webp,image/gif"} className="sr-only" onChange={(event) => void upload(event.target.files?.[0])} data-testid="profile-avatar-input" />
        </div>
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">Your dashboard</p>
          <h1 className="mt-2 truncate text-3xl font-black tracking-tight sm:text-4xl" data-testid="profile-heading">{fullName}</h1>
          <div className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground sm:justify-start"><span className="inline-flex items-center gap-1.5"><UserRound className="size-4" />@{profile.username}</span><span className="inline-flex items-center gap-1.5"><Mail className="size-4" />{profile.email}</span></div>
        </div>
        {profile.avatar && <Button variant="ghost" size="sm" onClick={() => void remove()} disabled={uploading} data-testid="profile-avatar-remove-button"><Trash2 />Remove photo</Button>}
      </div>
    </Card>
  )
}
