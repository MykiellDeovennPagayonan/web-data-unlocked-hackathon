import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { DataTable } from "@/components/admin/data-table";
import { fetchAdmin, type AccessEventDto } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

export default async function AccessEventsPage() {
  let events: AccessEventDto[] = [];
  let error: string | null = null;

  try {
    events = await fetchAdmin<AccessEventDto[]>("/admin/access/events/platform/default");
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load access events";
  }

  return (
    <AdminPageShell>
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-[var(--dashboard-text)]">
          Access Events
        </h1>
        <p className="mt-1 text-[13px] text-[var(--dashboard-muted)]">
          View all platform access events.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
          {error}
        </div>
      ) : (
        <DataTable
          columns={[
            { key: "time", header: "Time", width: "160px", cell: (r) => new Date(r.createdAt).toLocaleString() },
            { key: "identity", header: "Identity", cell: (r) => r.identityId ?? "—" },
            { key: "eventType", header: "Event Type" },
            { key: "verdict", header: "Verdict" },
            { key: "score", header: "Score", align: "right", cell: (r) => String(r.scoreAtEvent) },
          ]}
          rows={events}
          keyExtractor={(r) => r.id}
        />
      )}
    </AdminPageShell>
  );
}
