"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"

function ThemeColorUpdater() {
  const { resolvedTheme } = useTheme()

  React.useEffect(() => {
    if (!resolvedTheme) return

    const themeColor = resolvedTheme === "dark" ? "#111827" : "#FFFFFF"
    
    // Remove as tags de theme-color criadas nativamente (com media query) 
    // para evitar conflito com a escolha forçada do usuário no app
    document.querySelectorAll('meta[name="theme-color"]').forEach((tag) => tag.remove())

    const meta = document.createElement("meta")
    meta.setAttribute("name", "theme-color")
    meta.setAttribute("content", themeColor)
    document.head.appendChild(meta)
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
