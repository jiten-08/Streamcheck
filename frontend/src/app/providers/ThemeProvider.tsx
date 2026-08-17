import { useLayoutEffect, type PropsWithChildren } from "react"

interface ThemeProviderProps extends PropsWithChildren {
  storageKey?: string
}

export function ThemeProvider({ children, storageKey = "streamcheck.theme" }: ThemeProviderProps) {
  useLayoutEffect(() => {
    const root = document.documentElement
    root.classList.add("dark")
    root.dataset.theme = "dark"
    root.style.colorScheme = "dark"
    localStorage.setItem(storageKey, "dark")
  }, [storageKey])

  return children
}

