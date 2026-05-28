import { DashboardShell } from "@/components/admin/dashboard-shell";
import { emptyDashboardData } from "@/components/admin/dashboard-data";

export default function AdminDashboardLoading() {
  return (
    <DashboardShell
      data={emptyDashboardData}
      connectionState={{
        status: "loading",
        message: "Loading backend dashboard data...",
      }}
    />
  );
}
