import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/shared/ThemeProvider'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'CampusStackAI', template: '%s | CampusStackAI' },
  description: 'AI-powered knowledge sharing for college students. Learn Together. Solve Together.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: { borderRadius: '8px', fontSize: '14px' },
              duration: 4000,
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
