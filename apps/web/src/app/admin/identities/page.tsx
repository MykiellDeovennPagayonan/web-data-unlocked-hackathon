import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { DataTable } from "@/components/admin/data-table";
import { fetchAdmin, type IdentityDto } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

export default async function IdentitiesPage() {
  let identities: IdentityDto[] = [];
  let error: string | null = null;

  try {
    identities = await fetchAdmin<IdentityDto[]>("/admin/identities");
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load identities";
  }

  return (
    <AdminPageShell>
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-[var(--dashboard-text)]">
          Identities
        </h1>
        <p className="mt-1 text-[13px] text-[var(--dashboard-muted)]">
          Manage and review registered identities.
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
            { key: "email", header: "Email Hash", cell: (r) => r.emailHash.slice(0, 16) + "…" },
            { key: "status", header: "Trust Status" },
            { key: "verified", header: "Verified", align: "center", cell: (r) => (r.isHumanVerified ? "Yes" : "No") },
            { key: "created", header: "Created", width: "160px", cell: (r) => new Date(r.createdAt).toLocaleDateString() },
          ]}
          rows={identities}
          keyExtractor={(r) => r.id}
        />
      )}
    </AdminPageShell>
  );
}
