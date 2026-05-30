import { cn } from "@/lib/utils";

export function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  keyExtractor,
  emptyMessage = "No data available.",
}: {
  columns: {
    key: string;
    header: string;
    width?: string;
    align?: "left" | "right" | "center";
    cell?: (row: T) => React.ReactNode;
  }[];
  rows: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--dashboard-border)] bg-white p-8 text-center text-[13px] text-[var(--dashboard-muted)]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--dashboard-border)] bg-white">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b border-[var(--dashboard-border)]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-[var(--dashboard-muted)]",
                  col.align === "right" && "text-right",
                  col.align === "center" && "text-center",
                )}
                style={col.width ? { width: col.width } : undefined}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={keyExtractor(row)}
              className="border-b border-[var(--dashboard-border)] transition-colors hover:bg-slate-50/60 last:border-b-0"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-[var(--dashboard-text)]",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                  )}
                >
                  {col.cell ? col.cell(row) : String((row as Record<string, unknown>)[col.key] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
