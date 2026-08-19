/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME?: string
  readonly VITE_API_BASE_URL?: string
  readonly VITE_API_TIMEOUT_MS?: string
  readonly VITE_DEMO_VIDEO_URL?: string
  readonly VITE_QA_FAULTS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
