"use client"

import { ConnectButton } from '@rainbow-me/rainbowkit'

export function WalletConnectButton() {
  return (
    <ConnectButton 
      showBalance={true}
      chainStatus="icon"
      accountStatus={{
        smallScreen: 'avatar',
        largeScreen: 'full',
      }}
    />
  )
} 