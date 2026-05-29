import { Injectable } from '@nestjs/common';
import { AccessVerdict, CertificateStatus } from '../../generated/client';
import {
  buildDistribution,
  calculateTrendPercent,
  riskLevelFromTrustScore,
  riskListLevelFromRiskScore,
  roundToOneDecimal,
  type DashboardDistributionSegment,
} from './admin-dashboard-analytics';
import { AdminDashboardRepository } from './admin-dashboard.repository';
import type {
  AdminDashboardDto,
  DashboardAccessEventDto,
  DashboardCommunityReportRecord,
  DashboardEventRecord,
  DashboardMetricDto,
  DashboardRecords,
  DashboardReviewDto,
  DashboardRiskListItemDto,
  DashboardVerificationRequestRecord,
} from './admin-dashboard.types';
import { buildGeoActivity, type GeoEventOrigin } from './geo-location';

const dayMs = 24 * 60 * 60 * 1000;

@Injectable()
export class AdminDashboardService {
  constructor(private readonly repository: AdminDashboardRepository) {}

  async getDashboard(platformId?: string): Promise<AdminDashboardDto> {
    const records = await this.repository.getDashboardRecords(platformId);

    if (!records.platform) {
      return createEmptyDashboard('No platform data is available yet.');
    }

    return {
      status: 'ready',
      generatedAt: new Date().toISOString(),
      platform: records.platform,
      metrics: this.buildMetrics(records),
      accessEvents: {
        rows: records.latestEvents.map((event) => toAccessEventDto(event)),
        total: records.currentEvents.length + records.previousEvents.length,
        isStreaming:
          records.activeSessions > 0 || records.currentEvents.length > 0,
      },
      pendingReviews: this.buildPendingReviews(records),
      aiInsights: this.buildAiInsights(records),
      webhook: this.buildWebhook(records),
      geoActivity: buildGeoActivity(
        this.buildGeoOrigins(records.currentEvents),
        resolveDestination(records.platform.domain),
      ),
      riskyIps: this.buildRiskyIps(records.currentEvents),
      riskyAsns: this.buildRiskyAsns(records.currentEvents),
      riskDistribution: this.buildRiskDistribution(records.currentEvents),
      certificateHealth: this.buildCertificateHealth(records),
      footer: {
        systemStatus: 'All Systems Operational',
        dataLastUpdated:
          records.latestEvents[0]?.createdAt.toISOString() ??
          new Date().toISOString(),
        streamHealth: records.activeSessions > 0 ? 'Live' : 'Idle',
        eventsPerSecond: roundToOneDecimal(
          records.currentEvents.length / 86400,
        ),
      },
    };
  }

  private buildMetrics(records: DashboardRecords): DashboardMetricDto[] {
    const currentRisky = records.currentEvents.filter(isRiskyEvent).length;
    const previousRisky = records.previousEvents.filter(isRiskyEvent).length;
    const currentBlocked = records.currentEvents.filter(isBlockedEvent).length;
    const previousBlocked =
      records.previousEvents.filter(isBlockedEvent).length;
    const averageTrust = averageTrustScore(records.currentEvents);
    const previousAverageTrust = averageTrustScore(records.previousEvents);
    const trustDelta = Math.round(averageTrust - previousAverageTrust);

    return [
      {
        label: 'ACCESS EVENTS',
        value: formatCompactNumber(records.currentEvents.length),
        trend: `${Math.abs(
          calculateTrendPercent(
            records.currentEvents.length,
            records.previousEvents.length,
          ),
        ).toFixed(1)}%`,
        trendDirection: trendDirection(
          records.currentEvents.length,
          records.previousEvents.length,
        ),
        comparison: 'vs 24h ago',
        icon: 'activity',
        tone: 'blue',
        chartData: buildEventSeries(records.currentEvents),
      },
      {
        label: 'IDENTITIES',
        value: formatWholeNumber(records.identityCount),
        trend: `${Math.abs(
          calculateTrendPercent(
            records.currentIdentityJoins.length,
            records.previousIdentityJoins.length,
          ),
        ).toFixed(1)}%`,
        trendDirection: trendDirection(
          records.currentIdentityJoins.length,
          records.previousIdentityJoins.length,
        ),
        comparison: 'vs 24h ago',
        icon: 'identity',
        tone: 'blue',
        chartData: buildDateSeries(records.currentIdentityJoins),
      },
      {
        label: 'RISKY EVENTS',
        value: formatWholeNumber(currentRisky),
        trend: `${Math.abs(
          calculateTrendPercent(currentRisky, previousRisky),
        ).toFixed(1)}%`,
        trendDirection: trendDirection(currentRisky, previousRisky),
        comparison: 'vs 24h ago',
        icon: 'shield',
        tone: 'red',
        chartData: buildEventSeries(records.currentEvents.filter(isRiskyEvent)),
      },
      {
        label: 'BLOCKED EVENTS',
        value: formatWholeNumber(currentBlocked),
        trend: `${Math.abs(
          calculateTrendPercent(currentBlocked, previousBlocked),
        ).toFixed(1)}%`,
        trendDirection: trendDirection(currentBlocked, previousBlocked),
        comparison: 'vs 24h ago',
        icon: 'lock',
        tone: 'red',
        chartData: buildEventSeries(
          records.currentEvents.filter(isBlockedEvent),
        ),
      },
      {
        label: 'TRUST SCORE (AVG)',
        value: String(averageTrust),
        trend: `${Math.abs(trustDelta)} pts`,
        trendDirection:
          trustDelta > 0 ? 'up' : trustDelta < 0 ? 'down' : 'flat',
        comparison: 'vs 24h ago',
        icon: 'score',
        tone: 'blue',
        chartData: [averageTrust],
      },
    ];
  }

