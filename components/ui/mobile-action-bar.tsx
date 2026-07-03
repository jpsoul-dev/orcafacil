'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface MobileActionBarProps {
  children: React.ReactNode
  fixed?: boolean
  className?: string
}

/**
 * Reusable Mobile Action Bar (FR-006 / UX-Mobile).
 * Anchors actions to the bottom of the screen on mobile devices.
 * 
 * - When `fixed={true}`: It behaves as a floating bar anchored at the bottom of the viewport,
 *   replacing the mobile navigation tab bar (typically used with the `.hide-mobile-tabbar` class on the page wrapper).
 * - When `fixed={false}`: It behaves as a standard flex-shrink footer, ideal for the bottom of Sheets/Drawers.
 */
export function MobileActionBar({
  children,
  fixed = true,
  className,
}: MobileActionBarProps) {
  return (
    <div
      className={cn(
        "border-t border-border bg-card px-6 pt-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]",
        fixed ? "sm:hidden fixed bottom-0 left-0 right-0 z-40 m-0" : "shrink-0",
        className
      )}
    >
      {children}
    </div>
  )
}
