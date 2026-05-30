import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { DataTable } from "@/components/admin/data-table";
import { fetchAdmin, type PlatformDto } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  let platforms: PlatformDto[] = [];
  let error: string | null = null;

  try {
    platforms = await fetchAdmin<PlatformDto[]>("/admin/platforms");
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load platforms";
  }

  return (
    <AdminPageShell>
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-[var(--dashboard-text)]">
          Settings
        </h1>
        <p className="mt-1 text-[13px] text-[var(--dashboard-muted)]">
          Platform configuration and management.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
          {error}
        </div>
      ) : (
        <DataTable
          columns={[
            { key: "name", header: "Name", cell: (r) => r.name },
            { key: "domain", header: "Domain" },
            { key: "status", header: "Status" },
            { key: "strictness", header: "Strictness Level", cell: (r) => r.strictnessLevel },
            { key: "created", header: "Created", width: "140px", cell: (r) => new Date(r.createdAt).toLocaleDateString() },
          ]}
          rows={platforms}
          keyExtractor={(r) => r.id}
          emptyMessage="No platforms found."
        />
      )}
    </AdminPageShell>
  );
}
