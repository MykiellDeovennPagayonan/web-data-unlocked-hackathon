import { ArrowRight, Info, Minus, Plus } from "lucide-react";
import {
  type DistributionSegment,
  type GeoActivity,
  type GeoAttackFlow,
  type GeoPoint,
  type RiskListItem,
} from "./dashboard-data";
import { DonutChart } from "./charts";

export function GeographicRiskPanel({ activity }: { activity: GeoActivity }) {
  const callout = activity.callout;
  const calloutStyle = callout
    ? {
        left: `clamp(12px, calc(${(callout.x / 1000) * 100}% - 24px), calc(100% - 196px))`,
        top: `clamp(12px, calc(${(callout.y / 360) * 100}% + 18px), calc(100% - 124px))`,
      }
    : undefined;

  return (
    <section className="min-h-[318px] rounded-lg border border-[var(--dashboard-border)] bg-white shadow-[0_8px_30px_rgba(11,27,77,0.04)]">
      <div className="flex flex-wrap items-center gap-4 px-5 pt-4">
        <div className="flex items-center gap-2">
          <h2 className="text-[14px] font-semibold text-[var(--dashboard-text)]">
            THREAT ORIGINS / GEOGRAPHIC RISK ACTIVITY
          </h2>
          <Info className="size-3.5 text-[var(--dashboard-muted)]" aria-hidden="true" />
        </div>
        <div className="ml-auto flex items-center gap-4 text-[11px] font-semibold text-[var(--dashboard-text)]">
          <Legend color="bg-blue-600" label={`Low ${activity.legendCounts.low}`} />
          <Legend
            color="bg-amber-500"
            label={`Medium ${activity.legendCounts.medium}`}
          />
          <Legend color="bg-red-500" label={`High ${activity.legendCounts.high}`} />
          <span className="flex items-center gap-1.5">
            <span className="h-px w-4 bg-red-300" />
            Attack Flow {activity.legendCounts.attackFlow}
          </span>
        </div>
      </div>

      <div className="relative mx-4 mt-3 h-[240px] overflow-hidden rounded-md bg-[#f6f9fe]">
        <WorldRiskMap activity={activity} />
        {callout ? (
          <div
            className="absolute z-20 w-[184px] rounded-lg border border-[var(--dashboard-border)] bg-white p-3 shadow-[0_16px_40px_rgba(11,27,77,0.13)]"
            style={calloutStyle}
          >
            <div className="text-[12px] font-semibold text-[var(--dashboard-text)]">
              {callout.location}
            </div>
            <div className="mt-2 grid grid-cols-[1fr_auto] gap-y-1 text-[11px] font-medium">
              <span className="text-[var(--dashboard-muted)]">Risk Level</span>
              <span className="inline-flex items-center gap-1.5 text-[var(--dashboard-text)]">
                <span
                  className={`size-2 rounded-full ${riskMarkerClass(callout.riskLevel)}`}
                />
                {callout.riskLevel[0].toUpperCase()}
                {callout.riskLevel.slice(1)}
              </span>
              <span className="text-[var(--dashboard-muted)]">Events (24h)</span>
              <span className="text-[var(--dashboard-text)]">
                {callout.events.toLocaleString()}
              </span>
              <span className="text-[var(--dashboard-muted)]">Coordinate</span>
              <span className="text-[var(--dashboard-text)]">
                {callout.latitude.toFixed(2)}, {callout.longitude.toFixed(2)}
              </span>
            </div>
          </div>
        ) : (
          <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 rounded-lg border border-dashed border-[var(--dashboard-border)] bg-white/85 px-4 py-5 text-center text-[12px] font-medium text-[var(--dashboard-muted)]">
            Geographic activity requires backend access events with IP location fields.
          </div>
        )}
        <div className="absolute bottom-3 right-3 overflow-hidden rounded-md border border-[var(--dashboard-border)] bg-white">
          <button className="grid size-8 place-items-center border-b border-[var(--dashboard-border)] text-[var(--dashboard-text)] hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            <Plus className="size-4" aria-hidden="true" />
            <span className="sr-only">Zoom in</span>
          </button>
          <button className="grid size-8 place-items-center text-[var(--dashboard-text)] hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            <Minus className="size-4" aria-hidden="true" />
            <span className="sr-only">Zoom out</span>
          </button>
        </div>
      </div>

      <a
        href="#"
        className="mx-5 mt-3 inline-flex items-center gap-2 text-[12px] font-semibold text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        View full geo analysis
        <ArrowRight className="size-4" aria-hidden="true" />
      </a>
    </section>
  );
}

