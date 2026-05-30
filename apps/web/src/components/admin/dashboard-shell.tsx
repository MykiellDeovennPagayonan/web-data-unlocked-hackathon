import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  mockDashboardData,
  type DashboardConnectionState,
  type DashboardData,
} from "./dashboard-data";
import { LiveEventsTable } from "./live-events-table";
import { MetricCard } from "./metric-card";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { TrendChart } from "./trend-chart";
import { AccessMap } from "./access-map";
import {
  PendingReviewsCard,
  AiInsightsCard,
  CertificateHealthCard,
} from "./summary-cards";

export function DashboardShell({
  data = mockDashboardData,
  connectionState = { status: "ready" },
}: {
  data?: DashboardData;
  connectionState?: DashboardConnectionState;
}) {
  const trendPoints = deriveTrendPoints(data);
  const mapPoints = deriveMapPoints(data);
  const highPriorityReviews = data.pendingReviews.items.filter(
    (r) => r.riskLevel === "critical" || r.riskLevel === "high",
  ).length;
  const certificateGoodPercent = deriveCertificatePercent(data);

  return (
    <div className="min-h-screen bg-[var(--dashboard-bg)] text-[var(--dashboard-text)]">
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:block lg:w-[260px] 2xl:w-[292px]">
        <Sidebar />
      </div>
      <div className="min-w-0 lg:pl-[260px] 2xl:pl-[292px]">
        <TopBar platformName={data.platform?.name ?? "No platform"} />
        <main className="min-w-0 px-4 pb-12 pt-4 lg:px-6">
          <DashboardDataNotice state={connectionState} data={data} />

          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-[26px] font-bold tracking-[-0.02em] text-[var(--dashboard-text)]">
                TUNAI Intelligence Overview
              </h1>
            </div>
            <Button
              variant="outline"
              className="h-9 gap-2 rounded-lg border-[var(--dashboard-border)] bg-white px-4 text-[13px] font-semibold text-blue-600 shadow-[0_8px_30px_rgba(11,27,77,0.04)] hover:bg-blue-50"
            >
              <Download className="size-4 text-blue-600" aria-hidden="true" />
              Export Report
            </Button>
          </div>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {data.metrics.length > 0 ? (
              data.metrics
                .filter((m) => !/blocked event/i.test(m.label))
                .map((metric) => (
                  <MetricCard key={metric.label} metric={metric} />
                ))
            ) : (
              <MetricEmptyState />
            )}
          </section>

          <section className="mt-4 grid gap-4 lg:grid-cols-2">
            <TrendChart data={trendPoints} />
            <AccessMap points={mapPoints} />
          </section>

          <section className="mt-4 grid gap-4 md:grid-cols-3">
            <PendingReviewsCard
              items={data.pendingReviews.items}
              total={data.pendingReviews.total}
              highPriority={highPriorityReviews}
            />
            <AiInsightsCard insights={data.aiInsights} />
            <CertificateHealthCard
              percent={certificateGoodPercent}
              segments={data.certificateHealth.segments}
            />
          </section>

          <section className="mt-4">
            <LiveEventsTable
              events={data.accessEvents.rows}
              total={data.accessEvents.total}
              isStreaming={data.accessEvents.isStreaming}
            />
          </section>
        </main>
      </div>
    </div>
  );
}

function deriveTrendPoints(
  data: DashboardData,
): Array<{ date: string; events: number }> {
  const accessEventsMetric = data.metrics.find((m) =>
    /access event/i.test(m.label),
  );
  const chartData =
    accessEventsMetric?.chartData ?? data.metrics[0]?.chartData ?? [];
  const now = new Date();
  return chartData.map((value, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (chartData.length - 1 - i));
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      events: value,
    };
  });
}

function deriveMapPoints(
  data: DashboardData,
): Array<{ name: string; coordinates: [number, number]; events: number }> {
  return data.geoActivity.points.map((point) => ({
    name: point.location,
    coordinates: [point.longitude, point.latitude] as [number, number],
    events: point.events,
  }));
}

function deriveCertificatePercent(data: DashboardData): number {
  const good = data.certificateHealth.segments.find((s) => s.label === "Good");
  if (good) {
    const total = data.certificateHealth.segments.reduce(
      (sum, s) => sum + s.value,
      0,
    );
    return total > 0 ? Math.round((good.value / total) * 100) : 0;
  }
  return 0;
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
    <article className="min-h-[96px] rounded-lg border border-dashed border-[var(--dashboard-border)] bg-white p-4 text-[13px] font-medium text-[var(--dashboard-muted)] sm:col-span-2 lg:col-span-4">
      Backend metrics will appear here once dashboard data is available.
    </article>
  );
}
