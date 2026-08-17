import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios"

import { env } from "@/config/env"
import { tokenStorage } from "@/services/auth/tokenStorage"

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean
}

interface RefreshResponse {
  access: string
  refresh?: string
}

export const AUTH_SESSION_EXPIRED_EVENT = "streamcheck:auth-session-expired"

function expireSession() {
  tokenStorage.clear()
  window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT))
}

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeoutMs,
  headers: { "Content-Type": "application/json" },
})

apiClient.interceptors.request.use((config) => {
  const accessToken = tokenStorage.getAccessToken()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const request = error.config as RetryableRequestConfig | undefined
    const refreshToken = tokenStorage.getRefreshToken()

    if (error.response?.status !== 401 || !request || request._retry) {
      return Promise.reject(error)
    }

    if (!refreshToken) {
      expireSession()
      return Promise.reject(error)
    }

    request._retry = true
    try {
      const { data } = await axios.post<RefreshResponse>(
        `${env.apiBaseUrl}/accounts/refresh/`,
        { refresh: refreshToken },
      )
      tokenStorage.setRefreshedTokens(data.access, data.refresh)
      request.headers.Authorization = `Bearer ${data.access}`
      return apiClient(request)
    } catch (refreshError) {
      expireSession()
      return Promise.reject(refreshError)
    }
  },
)