export function RiskyListPanel({
  title,
  kind,
  rows,
}: {
  title: string;
  kind: "ip" | "asn";
  rows: RiskListItem[];
}) {
  return (
    <section className="rounded-lg border border-[var(--dashboard-border)] bg-white p-4 shadow-[0_8px_30px_rgba(11,27,77,0.04)]">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-[13px] font-semibold text-[var(--dashboard-text)]">{title}</h2>
        <Info className="size-3.5 text-[var(--dashboard-muted)]" aria-hidden="true" />
      </div>
      <table className="w-full text-left">
        <thead>
          <tr className="text-[10px] font-semibold uppercase text-[var(--dashboard-muted)]">
            <th className="pb-2">{kind === "ip" ? "IP Address" : "ASN Number"}</th>
            <th className="pb-2">Risk Score</th>
            <th className="pb-2 text-right">Events</th>
          </tr>
        </thead>
        <tbody className="text-[11px] font-semibold">
          {rows.length > 0 ? rows.map((row) => (
            <RiskyRow key={row.name} row={row} />
          )) : (
            <tr className="border-t border-[var(--dashboard-border)]">
              <td
                colSpan={3}
                className="py-8 text-center text-[12px] font-medium text-[var(--dashboard-muted)]"
              >
                No backend risk data.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}

export function DistributionPanel({
  title,
  total,
  segments,
  type,
}: {
  title: string;
  total: string;
  segments: DistributionSegment[];
  type: "risk" | "cert";
}) {
  const linkLabel = type === "risk" ? "View risk explorer" : "View certificates";

  return (
    <section className="rounded-lg border border-[var(--dashboard-border)] bg-white p-4 shadow-[0_8px_30px_rgba(11,27,77,0.04)]">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-[13px] font-semibold text-[var(--dashboard-text)]">{title}</h2>
        <Info className="size-3.5 text-[var(--dashboard-muted)]" aria-hidden="true" />
      </div>
      <div className="flex min-h-[112px] items-center gap-4">
        <DonutChart segments={segments} total={total} />
        <div className="min-w-0 flex-1 space-y-1.5">
          {segments.length > 0 ? segments.map((segment) => (
            <LegendRow key={segment.label} segment={segment} />
          )) : (
            <div className="text-[12px] font-medium text-[var(--dashboard-muted)]">
              No backend distribution data.
            </div>
          )}
        </div>
      </div>
      <a
        href="#"
        className="mt-3 inline-flex items-center gap-2 text-[12px] font-semibold text-blue-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        {linkLabel}
        <ArrowRight className="size-4" aria-hidden="true" />
      </a>
    </section>
  );
}

function RiskyRow({ row }: { row: RiskListItem }) {
  const tone =
    row.level === "critical"
      ? "text-red-600"
      : row.level === "high"
        ? "text-red-500"
        : "text-amber-500";

  return (
    <tr className="border-t border-[var(--dashboard-border)]">
      <td className="py-2 pr-2 font-mono text-blue-600">{row.name}</td>
      <td className={`whitespace-nowrap py-2 pr-2 ${tone}`}>
        {row.score} {row.level[0].toUpperCase()}
        {row.level.slice(1)}
      </td>
      <td className="py-2 text-right text-[var(--dashboard-text)]">{row.events}</td>
    </tr>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`size-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}

function LegendRow({ segment }: { segment: DistributionSegment }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 text-[10px] font-medium">
      <span className="flex min-w-0 items-center gap-2 text-[var(--dashboard-text)]">
        <span
          className="size-2 shrink-0 rounded-full"
          style={{ backgroundColor: segment.color }}
        />
        <span className="truncate">{segment.label}</span>
      </span>
      <span className="text-[var(--dashboard-muted)]">
        {segment.percent} ({segment.count})
      </span>
    </div>
  );
}

function WorldRiskMap({ activity }: { activity: GeoActivity }) {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1000 360"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <rect width="1000" height="360" fill="#f6f9fe" />
      <g stroke="#ecf2fa" strokeWidth="1">
        <path d="M0 90H1000" />
        <path d="M0 180H1000" />
        <path d="M0 270H1000" />
        <path d="M167 0V360" />
        <path d="M334 0V360" />
        <path d="M501 0V360" />
        <path d="M668 0V360" />
        <path d="M835 0V360" />
      </g>
      <image
        href="/world-risk-map.svg"
        x="16"
        y="18"
        width="968"
        height="314"
        preserveAspectRatio="none"
        opacity=".88"
      />
      {activity.attackFlows.map((flow) => (
        <AttackFlowPath key={flow.id} flow={flow} />
      ))}
      {activity.points
        .filter((point) => point.riskLevel === "low")
        .map((point) => (
          <MapMarker key={point.id} point={point} />
        ))}
      <g filter="url(#riskGlow)">
        {activity.points
          .filter((point) => point.riskLevel !== "low")
          .map((point) => (
            <MapMarker key={point.id} point={point} />
          ))}
      </g>
      <defs>
        <filter id="riskGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="9" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}

function AttackFlowPath({ flow }: { flow: GeoAttackFlow }) {
  const controlX = (flow.source.x + flow.target.x) / 2;
  const controlY = Math.min(flow.source.y, flow.target.y) - 82;
  const color = flow.riskLevel === "high" ? "#ff6b6b" : "#f59e0b";

  return (
    <path
      d={`M${flow.source.x} ${flow.source.y} Q ${controlX} ${controlY} ${flow.target.x} ${flow.target.y}`}
      fill="none"
      stroke={color}
      strokeDasharray="4 5"
      strokeLinecap="round"
      strokeWidth="1.4"
      opacity=".72"
    />
  );
}

function MapMarker({ point }: { point: GeoPoint }) {
  const color =
    point.riskLevel === "high"
      ? "#ef4444"
      : point.riskLevel === "medium"
        ? "#f59e0b"
        : "#0b6ff6";
  const radius = Math.min(15, Math.max(3, 2.2 + Math.log(point.events + 1) * 1.3));

  if (point.riskLevel === "low") {
    return (
      <circle cx={point.x} cy={point.y} r="2.4" fill={color} opacity=".78">
        <title>{`${point.location} - ${point.events} events`}</title>
      </circle>
    );
  }

  return (
    <g>
      <circle cx={point.x} cy={point.y} r={radius} fill={color} opacity=".38" />
      <circle cx={point.x} cy={point.y} r={Math.max(4, radius * 0.42)} fill={color} opacity=".9" />
      <circle cx={point.x} cy={point.y} r="2.6" fill="#ffffff" opacity=".86" />
      <title>{`${point.location} - ${point.riskLevel} - ${point.events} events`}</title>
    </g>
  );
}

function riskMarkerClass(level: GeoPoint["riskLevel"]) {
  if (level === "high") {
    return "bg-red-500";
  }

  if (level === "medium") {
    return "bg-amber-500";
  }

  return "bg-blue-600";
}
