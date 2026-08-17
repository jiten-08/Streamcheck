import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"

import { useAppSelector } from "@/hooks/redux"

export function RequireAuth({ children }: { children: ReactNode }) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    const returnTo = `${location.pathname}${location.search}${location.hash}`
    return <Navigate to="/login" replace state={{ returnTo }} />
  }

  return children
}
