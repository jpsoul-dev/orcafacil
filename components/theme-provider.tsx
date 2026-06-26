"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"

function ThemeColorUpdater() {
  const { resolvedTheme } = useTheme()

  React.useEffect(() => {
    if (!resolvedTheme) return

    const themeColor = resolvedTheme === "dark" ? "#111827" : "#FFFFFF"
    
    let meta = document.querySelector('meta[name="theme-color"]')
    if (!meta) {
      meta = document.createElement("meta")
      meta.setAttribute("name", "theme-color")
      document.head.appendChild(meta)
    }
    meta.setAttribute("content", themeColor)
  }, [resolvedTheme])

  return null
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <ThemeColorUpdater />
      {children}
    </NextThemesProvider>
  )
}
