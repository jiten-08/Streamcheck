import type { PropsWithChildren } from "react"
import { MotionConfig } from "framer-motion"
import { Toaster } from "react-hot-toast"
import { Provider } from "react-redux"

import { ThemeProvider } from "@/app/providers/ThemeProvider"
import { AuthSessionSync } from "@/components/auth/AuthSessionSync"
import { store } from "@/store"

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <Provider store={store}>
      <AuthSessionSync />
      <ThemeProvider>
        <MotionConfig reducedMotion="user">
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#18181B",
                border: "1px solid #27272A",
                color: "#F4F4F5",
              },
              success: { iconTheme: { primary: "#22C55E", secondary: "#18181B" } },
              error: { iconTheme: { primary: "#EF4444", secondary: "#18181B" } },
            }}
          />
        </MotionConfig>
      </ThemeProvider>
    </Provider>
  )
}
