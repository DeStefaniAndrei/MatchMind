import { Header } from "@/components/layout/header"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { MatchManagement } from "@/components/admin/match-management"
import { QuestionManagement } from "@/components/admin/question-management"
import { PayoutManagement } from "@/components/admin/payout-management"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>
        <div className="grid gap-8">
          <AdminDashboard />
          <div className="grid gap-8 lg:grid-cols-2">
            <MatchManagement />
            <QuestionManagement />
          </div>
          <PayoutManagement />
        </div>
      </main>
    </div>
  )
}
