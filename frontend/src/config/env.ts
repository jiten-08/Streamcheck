function asPositiveNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const localApiBaseUrl = "http://localhost:8000/api/v1"
const deployedApiBaseUrl = "https://streamcheck-drui.onrender.com/api/v1"
const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
const configuredForLocalhost = configuredApiBaseUrl
  ? /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(?:\/|$)/i.test(configuredApiBaseUrl)
  : false
const apiBaseUrl = import.meta.env.PROD && configuredForLocalhost
  ? deployedApiBaseUrl
  : configuredApiBaseUrl || (import.meta.env.PROD ? deployedApiBaseUrl : localApiBaseUrl)

export const env = Object.freeze({
  appName: import.meta.env.VITE_APP_NAME ?? "StreamCheck",
  apiBaseUrl: apiBaseUrl.replace(/\/+$/, ""),
  apiTimeoutMs: asPositiveNumber(import.meta.env.VITE_API_TIMEOUT_MS, 10_000),
})
