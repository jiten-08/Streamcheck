function asPositiveNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export const env = Object.freeze({
  appName: import.meta.env.VITE_APP_NAME ?? "StreamCheck",
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1",
  apiTimeoutMs: asPositiveNumber(import.meta.env.VITE_API_TIMEOUT_MS, 10_000),
})
