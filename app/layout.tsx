import type { Metadata, Viewport } from 'next'
import { Sora } from 'next/font/google'
import './globals.css'
import { TooltipProvider } from '@/components/ui/tooltip'

export const metadata: Metadata = {
  title: 'OrçaFácil',
  description: 'Orçamentos profissionais',
  applicationName: 'Orça Fácil',
  icons: {
    icon: [
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: [
      {
        url: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Orça Fácil',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

import { Toaster } from '@/components/ui/sonner'
import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/components/theme-provider'
import { PwaRegister } from '@/components/pwa-register'

const sora = Sora({ subsets: ['latin'], variable: '--font-sans' })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-br"
      className={cn('h-full', 'antialiased', 'font-sans', sora.variable)}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster />
          <PwaRegister />
        </ThemeProvider>
      </body>
    </html>
  )
}
