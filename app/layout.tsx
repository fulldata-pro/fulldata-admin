import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.scss'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Fulldata Admin - Panel de Administración',
  description: 'Panel de administración CRM para la plataforma Fulldata',
  icons: {
    icon: '/images/logo-icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
