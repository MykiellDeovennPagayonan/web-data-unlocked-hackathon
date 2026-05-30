import { ArrowRight, ChevronDown, Ellipsis, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AccessEvent } from "./dashboard-data";
import { ScoreBar, StatusBadge } from "./status-badge";

export function LiveEventsTable({
  events,
  total,
  isStreaming,
}: {
  events: AccessEvent[];
  total: number;
  isStreaming: boolean;
}) {
  return (
    <section className="rounded-lg border border-[var(--dashboard-border)] bg-white shadow-[0_8px_30px_rgba(11,27,77,0.04)]">
      <div className="flex flex-wrap items-center gap-3 border-b border-[var(--dashboard-border)] px-5 py-2.5">
        <div className="flex items-center gap-4">
          <h2 className="text-[14px] font-semibold text-[var(--dashboard-text)]">
            LIVE ACCESS EVENTS
          </h2>
          <span className="flex items-center gap-2 text-[12px] font-medium text-[var(--dashboard-muted)]">
            <span
              className={`size-2 rounded-full ${isStreaming ? "bg-emerald-500" : "bg-slate-300"}`}
            />
            {isStreaming ? "Streaming" : "Idle"}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="lg"
            className="h-8 gap-8 rounded-md bg-white text-[12px] font-semibold text-[var(--dashboard-text)]"
          >
            All Events
            <ChevronDown className="size-4 text-[var(--dashboard-muted)]" aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-8 rounded-md bg-white text-[12px] font-semibold text-[var(--dashboard-text)]"
          >
            <Filter className="size-4 text-blue-600" aria-hidden="true" />
            Filters (3)
            <ChevronDown className="size-4 text-[var(--dashboard-muted)]" aria-hidden="true" />
          </Button>
          <Button variant="outline" size="icon-lg" className="h-8 w-10 rounded-md" aria-label="Open event actions">
            <Ellipsis className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[950px] border-collapse text-left">
          <thead>
            <tr className="h-8 border-b border-[var(--dashboard-border)] text-[11px] font-semibold uppercase text-[var(--dashboard-muted)]">
              <th className="w-[88px] px-5">Time</th>
              <th className="w-[190px] px-3">Identity</th>
              <th className="w-[145px] px-3">IP Address</th>
              <th className="w-[120px] px-3">Action</th>
              <th className="w-[116px] px-3">Risk Level</th>
              <th className="w-[140px] px-3">Trust Score</th>
              <th className="w-[150px] px-3">Location</th>
              <th className="w-[150px] px-3">Device / Client</th>
            </tr>
          </thead>
          <tbody>
            {events.length > 0 ? events.map((event) => (
              <tr
                key={event.id ?? `${event.time}-${event.identity}`}
                className="h-[40px] border-b border-[var(--dashboard-border)] text-[12px] transition-colors hover:bg-slate-50/70"
              >
                <td className="px-5">
                  <div className="flex items-center gap-2 font-medium text-[var(--dashboard-text)]">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    {event.time}
                  </div>
                </td>
                <td className="px-3">
                  <a
                    href="#"
                    className="block font-semibold text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    {event.identity}
                  </a>
                  <div className="font-mono text-[11px] text-[var(--dashboard-muted)]">
                    ID: {event.identityId}
                  </div>
                </td>
                <td className="px-3">
                  <a
                    href="/admin/ip-records"
                    className="font-mono font-semibold text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    {event.ipAddress}
                  </a>
                </td>
                <td className="px-3 font-semibold text-[var(--dashboard-text)]">
                  {event.action}
                </td>
                <td className="px-3">
                  <StatusBadge level={event.riskLevel} />
                </td>
                <td className="px-3">
                  <ScoreBar value={event.trustScore} />
                </td>
                <td className="px-3">
                  <span className="flex items-center gap-2 font-medium text-[var(--dashboard-text)]">
                    <span className="text-[14px] leading-none">{event.flag}</span>
                    {event.location}
                  </span>
                </td>
                <td className="px-3">
                  <div className="font-semibold text-[var(--dashboard-text)]">{event.device}</div>
                  <div className="text-[11px] font-medium text-[var(--dashboard-muted)]">
                    {event.client}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td
                  colSpan={8}
                  className="h-[220px] px-5 text-center text-[13px] font-medium text-[var(--dashboard-muted)]"
                >
                  No backend access events are available for this platform.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-3 px-5 py-2.5 text-[12px] font-medium text-[var(--dashboard-muted)]">
        <span>
          Showing {events.length > 0 ? 1 : 0} to {events.length} of{" "}
          {total.toLocaleString()} events
        </span>
        <a
          href="/admin/access-events"
          className="ml-auto inline-flex items-center gap-2 font-semibold text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          View all events
          <ArrowRight className="size-4" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
