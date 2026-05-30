import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { DataTable } from "@/components/admin/data-table";
import { fetchAdmin, type WebhookLogDto } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

export default async function WebhookLogsPage() {
  let logs: WebhookLogDto[] = [];
  let error: string | null = null;

  try {
    logs = await fetchAdmin<WebhookLogDto[]>("/admin/webhooks/logs");
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load webhook logs";
  }

  return (
    <AdminPageShell>
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-[var(--dashboard-text)]">
          Webhook Logs
        </h1>
        <p className="mt-1 text-[13px] text-[var(--dashboard-muted)]">
          Review webhook delivery attempts and responses.
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-700">
          {error}
        </div>
      ) : (
        <DataTable
          columns={[
            { key: "id", header: "ID", width: "260px", cell: (r) => r.id.slice(0, 8) + "…" },
            { key: "eventType", header: "Event Type" },
            { key: "responseStatus", header: "Response", align: "right", cell: (r) => String(r.responseStatus) },
            { key: "attempts", header: "Attempts", align: "right", cell: (r) => String(r.attemptNumber) },
            { key: "delivered", header: "Delivered", align: "center", cell: (r) => (r.deliveredAt ? "Yes" : "No") },
            { key: "created", header: "Created", width: "160px", cell: (r) => new Date(r.createdAt).toLocaleString() },
          ]}
          rows={logs}
          keyExtractor={(r) => r.id}
        />
      )}
    </AdminPageShell>
  );
}
