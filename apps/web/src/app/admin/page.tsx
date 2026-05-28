import { DashboardShell } from "@/components/admin/dashboard-shell";
import { getAdminDashboardData } from "@/lib/admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const { data, connectionState } = await getAdminDashboardData();

  return <DashboardShell data={data} connectionState={connectionState} />;
}