  private buildPendingReviews(records: DashboardRecords): {
    items: DashboardReviewDto[];
    total: number;
  } {
    const reportItems = records.pendingReports.map(toReportReview);
    const verificationItems =
      records.pendingVerifications.map(toVerificationReview);
    const items = [...reportItems, ...verificationItems]
      .sort(
        (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
      )
      .map(({ createdAt, ...item }) => ({
        ...item,
        time: formatTimeAgo(createdAt),
      }));

    return {
      items: items.slice(0, 6),
      total: items.length,
    };
  }

  private buildAiInsights(records: DashboardRecords): string[] {
    const criticalCount = records.currentEvents.filter(
      (event) =>
        riskLevelFromTrustScore(toNumber(event.scoreAtEvent)) === 'critical',
    ).length;
    const riskyIp = this.buildRiskyIps(records.currentEvents)[0];
    const geoCallout = buildGeoActivity(
      this.buildGeoOrigins(records.currentEvents),
    ).callout;
    const pendingTotal =
      records.pendingReports.length + records.pendingVerifications.length;

    return [
      riskyIp
        ? `IP risk for ${riskyIp.name} is elevated after ${riskyIp.events.toLocaleString()} access events in the last 24h.`
        : 'No elevated IP clusters detected in the current 24h window.',
      `${criticalCount} critical sign-ins require immediate attention`,
      `${pendingTotal} pending reviews need a human decision`,
      geoCallout
        ? `${geoCallout.location} is the leading geographic risk origin with ${geoCallout.events.toLocaleString()} events`
        : 'Geographic activity is unavailable until access events include location data.',
    ];
  }

  private buildWebhook(records: DashboardRecords) {
    const now = new Date();
    const currentStart = new Date(now.getTime() - dayMs);
    const current = records.webhookLogs.filter(
      (log) => new Date(log.createdAt).getTime() >= currentStart.getTime(),
    );
    const previous = records.webhookLogs.filter(
      (log) => new Date(log.createdAt).getTime() < currentStart.getTime(),
    );
    const currentFailures = current.filter(
      (log) => !isDelivered(log.responseStatus),
    );
    const previousFailures = previous.filter(
      (log) => !isDelivered(log.responseStatus),
    );
    const currentLatency = averageLatency(current);
    const previousLatency = averageLatency(previous);

    return {
      successRate: successRate(current),
      successDelta: roundToOneDecimal(
        successRate(current) - successRate(previous),
      ),
      failures: currentFailures.length,
      failureDelta: currentFailures.length - previousFailures.length,
      avgLatencyMs: currentLatency,
      latencyDeltaMs: currentLatency - previousLatency,
      series: buildWebhookSeries(current),
    };
  }

  private buildGeoOrigins(events: DashboardEventRecord[]): GeoEventOrigin[] {
    const grouped = new Map<string, GeoEventOrigin>();

    for (const event of events) {
      const key = `${event.ip.country}:${event.ip.region}:${event.ip.asn}:${event.ip.ipAddress}`;
      const existing = grouped.get(key);
      const riskScore = toNumber(event.ip.riskScore);

      if (existing) {
        existing.events += 1;
        existing.riskScore = Math.max(existing.riskScore, riskScore);
      } else {
        grouped.set(key, {
          ipAddress: event.ip.ipAddress,
          country: event.ip.country,
          region: event.ip.region,
          asn: event.ip.asn,
          riskScore,
          events: 1,
        });
      }
    }

    return [...grouped.values()].sort((left, right) => {
      if (right.riskScore !== left.riskScore) {
        return right.riskScore - left.riskScore;
      }
      return right.events - left.events;
    });
  }

  private buildRiskyIps(
    events: DashboardEventRecord[],
  ): DashboardRiskListItemDto[] {
    const grouped = new Map<string, { score: number; events: number }>();

    for (const event of events) {
      const ipAddress = event.ip.ipAddress;
      const existing = grouped.get(ipAddress);
      const score = toNumber(event.ip.riskScore);

      if (existing) {
        existing.events += 1;
        existing.score = Math.max(existing.score, score);
      } else {
        grouped.set(ipAddress, { score, events: 1 });
      }
    }

    return [...grouped.entries()]
      .map(([name, value]) => ({
        name,
        score: Math.round(value.score),
        level: riskListLevelFromRiskScore(value.score),
        events: value.events,
      }))
      .sort((left, right) => {
        if (right.score !== left.score) {
          return right.score - left.score;
        }
        return right.events - left.events;
      })
      .slice(0, 5);
  }

  private buildRiskyAsns(
    events: DashboardEventRecord[],
  ): DashboardRiskListItemDto[] {
    const grouped = new Map<string, { score: number; events: number }>();

    for (const event of events) {
      const existing = grouped.get(event.ip.asn);
      const score = toNumber(event.ip.riskScore);

      if (existing) {
        existing.events += 1;
        existing.score = Math.max(existing.score, score);
      } else {
        grouped.set(event.ip.asn, { score, events: 1 });
      }
    }

    return [...grouped.entries()]
      .map(([name, value]) => ({
        name,
        score: Math.round(value.score),
        level: riskListLevelFromRiskScore(value.score),
        events: value.events,
      }))
      .sort((left, right) => {
        if (right.score !== left.score) {
          return right.score - left.score;
        }
        return right.events - left.events;
      })
      .slice(0, 5);
  }

  private buildRiskDistribution(events: DashboardEventRecord[]) {
    const riskyEvents = events.filter(isRiskyEvent);
    const levels = riskyEvents.map((event) =>
      riskLevelFromTrustScore(toNumber(event.scoreAtEvent)),
    );

    return {
      total: riskyEvents.length,
      segments: buildDistribution(levels),
    };
  }

  private buildCertificateHealth(records: DashboardRecords): {
    total: number;
    segments: DashboardDistributionSegment[];
  } {
    const now = Date.now();
    const expiringThreshold = now + 30 * dayMs;
    const counts = {
      Good: 0,
      Expiring: 0,
      Invalid: 0,
      Revoked: 0,
      Unknown: 0,
    };

    for (const certificate of records.certificates) {
      const expiresAt = new Date(certificate.expiresAt).getTime();

      if (certificate.status === CertificateStatus.revoked) {
        counts.Revoked += 1;
      } else if (
        certificate.status === CertificateStatus.expired ||
        expiresAt < now
      ) {
        counts.Invalid += 1;
      } else if (expiresAt <= expiringThreshold) {
        counts.Expiring += 1;
      } else if (certificate.status === CertificateStatus.active) {
        counts.Good += 1;
      } else {
        counts.Unknown += 1;
      }
    }

    return {
      total: records.certificates.length,
      segments: buildNamedDistribution(counts, {
        Good: '#3b82f6',
        Expiring: '#f59e0b',
        Invalid: '#ef4444',
        Revoked: '#64748b',
        Unknown: '#94a3b8',
      }),
    };
  }
}

function toAccessEventDto(
  event: DashboardEventRecord,
): DashboardAccessEventDto {
  const riskLevel = riskLevelFromTrustScore(toNumber(event.scoreAtEvent));

  return {
    id: event.id,
    time: formatUtcTime(event.createdAt),
    identity:
      event.identity?.encryptedEmail ??
      event.org?.legalName ??
      'unknown-identity',
    identityId: shortId(event.identity?.id ?? event.org?.id ?? event.id),
    ipAddress: event.ip.ipAddress,
    action: formatAction(event.eventType),
    riskLevel: riskLevel === 'unknown' ? 'low' : riskLevel,
    trustScore: Math.round(toNumber(event.scoreAtEvent)),
    flag: countryFlag(event.ip.country),
    location: `${event.ip.region}, ${event.ip.country}`,
    device:
      readString(event.triggeredRules, 'device') ?? event.device.stableHash,
    client: readString(event.triggeredRules, 'client') ?? 'Unknown client',
  };
}

function toReportReview(report: DashboardCommunityReportRecord) {
  const meta =
    report.identity?.encryptedEmail ?? report.ip?.ipAddress ?? report.category;

  return {
    id: report.id,
    title: report.description,
    meta,
    createdAt: report.createdAt,
    riskLevel: report.severity === 'high' ? 'high' : report.severity,
  } satisfies Omit<DashboardReviewDto, 'time'> & { createdAt: Date };
}

function toVerificationReview(request: DashboardVerificationRequestRecord) {
  return {
    id: request.id,
    title: `${formatLabel(request.verificationType)} verification ${request.status}`,
    meta: `${request.identity.encryptedEmail} • ${request.provider}`,
    createdAt: request.createdAt,
    riskLevel: request.status === 'submitted' ? 'medium' : 'low',
  } satisfies Omit<DashboardReviewDto, 'time'> & { createdAt: Date };
}

function isRiskyEvent(event: DashboardEventRecord): boolean {
  return (
    riskLevelFromTrustScore(toNumber(event.scoreAtEvent)) !== 'low' ||
    event.verdict === AccessVerdict.flagged ||
    event.verdict === AccessVerdict.throttled ||
    event.verdict === AccessVerdict.blocked
  );
}

function isBlockedEvent(event: DashboardEventRecord): boolean {
  return event.verdict === AccessVerdict.blocked;
}

function averageTrustScore(events: DashboardEventRecord[]): number {
  if (events.length === 0) {
    return 0;
  }

  return Math.round(
    events.reduce((sum, event) => sum + toNumber(event.scoreAtEvent), 0) /
      events.length,
  );
}

function buildEventSeries(events: DashboardEventRecord[]): number[] {
  return buildDateSeries(events.map((event) => event.createdAt));
}

function buildDateSeries(dates: Date[]): number[] {
  const now = Date.now();
  const start = now - dayMs;
  const bucketCount = 14;
  const bucketMs = dayMs / bucketCount;
  const buckets = Array.from({ length: bucketCount }, () => 0);

  for (const date of dates) {
    const time = date.getTime();
    if (time < start || time > now) {
      continue;
    }

    const index = Math.min(
      bucketCount - 1,
      Math.floor((time - start) / bucketMs),
    );
    buckets[index] += 1;
  }

  return buckets;
}

function buildWebhookSeries(logs: DashboardRecords['webhookLogs']) {
  const now = Date.now();
  const start = now - dayMs;
  const bucketCount = 7;
  const bucketMs = dayMs / bucketCount;

  return Array.from({ length: bucketCount }, (_, index) => {
    const bucketStart = start + bucketMs * index;
    const bucketEnd = bucketStart + bucketMs;
    const bucketLogs = logs.filter((log) => {
      const createdAt = new Date(log.createdAt).getTime();
      return createdAt >= bucketStart && createdAt < bucketEnd;
    });

    return {
      time: formatUtcHour(new Date(bucketStart)),
      success: successRate(bucketLogs),
    };
  });
}

function successRate(logs: DashboardRecords['webhookLogs']): number {
  if (logs.length === 0) {
    return 0;
  }

  const delivered = logs.filter((log) =>
    isDelivered(log.responseStatus),
  ).length;
  return roundToOneDecimal((delivered / logs.length) * 100);
}

function averageLatency(logs: DashboardRecords['webhookLogs']): number {
  const values = logs
    .map((log) => readNumber(log.payload, 'latencyMs'))
    .filter((value): value is number => value !== null);

  if (values.length === 0) {
    return 0;
  }

  return Math.round(
    values.reduce((sum, value) => sum + value, 0) / values.length,
  );
}

function isDelivered(status: number): boolean {
  return status >= 200 && status < 300;
}

function buildNamedDistribution(
  counts: Record<string, number>,
  colors: Record<string, string>,
): DashboardDistributionSegment[] {
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

  return Object.entries(counts).map(([label, count]) => ({
    label,
    value: count,
    percent: total === 0 ? 0 : roundToOneDecimal((count / total) * 100),
    count,
    color: colors[label],
  }));
}

function resolveDestination(domain: string) {
  if (domain.toLowerCase().includes('acme')) {
    return { country: 'US', region: 'San Francisco' };
  }

  return { country: 'US', region: 'Ashburn' };
}

function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${trimTrailingZeroes(value / 1_000_000, 2)}M`;
  }

  if (value >= 1_000) {
    return `${trimTrailingZeroes(value / 1_000, 1)}K`;
  }

  return formatWholeNumber(value);
}

function formatWholeNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}

function trimTrailingZeroes(value: number, digits: number): string {
  return value
    .toFixed(digits)
    .replace(/\.0+$/, '')
    .replace(/(\.\d*?)0+$/, '$1');
}

function trendDirection(
  current: number,
  previous: number,
): DashboardMetricDto['trendDirection'] {
  if (current > previous) {
    return 'up';
  }

  if (current < previous) {
    return 'down';
  }

  return 'flat';
}

function formatUtcTime(date: Date): string {
  return date.toISOString().slice(11, 19);
}

function formatUtcHour(date: Date): string {
  return `${date.getUTCHours().toString().padStart(2, '0')}:00`;
}

function formatTimeAgo(date: Date): string {
  const elapsedMs = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.round(elapsedMs / 60000));

  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.round(minutes / 60);
  return `${hours}h ago`;
}

function formatAction(eventType: DashboardEventRecord['eventType']): string {
  const labels: Record<string, string> = {
    api_call: 'API ACCESS',
    login: 'LOGIN',
    page_visit: 'PAGE VISIT',
    registration: 'REGISTRATION',
  };

  return labels[eventType] ?? formatLabel(eventType);
}

function formatLabel(value: string): string {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function countryFlag(country: string): string {
  const code = country.toUpperCase();
  if (code.length !== 2) {
    return '🏳';
  }

  return String.fromCodePoint(
    ...[...code].map((char) => 127397 + char.charCodeAt(0)),
  );
}

function shortId(value: string): string {
  return value.replace(/-/g, '').slice(0, 8);
}

function readString(value: unknown, key: string): string | null {
  if (!isRecord(value)) {
    return null;
  }

  const candidate = value[key];
  return typeof candidate === 'string' ? candidate : null;
}

function readNumber(value: unknown, key: string): number | null {
  if (!isRecord(value)) {
    return null;
  }

  const candidate = value[key];
  return typeof candidate === 'number' && Number.isFinite(candidate)
    ? candidate
    : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toNumber(value: unknown): number {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function createEmptyDashboard(reason: string): AdminDashboardDto {
  return {
    status: 'empty',
    generatedAt: new Date().toISOString(),
    emptyReason: reason,
    platform: null,
    metrics: [],
    accessEvents: { rows: [], total: 0, isStreaming: false },
    pendingReviews: { items: [], total: 0 },
    aiInsights: [],
    webhook: {
      successRate: 0,
      successDelta: 0,
      failures: 0,
      failureDelta: 0,
      avgLatencyMs: 0,
      latencyDeltaMs: 0,
      series: [],
    },
    geoActivity: {
      points: [],
      attackFlows: [],
      legendCounts: { low: 0, medium: 0, high: 0, attackFlow: 0 },
      callout: null,
    },
    riskyIps: [],
    riskyAsns: [],
    riskDistribution: { total: 0, segments: [] },
    certificateHealth: { total: 0, segments: [] },
    footer: {
      systemStatus: 'Waiting for data',
      dataLastUpdated: new Date().toISOString(),
      streamHealth: 'Idle',
      eventsPerSecond: 0,
    },
  };
}
