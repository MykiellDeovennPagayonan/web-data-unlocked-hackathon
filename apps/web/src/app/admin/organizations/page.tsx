import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { DataTable } from "@/components/admin/data-table";
import { fetchAdmin, type OrganizationDto } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

export default async function OrganizationsPage() {
  let organizations: OrganizationDto[] = [];
  let error: string | null = null;

  try {
    organizations = await fetchAdmin<OrganizationDto[]>("/admin/organizations");
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load organizations";
  }

  return (
    <AdminPageShell>
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-[var(--dashboard-text)]">
          Organizations
        </h1>
        <p className="mt-1 text-[13px] text-[var(--dashboard-muted)]">
          Review submitted organizations and their trust status.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
          {error}
        </div>
      ) : (
        <DataTable
          columns={[
            { key: "name", header: "Name", cell: (r) => r.legalName },
            { key: "domain", header: "Domain", cell: (r) => r.domain },
            { key: "country", header: "Country" },
            { key: "industry", header: "Industry" },
            { key: "status", header: "Trust Status" },
            { key: "created", header: "Created", width: "140px", cell: (r) => new Date(r.createdAt).toLocaleDateString() },
          ]}
          rows={organizations}
          keyExtractor={(r) => r.id}
        />
      )}
    </AdminPageShell>
  );
}
