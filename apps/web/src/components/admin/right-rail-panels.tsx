import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Info,
  ShieldAlert,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import type { ReviewItem, WebhookHealth } from "./dashboard-data";
import { WebhookHealthChart } from "./charts";
import { StatusBadge } from "./status-badge";

export function PendingReviewsPanel({
  items,
  total,
}: {
  items: ReviewItem[];
  total: number;
}) {
  return (
    <section className="rounded-lg border border-[var(--dashboard-border)] bg-white shadow-[0_8px_30px_rgba(11,27,77,0.04)]">
      <PanelHeader title="PENDING REVIEWS" trailing={String(total)} />
      <div className="divide-y divide-[var(--dashboard-border)]">
        {items.length > 0 ? items.map((item) => (
          <article key={`${item.title}-${item.time}`} className="flex gap-3 px-5 py-2">
            <span className={iconTone(item.riskLevel)}>
              {item.riskLevel === "medium" ? (
                <TriangleAlert className="size-4" aria-hidden="true" />
              ) : (
                <ShieldAlert className="size-4" aria-hidden="true" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[12px] font-semibold text-[var(--dashboard-text)]">
                {item.title}
              </div>
              <div className="mt-1 truncate text-[11px] font-medium text-[var(--dashboard-muted)]">
                {item.meta}
              </div>
            </div>
            <span className="shrink-0 text-[11px] font-medium text-[var(--dashboard-muted)]">
              {item.time}
            </span>
          </article>
        )) : (
          <div className="px-5 py-8 text-[12px] font-medium text-[var(--dashboard-muted)]">
            No pending backend reviews.
          </div>
        )}
      </div>
      <PanelLink label="View all pending reviews" href="/admin/pending-reviews" />
    </section>
  );
}

export function AiInsightsPanel({ insights }: { insights: string[] }) {
  return (
    <section className="rounded-lg border border-[var(--dashboard-border)] bg-white shadow-[0_8px_30px_rgba(11,27,77,0.04)]">
      <div className="flex items-center gap-2 px-5 pt-4">
        <Sparkles className="size-4 text-blue-600" aria-hidden="true" />
        <h2 className="text-[14px] font-semibold text-[var(--dashboard-text)]">
          AI INSIGHTS
        </h2>
        <StatusBadge level="beta" className="ml-auto">
          BETA
        </StatusBadge>
      </div>
      <div className="space-y-2 px-5 py-3">
        {insights.length > 0 ? insights.map((insight) => (
          <div
            key={insight}
            className="flex gap-2 text-[12px] font-medium leading-5 text-[var(--dashboard-muted)]"
          >
            <span className="mt-[7px] size-1 rounded-full bg-blue-600" />
            <span>{insight}</span>
          </div>
        )) : (
          <div className="text-[12px] font-medium leading-5 text-[var(--dashboard-muted)]">
            Backend insights will appear after events and reviews are available.
          </div>
        )}
      </div>
    </section>
  );
}

export function WebhookDeliveryPanel({ webhook }: { webhook: WebhookHealth }) {
  return (
    <section className="rounded-lg border border-[var(--dashboard-border)] bg-white px-5 py-4 shadow-[0_8px_30px_rgba(11,27,77,0.04)]">
      <div className="flex items-center gap-2">
        <h2 className="text-[14px] font-semibold text-[var(--dashboard-text)]">
          WEBHOOK DELIVERY HEALTH
        </h2>
        <Info className="size-3.5 text-[var(--dashboard-muted)]" aria-hidden="true" />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <HealthStat
          label="Success Rate"
          value={webhook.successRate}
          delta={webhook.successDelta}
          tone={webhook.successDelta.startsWith("-") ? "down" : "up"}
        />
        <HealthStat
          label="Failures"
          value={webhook.failures}
          delta={webhook.failureDelta}
          tone={webhook.failureDelta.startsWith("-") ? "up" : "down"}
        />
        <HealthStat
          label="Avg. Latency"
          value={webhook.avgLatency}
          delta={webhook.latencyDelta}
          tone={webhook.latencyDelta.startsWith("-") ? "up" : "down"}
        />
      </div>

      <div className="mt-3">
        <WebhookHealthChart data={webhook.series} />
      </div>

      <a
        href="/admin/webhook-logs"
        className="mt-2 inline-flex items-center gap-2 text-[12px] font-semibold text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        View webhook logs
        <ArrowRight className="size-4" aria-hidden="true" />
      </a>
    </section>
  );
}

function PanelHeader({ title, trailing }: { title: string; trailing?: string }) {
  return (
    <div className="flex items-center gap-2 px-5 py-4">
      <h2 className="text-[14px] font-semibold text-[var(--dashboard-text)]">{title}</h2>
      {trailing ? (
        <span className="ml-auto rounded-md bg-blue-50 px-2 py-1 text-[12px] font-semibold text-[var(--dashboard-text)]">
          {trailing}
        </span>
      ) : null}
    </div>
  );
}

function PanelLink({ label, href = "#" }: { label: string; href?: string }) {
  return (
    <a
      href={href}
      className="mx-5 mb-4 inline-flex items-center gap-2 text-[12px] font-semibold text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      {label}
      <ArrowRight className="size-4" aria-hidden="true" />
    </a>
  );
}

function HealthStat({
  label,
  value,
  delta,
  tone,
}: {
  label: string;
  value: string;
  delta: string;
  tone: "up" | "down";
}) {
  const Icon = tone === "up" ? ArrowUp : ArrowDown;

  return (
    <div>
      <div className="text-[11px] font-medium text-[var(--dashboard-muted)]">{label}</div>
      <div className="mt-1 flex items-center gap-2">
        <span className="text-[17px] font-semibold text-[var(--dashboard-text)]">{value}</span>
        <span
          className={
            tone === "up"
              ? "inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-500"
              : "inline-flex items-center gap-1 text-[12px] font-semibold text-red-500"
          }
        >
          <Icon className="size-3" aria-hidden="true" />
          {delta}
        </span>
      </div>
    </div>
  );
}

function iconTone(level: "critical" | "high" | "medium" | "low") {
  if (level === "critical" || level === "high") {
    return "grid size-9 shrink-0 place-items-center rounded-full bg-red-50 text-red-500";
  }

  return "grid size-9 shrink-0 place-items-center rounded-full bg-amber-50 text-amber-500";
}
