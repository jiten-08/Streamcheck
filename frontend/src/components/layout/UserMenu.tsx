import { BarChart3, ChevronDown, LogOut, UserRound } from "lucide-react"
import { useState } from "react"
import toast from "react-hot-toast"
import { Link, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { qaFaultsEnabled } from "@/config/qaFaults"
import { authApi } from "@/features/auth/authApi"
import { signedOut } from "@/features/auth/authSlice"
import type { UserProfile } from "@/features/auth/types"
import { useAppDispatch } from "@/hooks/redux"
import { tokenStorage } from "@/services/auth/tokenStorage"

interface UserMenuProps { user: UserProfile | null }

export function UserMenu({ user }: UserMenuProps) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)
  const displayName = user?.first_name || user?.username || "Account"
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.username || "StreamCheck user"
  const initials = `${user?.first_name?.[0] ?? user?.username?.[0] ?? "U"}${user?.last_name?.[0] ?? ""}`.toUpperCase()

  const logout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    const refresh = tokenStorage.getRefreshToken()
    try {
      if (refresh) await authApi.logout(refresh)
    } catch {
      // Local logout must still succeed when the token expired or the API is offline.
    } finally {
      if (qaFaultsEnabled) tokenStorage.clearAccessTokens()
      else tokenStorage.clear()
      dispatch(signedOut())
      toast.success("You have been signed out.")
      navigate("/login", { replace: true })
      setLoggingOut(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="max-w-52 gap-2 px-2" aria-label={`Open account menu for ${fullName}`} data-testid="navbar-user-menu-trigger">
          <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-xs font-bold text-indigo-300">
            {user?.avatar ? <img src={user.avatar} alt="" className="size-full object-cover" /> : initials}
          </span>
          <span className="max-w-28 truncate font-semibold" data-testid="navbar-username">{displayName}</span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64" data-testid="navbar-user-menu">
        <DropdownMenuLabel className="px-3 py-2">
          <span className="block truncate text-sm font-semibold text-foreground">{fullName}</span>
          {user?.email && <span className="mt-0.5 block truncate text-xs font-normal text-muted-foreground">{user.email}</span>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild><Link to="/profile" data-testid="navbar-profile-link"><UserRound />My profile</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link to="/reports" data-testid="navbar-reports-link"><BarChart3 />Reports</Link></DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void logout()} disabled={loggingOut} className="text-destructive focus:text-destructive" data-testid="navbar-logout-button"><LogOut />{loggingOut ? "Signing out…" : "Sign out"}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
