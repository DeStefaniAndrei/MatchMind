"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, CheckCircle, Smartphone, Monitor } from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"

export function WalletHelp() {
  const { sociosWalletAvailable } = useWallet()
  const [showHelp, setShowHelp] = useState(false)

  const walletSteps = [
    {
      title: "MetaMask",
      icon: <Monitor className="h-4 w-4" />,
      steps: [
        "Install MetaMask extension from metamask.io",
        "Create or import a wallet",
        "Unlock MetaMask (enter password)",
        "Click 'Connect Wallet' and approve the connection",
        "Switch to Chiliz Chain (Chain ID: 88888)"
      ]
    },
    {
      title: "Socios Wallet",
      icon: <Smartphone className="h-4 w-4" />,
      steps: [
        "Download Socios app from your app store",
        "Create or import a wallet",
        "Ensure you're on Chiliz Chain",
        "Click 'Connect Wallet' in the dApp"
      ],
      available: sociosWalletAvailable
    }
  ]

  return (
    <div className="space-y-4">
      <Button 
        variant="outline" 
        onClick={() => setShowHelp(!showHelp)}
        className="w-full"
      >
        {showHelp ? "Hide Help" : "Need Help Connecting?"}
      </Button>

      {showHelp && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Wallet Connection Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {walletSteps.map((wallet, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  {wallet.icon}
                  <h3 className="font-medium">{wallet.title}</h3>
                  {wallet.available && (
                    <Badge variant="outline" className="text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Available
                    </Badge>
                  )}
                </div>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  {wallet.steps.map((step, stepIndex) => (
                    <li key={stepIndex}>{step}</li>
                  ))}
                </ol>
              </div>
            ))}
            
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Tip:</strong> If MetaMask is locked, unlock it first by entering your password, then try connecting again.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 