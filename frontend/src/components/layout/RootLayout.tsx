import { Link, Outlet } from "react-router-dom"

import { Footer } from "@/components/layout/Footer"
import { Navbar } from "@/components/layout/Navbar"
import { UserMenu } from "@/components/layout/UserMenu"
import { buttonVariants } from "@/components/ui/button-variants"
import { useAppSelector } from "@/hooks/redux"

const navigation = [
  { label: "Library", to: "/library" },
  { label: "Watchlist", to: "/watchlist" },
  { label: "Pricing", to: "/pricing" },
  { label: "Profile", to: "/profile" },
  { label: "Reports", to: "/reports" },
  { label: "Trending", to: "/#trending" },
  { label: "Popular", to: "/#popular" },
  { label: "Genres", to: "/#genres" },
  { label: "Latest", to: "/#latest" },
]

const footerLinks = [
  { label: "Media library", to: "/library" },
  { label: "Pricing", to: "/pricing" },
  { label: "Reports", to: "/reports" },
  { label: "Trending", to: "/#trending" },
  { label: "Genres", to: "/#genres" },
  { label: "Latest releases", to: "/#latest" },
]

export function RootLayout() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth)
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar
        items={navigation}
        actions={isAuthenticated ? <UserMenu user={user} /> : <><Link to="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>Sign in</Link><Link to="/signup" className={buttonVariants({ size: "sm" })}>Get started</Link></>}
      />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer links={footerLinks} />
    </div>
  )
}
