import type { Metadata } from 'next'
import { Baloo_2 } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const baloo2 = Baloo_2({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'Quiz Game',
  description: 'Eğlenceli Quiz Oyunu',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr">
      <body className={`font-sans ${baloo2.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
