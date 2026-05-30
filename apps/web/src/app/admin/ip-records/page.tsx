import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { DataTable } from "@/components/admin/data-table";
import { fetchAdmin, type IpRecordDto } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

export default async function IpRecordsPage() {
  let records: IpRecordDto[] = [];
  let error: string | null = null;

  try {
    records = await fetchAdmin<IpRecordDto[]>("/admin/ip-records");
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load IP records";
  }

  return (
    <AdminPageShell>
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-[var(--dashboard-text)]">
          IP Records
        </h1>
        <p className="mt-1 text-[13px] text-[var(--dashboard-muted)]">
          Browse evaluated IP addresses and their intelligence.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
          {error}
        </div>
      ) : (
        <DataTable
          columns={[
            { key: "ip", header: "IP Address", cell: (r) => r.ipAddress },
            { key: "type", header: "Type" },
            { key: "country", header: "Country" },
            { key: "asn", header: "ASN" },
            { key: "riskScore", header: "Risk Score", align: "right", cell: (r) => String(r.riskScore) },
            { key: "blacklisted", header: "Blacklisted", align: "center", cell: (r) => (r.isBlacklisted ? "Yes" : "No") },
          ]}
          rows={records}
          keyExtractor={(r) => r.id}
        />
      )}
    </AdminPageShell>
  );
}
