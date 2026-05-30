import { AdminPageShell } from "@/components/admin/admin-page-shell";
import { DataTable } from "@/components/admin/data-table";
import { fetchAdmin, type TrustCertificateDto } from "@/lib/admin-api";

export const dynamic = "force-dynamic";

export default async function CertificatesPage() {
  let certificates: TrustCertificateDto[] = [];
  let error: string | null = null;

  try {
    certificates = await fetchAdmin<TrustCertificateDto[]>("/admin/trust-certificates");
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load certificates";
  }

  return (
    <AdminPageShell>
      <div className="mb-6">
        <h1 className="text-[22px] font-semibold text-[var(--dashboard-text)]">
          Certificates
        </h1>
        <p className="mt-1 text-[13px] text-[var(--dashboard-muted)]">
          View issued trust certificates and their status.
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
            { key: "entity", header: "Entity Type" },
            { key: "status", header: "Status" },
            { key: "issued", header: "Issued", width: "140px", cell: (r) => new Date(r.issuedAt).toLocaleDateString() },
            { key: "expires", header: "Expires", width: "140px", cell: (r) => new Date(r.expiresAt).toLocaleDateString() },
            { key: "hash", header: "Hash", cell: (r) => r.certificateHash.slice(0, 16) + "…" },
          ]}
          rows={certificates}
          keyExtractor={(r) => r.id}
        />
      )}
    </AdminPageShell>
  );
}
