import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Sidebar from "@/components/Sidebar"
import TopNavbar from "@/components/TopNavbar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-white">
      <TopNavbar role={session.user.role} userName={session.user.name} />
      <div className="flex pt-16 min-h-screen">
        {/* Desktop sidebar */}
        <div className="hidden lg:block shrink-0">
          <div className="fixed top-16 left-0 bottom-0 w-64">
            <Sidebar role={session.user.role} userName={session.user.name} />
          </div>
        </div>
        {/* Main content */}
        <main className="flex-1 p-6 lg:ml-64 overflow-auto max-w-[1200px]">
          {children}
        </main>
      </div>
    </div>
  )
}
