import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { DataTable } from "@/components/admin/data-table";
import { fetchAdmin, type PlatformDto, type ApiKeyDto } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  let platforms: PlatformDto[] = [];
  let error: string | null = null;

  try {
    platforms = await fetchAdmin<PlatformDto[]>("/admin/platforms");
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load platforms";
  }

  const platform = platforms[0];
  let apiKeys: ApiKeyDto[] = [];

  if (platform) {
    try {
      apiKeys = await fetchAdmin<ApiKeyDto[]>(`/admin/api-keys/platforms/${platform.id}`);
    } catch {
      // ignore api key fetch errors
    }
  }

  return (
    <AdminPageShell>
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-[var(--dashboard-text)]">
          Integrations
        </h1>
        <p className="mt-1 text-[13px] text-[var(--dashboard-muted)]">
          API keys and platform integrations.
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
              Platforms ({platforms.length})
            </h2>
            <DataTable
              columns={[
                { key: "name", header: "Name", cell: (r) => r.name },
                { key: "domain", header: "Domain" },
                { key: "status", header: "Status" },
                { key: "strictness", header: "Strictness", cell: (r) => r.strictnessLevel },
              ]}
              rows={platforms}
              keyExtractor={(r) => r.id}
              emptyMessage="No platforms configured."
            />
          </section>

          {platform && (
            <section>
              <h2 className="mb-3 text-[14px] font-semibold text-[var(--dashboard-text)]">
                API Keys — {platform.name} ({apiKeys.length})
              </h2>
              <DataTable
                columns={[
                  { key: "name", header: "Name" },
                  { key: "scopes", header: "Scopes", cell: (r) => r.scopes.join(", ") },
                  { key: "created", header: "Created", width: "140px", cell: (r) => new Date(r.createdAt).toLocaleDateString() },
                  { key: "expires", header: "Expires", width: "140px", cell: (r) => (r.expiresAt ? new Date(r.expiresAt).toLocaleDateString() : "Never") },
                  { key: "revoked", header: "Revoked", align: "center", cell: (r) => (r.revokedAt ? "Yes" : "No") },
                ]}
                rows={apiKeys}
                keyExtractor={(r) => r.id}
                emptyMessage="No API keys for this platform."
              />
            </section>
          )}
        </div>
      )}
    </AdminPageShell>
  );
}
