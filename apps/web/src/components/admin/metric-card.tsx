import {
  Activity,
  ArrowUp,
  Lock,
  TrendingUp,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import type { ComponentType } from "react";
import type { Metric } from "./dashboard-data";
import { Sparkline } from "./charts";

const iconMap = {
  activity: Activity,
  identity: UserRound,
  shield: ShieldAlert,
  lock: Lock,
  score: TrendingUp,
} satisfies Record<Metric["icon"], ComponentType<{ className?: string }>>;

export function MetricCard({ metric }: { metric: Metric }) {
  const Icon = iconMap[metric.icon];
  const isRiskMetric = metric.tone === "red";
  const isScoreMetric = metric.icon === "score";
  const chartColor = isRiskMetric
    ? "#ff3b30"
    : isScoreMetric
      ? "#10b981"
      : "#0b6ff6";
  const trendIsDown = metric.trendDirection === "down";
  const trendIsGood = isRiskMetric ? trendIsDown : !trendIsDown;

  return (
    <article className="flex min-h-[104px] min-w-0 rounded-lg border border-[var(--dashboard-border)] bg-white p-3 shadow-[0_8px_30px_rgba(11,27,77,0.04)]">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="whitespace-nowrap text-[13px] font-semibold text-[var(--dashboard-text)]">
          {metric.label}
        </div>
        <div className="mt-2 text-[29px] font-semibold leading-none tracking-[-0.01em] text-[var(--dashboard-text)]">
          {metric.value}
        </div>
        <div className="mt-auto flex items-center gap-2 whitespace-nowrap text-[12px] font-medium">
          <span className={trendIsGood ? "text-emerald-500" : "text-red-500"}>
            <ArrowUp
              className={`mr-1 inline size-3 ${trendIsDown ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
            {metric.trend}
          </span>
          <span className="text-[var(--dashboard-muted)]">
            {metric.comparison}
          </span>
        </div>
      </div>
      <div className="ml-3 flex shrink-0 flex-col items-end justify-between">
        <span
          className={
            isRiskMetric
              ? "grid size-9 place-items-center rounded-lg bg-red-50 text-red-500"
              : isScoreMetric
                ? "grid size-9 place-items-center rounded-lg bg-emerald-50 text-emerald-600"
                : "grid size-9 place-items-center rounded-lg bg-blue-50 text-blue-600"
          }
        >
          <Icon className="size-5 stroke-[1.7]" aria-hidden="true" />
        </span>
        <Sparkline data={metric.chartData} color={chartColor} />
      </div>
    </article>
  );
}
