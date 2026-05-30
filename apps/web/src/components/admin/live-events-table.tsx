"use client";

import { ArrowRight, MoreHorizontal } from "lucide-react";
import { StatusBadge, ScoreBar } from "./status-badge";
import type { AccessEvent } from "./dashboard-data";

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
      <div className="flex items-center justify-between border-b border-[var(--dashboard-border)] px-5 py-3">
        <div className="flex items-center gap-3">
          <h2 className="text-[14px] font-semibold text-[var(--dashboard-text)]">
            Live Access Events
          </h2>
          <span className="flex items-center gap-2 text-[12px] font-medium text-[var(--dashboard-muted)]">
            <span className="size-2 rounded-full bg-emerald-500" />
            Streaming
          </span>
        </div>
        <a
          href="/admin/access-events"
          className="inline-flex items-center gap-2 text-[12px] font-semibold text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          View all events
          <ArrowRight className="size-4" aria-hidden="true" />
        </a>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead>
            <tr className="h-9 border-b border-[var(--dashboard-border)] text-[11px] font-semibold uppercase tracking-wide text-[var(--dashboard-muted)]">
              <th className="w-[90px] px-5">Time</th>
              <th className="w-[180px] px-3">Identity</th>
              <th className="w-[130px] px-3">IP Address</th>
              <th className="w-[110px] px-3">Action</th>
              <th className="w-[140px] px-3">Location</th>
              <th className="w-[100px] px-3">Risk Level</th>
              <th className="w-[100px] px-3">Trust Score</th>
              <th className="w-[80px] px-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {events.length > 0 ? (
              events.map((event, i) => (
                <tr
                  key={event.id ?? `${event.time}-${event.identity}-${i}`}
                  className="h-[44px] border-b border-[var(--dashboard-border)] text-[12px] transition-colors hover:bg-slate-50/70"
                >
                  <td className="px-5">
                    <div className="font-medium text-[var(--dashboard-text)]">
                      {event.time}
                    </div>
                  </td>
                  <td className="px-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e8f0fe] text-[11px] font-bold text-[#0b6ff6]">
                        {event.identity
                          .split(/[.@]/)[0]
                          .split(/[_-]/)
                          .map((p) => p[0]?.toUpperCase() || "")
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <div>
                        <a
                          href="#"
                          className="block font-semibold text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                        >
                          {event.identity}
                        </a>
                        <div className="font-mono text-[11px] text-[var(--dashboard-muted)]">
                          ID: {event.identityId}
                        </div>
                      </div>
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
                    {event.action
                      .toLowerCase()
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                  </td>
                  <td className="px-3">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const code =
                          event.location
                            .split(", ")
                            .pop()
                            ?.slice(0, 2)
                            .toUpperCase() || "";
                        const flag = code
                          .split("")
                          .map((c) =>
                            String.fromCodePoint(
                              0x1f1e6 + c.charCodeAt(0) - 65,
                            ),
                          )
                          .join("");
                        return (
                          <span
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-base leading-none"
                            title={code}
                          >
                            {flag}
                          </span>
                        );
                      })()}
                      <span className="font-medium text-[var(--dashboard-text)]">
                        {event.location}
                      </span>
                    </div>
                  </td>
                  <td className="px-3">
                    <StatusBadge level={event.riskLevel} />
                  </td>
                  <td className="px-3">
                    <ScoreBar value={event.trustScore} />
                  </td>
                  <td className="px-3">
                    <a
                      href="#"
                      aria-label="More details"
                      className="inline-flex items-center justify-center rounded-md p-1 text-blue-600 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      <MoreHorizontal className="size-4" aria-hidden="true" />
                    </a>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="h-[180px] px-5 text-center text-[13px] font-medium text-[var(--dashboard-muted)]"
                >
                  No access events available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3 px-5 py-3 text-[12px] font-medium text-[var(--dashboard-muted)]">
        <span>
          Showing {events.length > 0 ? 1 : 0} to {events.length} of{" "}
          {total.toLocaleString()} events
        </span>
      </div>
    </section>
  );
}
