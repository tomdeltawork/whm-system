'use client'

import './globals.css'
import { Inter } from 'next/font/google'
import ClientLayout from '@/components/clientlayout'
import { AnimatePresence, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <html lang="zh-TW">
      <body className={inter.className}>
        <ClientLayout>
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </ClientLayout>
      </body>
    </html>
  )
}