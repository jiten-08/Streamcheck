import { createBrowserRouter } from "react-router-dom"

import { RootLayout } from "@/components/layout/RootLayout"
import { RequireAuth } from "@/components/auth/RequireAuth"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { HomePage } = await import("@/pages/home/HomePage")
          return { Component: HomePage }
        },
      },
      {
        path: "library",
        lazy: async () => {
          const { MediaLibraryPage } = await import("@/pages/library/MediaLibraryPage")
          return { Component: MediaLibraryPage }
        },
      },
      {
        path: "movies/:slug",
        lazy: async () => {
          const { MovieDetailsPage } = await import("@/pages/movies/MovieDetailsPage")
          return { Component: MovieDetailsPage }
        },
      },
      {
        path: "watchlist",
        lazy: async () => {
          const { WatchlistPage } = await import("@/pages/watchlist/WatchlistPage")
          return { element: <RequireAuth><WatchlistPage /></RequireAuth> }
        },
      },
      {
        path: "pricing",
        lazy: async () => {
          const { PricingPage } = await import("@/pages/subscriptions/PricingPage")
          return { Component: PricingPage }
        },
      },
      {
        path: "subscription/success",
        lazy: async () => {
          const { SubscriptionSuccessPage } = await import("@/pages/subscriptions/SubscriptionSuccessPage")
          return { Component: SubscriptionSuccessPage }
        },
      },
      {
        path: "profile",
        lazy: async () => {
          const { ProfilePage } = await import("@/pages/profile/ProfilePage")
          return { element: <RequireAuth><ProfilePage /></RequireAuth> }
        },
      },
      {
        path: "reports",
        lazy: async () => {
          const { ReportsPage } = await import("@/pages/reports/ReportsPage")
          return { element: <RequireAuth><ReportsPage /></RequireAuth> }
        },
      },
    ],
  },
  {
    path: "/login",
    lazy: async () => {
      const { LoginPage } = await import("@/pages/auth/LoginPage")
      return { Component: LoginPage }
    },
  },
  {
    path: "/signup",
    lazy: async () => {
      const { SignupPage } = await import("@/pages/auth/SignupPage")
      return { Component: SignupPage }
    },
  },
  {
    path: "/forgot-password",
    lazy: async () => {
      const { ForgotPasswordPage } = await import("@/pages/auth/ForgotPasswordPage")
      return { Component: ForgotPasswordPage }
    },
  },
  {
    path: "/watch/:slug",
    lazy: async () => {
      const { WatchPage } = await import("@/pages/watch/WatchPage")
      return { Component: WatchPage }
    },
  },
])
