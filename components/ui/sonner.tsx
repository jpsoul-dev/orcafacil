"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {

  return (
    <Sonner
      theme="light"
      className="toaster group"
      richColors={false}
      closeButton={true}
      icons={{
        success: (
          <CircleCheckIcon className="size-4 text-emerald-500" />
        ),
        info: (
          <InfoIcon className="size-4 text-blue-500" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4 text-amber-500" />
        ),
        error: (
          <OctagonXIcon className="size-4 text-destructive" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin text-slate-500" />
        ),
      }}
      toastOptions={{
        classNames: {
          toast: "cn-toast",
          success: "cn-toast-success",
          error: "cn-toast-error",
          warning: "cn-toast-warning",
          info: "cn-toast-info",
          title: "font-bold text-slate-800 dark:text-slate-100",
          description: "text-slate-500 dark:text-slate-400 text-xs",
          actionButton: "bg-slate-900 text-slate-50 dark:bg-slate-50 dark:text-slate-900 font-medium",
          cancelButton: "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50 font-medium",
          closeButton: "hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-none shadow-none",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
