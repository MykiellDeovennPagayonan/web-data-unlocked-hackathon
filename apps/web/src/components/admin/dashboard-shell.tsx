import { Activity, CircleDot, Database, ShieldCheck } from "lucide-react";
import {
  DistributionPanel,
  GeographicRiskPanel,
  RiskyListPanel,
} from "./analytics-panels";
import {
  mockDashboardData,
  type DashboardConnectionState,
  type DashboardData,
} from "./dashboard-data";
import { LiveEventsTable } from "./live-events-table";
import { MetricCard } from "./metric-card";
import {
  AiInsightsPanel,
  PendingReviewsPanel,
  WebhookDeliveryPanel,
} from "./right-rail-panels";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";

export function DashboardShell({
  data = mockDashboardData,
  connectionState = { status: "ready" },
}: {
  data?: DashboardData;
  connectionState?: DashboardConnectionState;
}) {
  return (
    <div className="min-h-screen bg-[var(--dashboard-bg)] text-[var(--dashboard-text)]">
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:block lg:w-[260px] 2xl:w-[292px]">
        <Sidebar />
      </div>
      <div className="min-w-0 lg:pl-[260px] 2xl:pl-[292px]">
        <TopBar platformName={data.platform?.name ?? "No platform"} />
        <main className="min-w-0 px-4 pb-12 pt-4 lg:px-6">
          <DashboardDataNotice state={connectionState} data={data} />
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {data.metrics.length > 0 ? (
              data.metrics.map((metric) => (
                <MetricCard key={metric.label} metric={metric} />
              ))
            ) : (
              <MetricEmptyState />
            )}
          </section>

          <section className="mt-4 grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_420px] 2xl:grid-cols-[minmax(0,1fr)_520px_500px]">
            <div className="min-w-0 xl:col-span-2 2xl:col-span-1 2xl:col-start-1">
              <LiveEventsTable
                events={data.accessEvents.rows}
                total={data.accessEvents.total}
                isStreaming={data.accessEvents.isStreaming}
              />
            </div>
            <div className="min-w-0 xl:col-span-2 2xl:col-span-1 2xl:col-start-1">
              <GeographicRiskPanel activity={data.geoActivity} />
            </div>
            <div className="grid gap-4 lg:grid-cols-2 2xl:col-start-2">
              <RiskyListPanel
                title="TOP RISKY IPs"
                rows={data.riskyIps}
                kind="ip"
              />
              <RiskyListPanel
                title="TOP RISKY ASNs"
                rows={data.riskyAsns}
                kind="asn"
              />
              <DistributionPanel
                title="RISK DISTRIBUTION"
                total={data.riskDistribution.total}
                segments={data.riskDistribution.segments}
                type="risk"
              />
              <DistributionPanel
                title="CERTIFICATE HEALTH"
                total={data.certificateHealth.total}
                segments={data.certificateHealth.segments}
                type="cert"
              />
            </div>
            <div className="grid gap-4 xl:col-start-2 2xl:col-start-3">
              <AiInsightsPanel insights={data.aiInsights} />
              <WebhookDeliveryPanel webhook={data.webhook} />
            </div>
          </section>

          <DashboardStatusStrip data={data} />
        </main>
      </div>
    </div>
  );
}

function DashboardDataNotice({
  state,
  data,
}: {
  state: DashboardConnectionState;
  data: DashboardData;
}) {
  if (state.status === "ready" && data.status === "ready") {
    return null;
  }

  const tone =
    state.status === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : state.status === "loading"
        ? "border-blue-200 bg-blue-50 text-blue-700"
        : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <div
      className={`mb-4 rounded-lg border px-4 py-3 text-[13px] font-medium ${tone}`}
    >
      {state.message ?? data.emptyReason ?? "Dashboard data is unavailable."}
    </div>
  );
}

function MetricEmptyState() {
  return (
    <article className="min-h-[124px] rounded-lg border border-dashed border-[var(--dashboard-border)] bg-white p-4 text-[13px] font-medium text-[var(--dashboard-muted)] md:col-span-2 xl:col-span-5">
      Backend metrics will appear here once dashboard data is available.
    </article>
  );
}

function DashboardStatusStrip({ data }: { data: DashboardData }) {
  return (
    <footer className="fixed bottom-0 right-0 z-20 hidden h-9 items-center gap-x-8 border-t border-[var(--dashboard-border)] bg-[var(--dashboard-bg)] px-6 text-[12px] font-medium text-[var(--dashboard-muted)] lg:left-[260px] lg:flex 2xl:left-[292px]">
      <span className="inline-flex items-center gap-2">
        <ShieldCheck className="size-4" aria-hidden="true" />
        System Status
      </span>
      <span className="inline-flex items-center gap-2 text-emerald-600">
        <CircleDot className="size-3 fill-current" aria-hidden="true" />
        {data.footer.systemStatus}
      </span>
      <span className="ml-auto inline-flex items-center gap-2">
        <Database className="size-4" aria-hidden="true" />
        Data last updated: {data.footer.dataLastUpdated}
      </span>
      <span className="inline-flex items-center gap-2">
        <Activity className="size-4" aria-hidden="true" />
        Stream Health
      </span>
      <span className="inline-flex items-center gap-2 text-emerald-600">
        <CircleDot className="size-3 fill-current" aria-hidden="true" />
        {data.footer.streamHealth}
      </span>
      <span>Event/sec: {data.footer.eventsPerSecond}</span>
    </footer>
  );
}
