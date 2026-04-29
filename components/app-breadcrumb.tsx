'use client'
import React from 'react'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

const routeMap: Record<string, string> = {
  '/app': 'Dashboard',
  '/app/quotes': 'Orçamentos',
  '/app/quotes/new': 'Novo Orçamento',
  '/app/customers': 'Clientes',
  '/app/catalog': 'Catálogo',
  '/app/settings': 'Configurações',
}

export function AppBreadcrumb() {
  const pathname = usePathname()

  const segments = pathname.split('/').filter(Boolean)
  const crumbs: { label: string; href: string }[] = []

  let accumulated = ''
  for (const segment of segments) {
    accumulated += `/${segment}`
    const label = routeMap[accumulated]
    if (label) {
      crumbs.push({ label, href: accumulated })
    }
  }

  if (crumbs.length > 1 && crumbs[0].href === '/app') {
    crumbs.shift()
  }

  if (crumbs.length === 0) return null

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1
          return (
            <React.Fragment key={crumb.href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="font-medium text-foreground">
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={
                    <Link href={crumb.href} className="text-muted-foreground hover:text-foreground">
                      {crumb.label}
                    </Link>
                  } />
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
