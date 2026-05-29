import { DashboardShell } from "@/components/admin/dashboard-shell";
import { mockDashboardData } from "@/components/admin/dashboard-data";

export default function AdminMockPage() {
  return <DashboardShell data={mockDashboardData} />;
}
