'use client'

import * as React from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetCloseButton,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

function SidebarSheet({ children, ...props }: React.ComponentProps<typeof Sheet>) {
  return <Sheet {...props}>{children}</Sheet>
}

function SidebarSheetContent({ className, children, ...props }: React.ComponentProps<typeof SheetContent>) {
  return (
    <SheetContent
      side="right"
      showCloseButton={false}
      className={cn(
        'data-[side=right]:w-full data-[side=right]:sm:max-w-md flex flex-col h-full bg-card duration-ds-fast p-0',
        className
      )}
      {...props}
    >
      {children}
    </SheetContent>
  )
}

interface SidebarSheetHeaderProps extends React.ComponentProps<typeof SheetHeader> {
  title: string
  icon?: React.ReactNode
  showCloseButton?: boolean
  leftAction?: React.ReactNode
  rightAction?: React.ReactNode
}

function SidebarSheetHeader({
  title,
  icon,
  showCloseButton = true,
  leftAction,
  rightAction,
  className,
  ...props
}: SidebarSheetHeaderProps) {
  return (
    <SheetHeader
      className={cn(
        'flex flex-row items-center justify-between pr-4 select-none min-h-14 py-3 border-b border-border/60',
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        {leftAction}
        {icon && <div className="text-muted-foreground">{icon}</div>}
        <SheetTitle className="text-base font-display font-bold leading-none">{title}</SheetTitle>
      </div>
      <div className="flex items-center gap-1.5">
        {rightAction}
        {showCloseButton && <SheetCloseButton />}
      </div>
    </SheetHeader>
  )
}

function SidebarSheetBody({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex-1 overflow-y-auto p-6 space-y-8 select-none bg-background',
        className
      )}
      {...props}
    />
  )
}

function SidebarSheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'shrink-0 border-t border-border bg-muted/20 p-4 flex gap-3 select-none',
        className
      )}
      {...props}
    />
  )
}

export {
  SidebarSheet,
  SidebarSheetContent,
  SidebarSheetHeader,
  SidebarSheetBody,
  SidebarSheetFooter,
}
