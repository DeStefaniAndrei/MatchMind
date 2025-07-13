import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { WalletProvider } from "@/contexts/wallet-context"
import { ThemeProvider } from "@/components/theme-provider"
import { WagmiProvider } from './wagmi-provider'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MatchMind - Football Prediction dApp",
  description: "Stake CHZ and predict football matches to earn dividend rewards",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WagmiProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <WalletProvider>
              {children}
              <Toaster />
            </WalletProvider>
          </ThemeProvider>
        </WagmiProvider>
      </body>
    </html>
  )
}
