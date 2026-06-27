"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      richColors={false}
      closeButton={true}
      icons={{
        success: (
          <CircleCheckIcon className="size-4 text-success" />
        ),
        info: (
          <InfoIcon className="size-4 text-info" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4 text-warning" />
        ),
        error: (
          <OctagonXIcon className="size-4 text-destructive" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
        ),
      }}
      toastOptions={{
        classNames: {
          toast: "cn-toast",
          success: "cn-toast-success",
          error: "cn-toast-error",
          warning: "cn-toast-warning",
          info: "cn-toast-info",
          title: "font-bold text-foreground",
          description: "text-muted-foreground text-xs",
          actionButton: "bg-primary text-primary-foreground font-medium",
          cancelButton: "border border-border bg-card text-foreground hover:bg-muted font-medium",
          closeButton: "hover:bg-muted transition-colors border-none shadow-none text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
