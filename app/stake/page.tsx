import { Header } from "@/components/layout/header"
import { StakeForm } from "@/components/stake/stake-form"
import { StakeInfo } from "@/components/stake/stake-info"
import { TestnetFaucet } from "@/components/stake/testnet-faucet"

export default function StakePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Stake & Bet CHZ</h1>
          <div className="grid gap-8 md:grid-cols-2">
            <StakeInfo />
            <StakeForm />
          </div>
          <div className="mt-8">
            <TestnetFaucet />
          </div>
        </div>
      </main>
    </div>
  )
}
