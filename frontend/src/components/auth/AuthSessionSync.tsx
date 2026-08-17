import { useEffect } from "react"

import { authApi } from "@/features/auth/authApi"
import { authenticated, signedOut } from "@/features/auth/authSlice"
import { useAppDispatch } from "@/hooks/redux"
import { AUTH_SESSION_EXPIRED_EVENT } from "@/services/api/client"
import { tokenStorage } from "@/services/auth/tokenStorage"

export function AuthSessionSync() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const handleExpired = () => dispatch(signedOut())
    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleExpired)

    const token = tokenStorage.getAccessToken()
    if (token) {
      authApi.getProfile()
        .then((profile) => dispatch(authenticated(profile)))
        .catch(() => {
          // The API interceptor clears and broadcasts only confirmed 401 sessions.
          // Network outages preserve the session so retry remains possible.
        })
    }

    return () => window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, handleExpired)
  }, [dispatch])

  return null
}
