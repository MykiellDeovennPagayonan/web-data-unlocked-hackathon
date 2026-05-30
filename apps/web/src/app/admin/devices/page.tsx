import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { DataTable } from "@/components/admin/data-table";
import { fetchAdmin, type DeviceDto } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

export default async function DevicesPage() {
  let devices: DeviceDto[] = [];
  let error: string | null = null;

  try {
    devices = await fetchAdmin<DeviceDto[]>("/admin/devices");
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load devices";
  }

  return (
    <AdminPageShell>
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-[var(--dashboard-text)]">
          Devices
        </h1>
        <p className="mt-1 text-[13px] text-[var(--dashboard-muted)]">
          View resolved device fingerprints and risk scores.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
          {error}
        </div>
      ) : (
        <DataTable
          columns={[
            { key: "id", header: "ID", width: "280px", cell: (r) => r.id.slice(0, 8) + "…" },
            { key: "hash", header: "Stable Hash", cell: (r) => r.stableHash.slice(0, 16) + "…" },
            { key: "riskScore", header: "Risk Score", align: "right", cell: (r) => String(r.riskScore) },
            { key: "flagged", header: "Flagged", align: "center", cell: (r) => (r.isFlagged ? "Yes" : "No") },
            { key: "lastSeen", header: "Last Seen", width: "160px", cell: (r) => new Date(r.lastSeenAt).toLocaleString() },
          ]}
          rows={devices}
          keyExtractor={(r) => r.id}
        />
      )}
    </AdminPageShell>
  );
}
