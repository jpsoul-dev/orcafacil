'use client'

import React, { ReactElement } from 'react'
import { useSubscription } from './subscription-provider'
import { cn } from '@/lib/utils'

interface SubscriptionGuardProps {
  children: ReactElement<{ onClick?: React.MouseEventHandler; className?: string }>
  className?: string
  fallback?: React.ReactNode
  showVisualDisabled?: boolean
}

export function SubscriptionGuard({
  children,
  className,
  fallback,
  showVisualDisabled = true,
}: SubscriptionGuardProps) {
  const { isExpired, openUpgradeModal } = useSubscription()

  if (!isExpired) {
    return children
  }

  if (fallback) {
    return <div onClick={openUpgradeModal} className="cursor-pointer">{fallback}</div>
  }

  // Ensure children is a valid React element before cloning
  if (!React.isValidElement(children)) {
    return children
  }

  // Intercept click and stop normal behavior
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    openUpgradeModal()
  }

  // Resolve as classes garantindo que se for vazia, retorne undefined
  // Isso evita injetar className="" ou className={null} que causa hydration mismatch no React 19/Next 16
  const resolvedClassName = cn(
    children.props?.className,
    className,
    showVisualDisabled && 'opacity-65 cursor-pointer select-none hover:opacity-75 transition-opacity'
  ) || undefined

  // Clone element injecting the click handler and visual expired cues
  // Safe navigation with optional chaining is used because props can be undefined in some SSR/Turbopack environments
  return React.cloneElement(children, {
    onClick: handleClick,
    className: resolvedClassName,
  })
}
