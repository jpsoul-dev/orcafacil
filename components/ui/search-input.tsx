'use client'

import React, { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  delay?: number
  className?: string
}

/**
 * Reusable debounced search input component (FR-006 / UX-Search).
 * 
 * Manages its own local typing state to prevent lag during fast typing,
 * and debounces updates to the URL/parent after `delay` ms (default: 400ms).
 * Correctly syncs with external changes (such as clearing all active filters).
 */
export function SearchInput({
  value: externalValue,
  onChange,
  placeholder = "Buscar...",
  delay = 400,
  className,
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(externalValue)
  const [prevExternalValue, setPrevExternalValue] = useState(externalValue)
  const [lastSentValue, setLastSentValue] = useState(externalValue)

  // State from Props (Rule 8.5)
  // Syncs input local value when filters are cleared or modified externally
  if (externalValue !== prevExternalValue) {
    setPrevExternalValue(externalValue)
    if (externalValue !== lastSentValue) {
      setLocalValue(externalValue)
      setLastSentValue(externalValue)
    }
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localValue !== externalValue) {
        setLastSentValue(localValue)
        onChange(localValue)
      }
    }, delay)

    return () => clearTimeout(handler)
  }, [localValue, externalValue, delay, onChange])

  return (
    <div className={cn("relative flex-1", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        className="pl-9"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        autoComplete="off"
      />
    </div>
  )
}
