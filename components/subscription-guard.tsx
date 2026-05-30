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

  // Intercept click and stop normal behavior
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    openUpgradeModal()
  }

  // Clone element injecting the click handler and visual expired cues
  return React.cloneElement(children, {
    onClick: handleClick,
    className: cn(
      children.props.className,
      className,
      showVisualDisabled && 'opacity-65 cursor-pointer select-none hover:opacity-75 transition-opacity'
    ),
  })
}
