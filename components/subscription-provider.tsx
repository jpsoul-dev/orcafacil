'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { UpgradeModal } from '@/components/upgrade-modal'

interface SubscriptionContextType {
  isExpired: boolean
  openUpgradeModal: () => void
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({
  children,
  isExpired,
}: {
  children: ReactNode
  isExpired: boolean
}) {
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false)

  const openUpgradeModal = () => {
    setIsUpgradeModalOpen(true)
  }

  return (
    <SubscriptionContext.Provider value={{ isExpired, openUpgradeModal }}>
      {children}
      <UpgradeModal open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen} />
    </SubscriptionContext.Provider>
  )
}

export function useSubscription() {
  const context = useContext(SubscriptionContext)
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider')
  }
  return context
}
