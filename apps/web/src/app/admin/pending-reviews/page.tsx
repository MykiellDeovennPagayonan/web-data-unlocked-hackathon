import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { DataTable } from "@/components/admin/data-table";
import {
  fetchAdmin,
  type VerificationRequestDto,
  type CommunityReportDto,
} from "@/lib/admin-api";

export const dynamic = "force-dynamic";

export default async function PendingReviewsPage() {
  let verifications: VerificationRequestDto[] = [];
  let reports: CommunityReportDto[] = [];
  let error: string | null = null;

  try {
    [verifications, reports] = await Promise.all([
      fetchAdmin<VerificationRequestDto[]>("/admin/compliance/verification-requests?status=pending"),
      fetchAdmin<CommunityReportDto[]>("/admin/community-reports?status=pending"),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load pending reviews";
  }

  return (
    <AdminPageShell>
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-[var(--dashboard-text)]">
          Pending Reviews
        </h1>
        <p className="mt-1 text-[13px] text-[var(--dashboard-muted)]">
          Verification requests and community reports awaiting review.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
          {error}
        </div>
      ) : (
        <div className="grid gap-6">
          <section>
            <h2 className="mb-3 text-[14px] font-semibold text-[var(--dashboard-text)]">
              Verification Requests ({verifications.length})
            </h2>
            <DataTable
              columns={[
                { key: "id", header: "ID", width: "260px", cell: (r) => r.id.slice(0, 8) + "…" },
                { key: "type", header: "Type", cell: (r) => r.verificationType },
                { key: "provider", header: "Provider" },
                { key: "status", header: "Status" },
                { key: "created", header: "Created", width: "140px", cell: (r) => new Date(r.createdAt).toLocaleDateString() },
              ]}
              rows={verifications}
              keyExtractor={(r) => r.id}
              emptyMessage="No pending verification requests."
            />
          </section>

          <section>
            <h2 className="mb-3 text-[14px] font-semibold text-[var(--dashboard-text)]">
              Community Reports ({reports.length})
            </h2>
            <DataTable
              columns={[
                { key: "id", header: "ID", width: "260px", cell: (r) => r.id.slice(0, 8) + "…" },
                { key: "category", header: "Category" },
                { key: "severity", header: "Severity" },
                { key: "target", header: "Target Type", cell: (r) => r.targetType },
                { key: "created", header: "Created", width: "140px", cell: (r) => new Date(r.createdAt).toLocaleDateString() },
              ]}
              rows={reports}
              keyExtractor={(r) => r.id}
              emptyMessage="No pending community reports."
            />
          </section>
        </div>
      )}
    </AdminPageShell>
  );
}
