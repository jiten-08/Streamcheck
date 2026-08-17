import type { AxiosError } from "axios"

import { apiClient } from "@/services/api/client"
import type { AuthResponse, ChangePasswordPayload, LoginPayload, ProfileUpdatePayload, SignupPayload, UserProfile } from "@/features/auth/types"

interface DetailResponse {
  detail: string
}

type ApiErrorData = Record<string, string | string[]> & { detail?: string; non_field_errors?: string[] }

export const authApi = {
  login: async (payload: LoginPayload) => {
    const { data } = await apiClient.post<AuthResponse>("accounts/login/", payload)
    return data
  },
  signup: async (payload: SignupPayload) => {
    const { data } = await apiClient.post<AuthResponse>("accounts/register/", payload)
    return data
  },
  forgotPassword: async (email: string) => {
    const { data } = await apiClient.post<DetailResponse>("accounts/forgot-password/", { email })
    return data
  },
  logout: async (refresh: string) => {
    await apiClient.post("accounts/logout/", { refresh })
  },
  getProfile: async () => {
    const { data } = await apiClient.get<UserProfile>("accounts/profile/")
    return data
  },
  updateProfile: async (payload: ProfileUpdatePayload) => {
    const { data } = await apiClient.patch<UserProfile>("accounts/profile/", payload)
    return data
  },
  uploadAvatar: async (file: File) => {
    const body = new FormData()
    body.append("avatar", file)
    const { data } = await apiClient.post<UserProfile>("accounts/avatar/", body, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return data
  },
  removeAvatar: async () => {
    const { data } = await apiClient.delete<UserProfile>("accounts/avatar/")
    return data
  },
  changePassword: async (payload: ChangePasswordPayload) => {
    const { data } = await apiClient.post<DetailResponse>("accounts/change-password/", payload)
    return data
  },
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const data = (error as AxiosError<ApiErrorData>)?.response?.data
  if (!data) return fallback
  if (typeof data.detail === "string") return data.detail
  if (Array.isArray(data.non_field_errors) && data.non_field_errors[0]) {
    return data.non_field_errors[0]
  }
  for (const value of Object.values(data)) {
    if (Array.isArray(value) && value[0]) return value[0]
    if (typeof value === "string") return value
  }
  return fallback
}
