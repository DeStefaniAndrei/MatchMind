import { Header } from "@/components/layout/header"
import AdminDashboard from "@/components/admin/admin-dashboard"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <AdminDashboard />
      </main>
    </div>
  )
}
