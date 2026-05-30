import {
  emptyDashboardData,
  type AccessEvent,
  type DashboardConnectionState,
  type DashboardData,
  type DistributionSegment,
  type GeoActivity,
  type GeoAttackFlow,
  type GeoPoint,
  type Metric,
  type ReviewItem,
  type RiskLevel,
  type RiskListItem,
} from "@/components/admin/dashboard-data";

export type DashboardLoadResult = {
  data: DashboardData;
  connectionState: DashboardConnectionState;
};

export const apiBaseUrl =
  process.env.TUNAI_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8090";

export async function getAdminDashboardData(): Promise<DashboardLoadResult> {
  try {
    const response = await fetch(`${apiBaseUrl}/admin/dashboard`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const payload: unknown = await response.json();
    const data = normalizeDashboardData(payload);

    if (data.status === "empty") {
      return {
        data,
        connectionState: {
          status: "empty",
          message: data.emptyReason ?? "No backend dashboard data is available.",
        },
      };
    }

    return { data, connectionState: { status: "ready" } };
  } catch (error) {
    return {
      data: {
        ...emptyDashboardData,
        emptyReason:
          error instanceof Error
            ? error.message
            : "Unable to load backend dashboard data.",
      },
      connectionState: {
        status: "error",
        message:
          error instanceof Error
            ? `Backend dashboard unavailable: ${error.message}`
            : "Backend dashboard unavailable.",
      },
    };
  }
}

function normalizeDashboardData(payload: unknown): DashboardData {
  const record = asRecord(payload);
  if (!record) {
    throw new Error("Malformed dashboard payload");
  }

  const platform = asRecord(record.platform);
  const accessEvents = asRecord(record.accessEvents);
  const pendingReviews = asRecord(record.pendingReviews);
  const riskDistribution = asRecord(record.riskDistribution);
  const certificateHealth = asRecord(record.certificateHealth);
  const footer = asRecord(record.footer);

  return {
    status: record.status === "empty" ? "empty" : "ready",
    generatedAt: readString(record.generatedAt) ?? new Date().toISOString(),
    emptyReason: readString(record.emptyReason) ?? undefined,
    platform: platform
      ? {
          id: readString(platform.id) ?? "",
          name: readString(platform.name) ?? "Unknown platform",
          domain: readString(platform.domain) ?? "",
        }
      : null,
    metrics: readArray(record.metrics).map(normalizeMetric),
    accessEvents: {
      rows: readArray(accessEvents?.rows).map(normalizeAccessEvent),
      total: readNumber(accessEvents?.total),
      isStreaming: readBoolean(accessEvents?.isStreaming),
    },
    pendingReviews: {
      items: readArray(pendingReviews?.items).map(normalizeReview),
      total: readNumber(pendingReviews?.total),
    },
    aiInsights: readArray(record.aiInsights)
      .map((item) => readString(item))
      .filter((item): item is string => Boolean(item)),
    webhook: normalizeWebhook(record.webhook),
    geoActivity: normalizeGeoActivity(record.geoActivity),
    riskyIps: readArray(record.riskyIps).map(normalizeRiskListItem),
    riskyAsns: readArray(record.riskyAsns).map(normalizeRiskListItem),
    riskDistribution: {
      total: formatNumber(readNumber(riskDistribution?.total)),
      segments: readArray(riskDistribution?.segments).map(normalizeSegment),
    },
    certificateHealth: {
      total: formatNumber(readNumber(certificateHealth?.total)),
      segments: readArray(certificateHealth?.segments).map(normalizeSegment),
    },
    footer: {
      systemStatus: readString(footer?.systemStatus) ?? "Waiting for data",
      dataLastUpdated: formatTimestamp(readString(footer?.dataLastUpdated)),
      streamHealth: readString(footer?.streamHealth) ?? "Idle",
      eventsPerSecond: formatNumber(readNumber(footer?.eventsPerSecond)),
    },
  };
}

function normalizeMetric(value: unknown): Metric {
  const record = asRecord(value);
  return {
    label: readString(record?.label) ?? "METRIC",
    value: readString(record?.value) ?? "0",
    trend: readString(record?.trend) ?? "0%",
    trendDirection: normalizeTrendDirection(record?.trendDirection),
    comparison: readString(record?.comparison) ?? "vs 24h ago",
    icon: normalizeMetricIcon(record?.icon),
    tone: record?.tone === "red" ? "red" : "blue",
    chartData: readArray(record?.chartData).map(readNumber),
  };
}

function normalizeAccessEvent(value: unknown): AccessEvent {
  const record = asRecord(value);
  return {
    id: readString(record?.id) ?? undefined,
    time: readString(record?.time) ?? "--:--:--",
    identity: readString(record?.identity) ?? "unknown-identity",
    identityId: readString(record?.identityId) ?? "unknown",
    ipAddress: readString(record?.ipAddress) ?? "0.0.0.0",
    action: readString(record?.action) ?? "UNKNOWN",
    riskLevel: normalizeRiskLevel(record?.riskLevel),
    trustScore: readNumber(record?.trustScore),
    flag: readString(record?.flag) ?? "",
    location: readString(record?.location) ?? "Unknown",
    device: readString(record?.device) ?? "Unknown device",
    client: readString(record?.client) ?? "Unknown client",
  };
}

function normalizeReview(value: unknown): ReviewItem {
  const record = asRecord(value);
  return {
    title: readString(record?.title) ?? "Review required",
    meta: readString(record?.meta) ?? "Backend review",
    time: readString(record?.time) ?? "now",
    riskLevel: normalizeRiskLevel(record?.riskLevel),
  };
}

function normalizeRiskListItem(value: unknown): RiskListItem {
  const record = asRecord(value);
  const level = normalizeRiskLevel(record?.level);
  return {
    name: readString(record?.name) ?? "Unknown",
    score: readNumber(record?.score),
    level: level === "low" ? "medium" : level,
    events: formatNumber(readNumber(record?.events)),
  };
}

function normalizeSegment(value: unknown): DistributionSegment {
  const record = asRecord(value);
  const count = readNumber(record?.count);
  const percent = readNumber(record?.percent);

  return {
    label: readString(record?.label) ?? "Unknown",
    value: readNumber(record?.value),
    percent: `${percent.toFixed(1)}%`,
    count: formatNumber(count),
    color: readString(record?.color) ?? "#94a3b8",
  };
}

function normalizeWebhook(value: unknown): DashboardData["webhook"] {
  const record = asRecord(value);
  const latencyDelta = readNumber(record?.latencyDeltaMs);

  return {
    successRate: `${readNumber(record?.successRate).toFixed(1)}%`,
    successDelta: `${formatSigned(readNumber(record?.successDelta))}%`,
    failures: formatNumber(readNumber(record?.failures)),
    failureDelta: formatSigned(readNumber(record?.failureDelta)),
    avgLatency: `${formatNumber(readNumber(record?.avgLatencyMs))} ms`,
    latencyDelta: `${formatSigned(latencyDelta)}ms`,
    series: readArray(record?.series).map((point) => {
      const pointRecord = asRecord(point);
      return {
        time: readString(pointRecord?.time) ?? "--:--",
        success: readNumber(pointRecord?.success),
      };
    }),
  };
}

function normalizeGeoActivity(value: unknown): GeoActivity {
  const record = asRecord(value);
  const points = readArray(record?.points).map(normalizeGeoPoint);
  const attackFlows = readArray(record?.attackFlows).map(normalizeAttackFlow);
  const legendCounts = asRecord(record?.legendCounts);
  const calloutRecord = asRecord(record?.callout);
  const calloutId = calloutRecord ? readString(calloutRecord.id) : null;

  return {
    points,
    attackFlows,
    legendCounts: {
      low: readNumber(legendCounts?.low),
      medium: readNumber(legendCounts?.medium),
      high: readNumber(legendCounts?.high),
      attackFlow: readNumber(legendCounts?.attackFlow),
    },
    callout:
      points.find((point) => point.id === calloutId) ??
      (calloutRecord ? normalizeGeoPoint(calloutRecord) : null),
  };
}

function normalizeGeoPoint(value: unknown): GeoPoint {
  const record = asRecord(value);
  return {
    id: readString(record?.id) ?? cryptoSafeId(record),
    location: readString(record?.location) ?? readString(record?.label) ?? "Unknown",
    country: readString(record?.country) ?? "Unknown",
    region: readString(record?.region) ?? "Unknown",
    latitude: readNumber(record?.latitude),
    longitude: readNumber(record?.longitude),
    source: normalizeGeoSource(record?.source),
    x: readNumber(record?.x),
    y: readNumber(record?.y),
    ipAddress: readString(record?.ipAddress) ?? "0.0.0.0",
    asn: readString(record?.asn) ?? "Unknown ASN",
    riskScore: readNumber(record?.riskScore),
    riskLevel: normalizeGeoRisk(record?.riskLevel),
    events: readNumber(record?.events),
  };
}

function normalizeAttackFlow(value: unknown): GeoAttackFlow {
  const record = asRecord(value);
  const source = asRecord(record?.source);
  const target = asRecord(record?.target);
  const riskLevel = normalizeGeoRisk(record?.riskLevel);

  return {
    id: readString(record?.id) ?? cryptoSafeId(record),
    sourceLocation: readString(record?.sourceLocation) ?? "Unknown",
    targetLocation: readString(record?.targetLocation) ?? "Unknown",
    source: { x: readNumber(source?.x), y: readNumber(source?.y) },
    target: { x: readNumber(target?.x), y: readNumber(target?.y) },
    riskLevel: riskLevel === "low" ? "medium" : riskLevel,
    events: readNumber(record?.events),
  };
}

function normalizeRiskLevel(value: unknown): RiskLevel {
  if (
    value === "critical" ||
    value === "high" ||
    value === "medium" ||
    value === "low"
  ) {
    return value;
  }

  return "low";
}

function normalizeGeoRisk(value: unknown) {
  if (value === "high" || value === "medium" || value === "low") {
    return value;
  }

  return "low";
}

function normalizeGeoSource(value: unknown): GeoPoint["source"] {
  if (value === "region" || value === "country" || value === "unknown") {
    return value;
  }

  return "unknown";
}

function normalizeMetricIcon(value: unknown): Metric["icon"] {
  if (
    value === "activity" ||
    value === "identity" ||
    value === "shield" ||
    value === "lock" ||
    value === "score"
  ) {
    return value;
  }

  return "activity";
}

function normalizeTrendDirection(value: unknown): Metric["trendDirection"] {
  if (value === "up" || value === "down" || value === "flat") {
    return value;
  }

  return "flat";
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function readString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function readNumber(value: unknown): number {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function readBoolean(value: unknown): boolean {
  return value === true;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatSigned(value: number): string {
  if (value > 0) {
    return `+${value}`;
  }

  if (value < 0) {
    return `${value}`;
  }

  return "0";
}

function formatTimestamp(value: string | null): string {
  if (!value) {
    return "No backend data";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${date.toISOString().slice(11, 19)} UTC`;
}

function cryptoSafeId(value: unknown): string {
  return JSON.stringify(value).slice(0, 48);
}
