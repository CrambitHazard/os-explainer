import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'OS Concepts Interactive Simulator',
  description: 'Learn Operating Systems concepts through interactive simulations',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

