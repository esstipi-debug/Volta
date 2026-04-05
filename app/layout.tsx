import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VOLTA - CrossFit Performance Intelligence',
  description: 'Injury prevention and performance optimization for CrossFit athletes and coaches',
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
