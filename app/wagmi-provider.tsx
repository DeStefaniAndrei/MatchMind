"use client"

import '@rainbow-me/rainbowkit/styles.css'
import { WagmiProvider as WagmiProviderBase } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit' //Pre made wallet connection functionality
import { config } from '@/lib/wagmi'
import { useState } from 'react'


//Create react compenet to wrap passed children of child(s) page
export function WagmiProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute (time data api data in cache is renewed)
      },
    },
  }))

  return (
    //Gets Blockchain data (wallet num ect (uses connecter (walletConnecnt, metamask ect)))
    <WagmiProviderBase config={config}>
      {/* allows use of hooks functions like useSociosWallet */}
      <QueryClientProvider client={queryClient}>
         {/*Rainbow kit provider*/}
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProviderBase>
  )
} 