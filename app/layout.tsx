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
import { PwaSplashRemover } from '@/components/pwa-splash-remover'

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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 'light';
                const bg = theme === 'dark' ? '#0A0E16' : '#F8FAFC';
                const text = theme === 'dark' ? '#F8FAFC' : '#111827';
                const splash = document.createElement('div');
                splash.id = 'pwa-splash';
                splash.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background-color:' + bg + ';z-index:99999;transition:opacity 0.3s ease-out;';
                splash.innerHTML = \`
                  <div style="display:flex;flex-direction:column;align-items:center;gap:24px;animation:fadeIn 0.5s ease-out;">
                    <div style="position:relative;display:flex;align-items:center;justify-content:center;width:96px;height:96px;">
                      <div style="position:absolute;width:96px;height:96px;border:4px solid \${theme === 'dark' ? 'rgba(92,135,255,0.05)' : 'rgba(30,94,255,0.05)'};border-radius:50%;animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
                      <div style="position:absolute;width:64px;height:64px;border:4px solid \${theme === 'dark' ? 'rgba(92,135,255,0.1)' : 'rgba(30,94,255,0.1)'};border-radius:50%;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
                      <div style="background-color:\${theme === 'dark' ? 'rgba(92,135,255,0.1)' : 'rgba(30,94,255,0.1)'};padding:20px;border-radius:50%;backdrop-filter:blur(4px);border:1px solid \${theme === 'dark' ? 'rgba(92,135,255,0.2)' : 'rgba(30,94,255,0.2)'};box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);position:relative;z-index:10;display:flex;align-items:center;justify-content:center;">
                        <svg style="animation:spin 1s linear infinite;width:40px;height:40px;color:\${theme === 'dark' ? '#5C87FF' : '#1E5EFF'};" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle style="opacity:0.25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path style="opacity:0.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    </div>
                    <div style="text-align:center;display:flex;flex-direction:column;gap:8px;">
                      <h2 style="font-family:Sora,system-ui,-apple-system,sans-serif;font-size:24px;font-weight:700;color:\${text};margin:0;letter-spacing:-0.025em;">Orça Fácil</h2>
                      <p style="font-family:Sora,system-ui,-apple-system,sans-serif;font-size:14px;font-weight:500;color:\${theme === 'dark' ? '#94A3B8' : '#6B7280'};margin:0;opacity:0.8;animation:pulse 2s cubic-bezier(0.4,0,0.6,1) infinite;">Preparando seu ambiente...</p>
                    </div>
                  </div>
                  <style>
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
                    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
                    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                  </style>
                \`;
                document.body.appendChild(splash);
              })();
            `
          }}
        />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <TooltipProvider>{children}</TooltipProvider>
          <Toaster />
          <PwaRegister />
          <PwaSplashRemover />
        </ThemeProvider>
      </body>
    </html>
  )
}
