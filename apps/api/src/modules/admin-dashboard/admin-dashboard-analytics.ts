export type DashboardRiskLevel =
  | 'critical'
  | 'high'
  | 'medium'
  | 'low'
  | 'unknown';

export interface DashboardDistributionSegment {
  label: string;
  value: number;
  percent: number;
  count: number;
  color: string;
}

const distributionOrder: DashboardRiskLevel[] = [
  'critical',
  'high',
  'medium',
  'low',
  'unknown',
];

const distributionColors: Record<DashboardRiskLevel, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#f59e0b',
  low: '#3b82f6',
  unknown: '#94a3b8',
};

export function riskLevelFromTrustScore(score: number): DashboardRiskLevel {
  if (!Number.isFinite(score)) {
    return 'unknown';
  }

  if (score < 25) {
    return 'critical';
  }

  if (score < 45) {
    return 'high';
  }

  if (score < 70) {
    return 'medium';
  }

  return 'low';
}

export function riskListLevelFromRiskScore(
  score: number,
): Exclude<DashboardRiskLevel, 'low' | 'unknown'> {
  if (score >= 90) {
    return 'critical';
  }

  if (score >= 70) {
    return 'high';
  }

  return 'medium';
}

export function geoRiskLevelFromRiskScore(
  score: number,
): 'low' | 'medium' | 'high' {
  if (score >= 75) {
    return 'high';
  }

  if (score >= 50) {
    return 'medium';
  }

  return 'low';
}

export function calculateTrendPercent(
  current: number,
  previous: number,
): number {
  if (previous === 0) {
    return current === 0 ? 0 : 100;
  }

  return roundToOneDecimal(((current - previous) / previous) * 100);
}

export function buildDistribution(
  levels: DashboardRiskLevel[],
): DashboardDistributionSegment[] {
  const total = levels.length;

  return distributionOrder.map((level) => {
    const count = levels.filter((candidate) => candidate === level).length;

    return {
      label: toTitleCase(level),
      value: count,
      percent: total === 0 ? 0 : roundToOneDecimal((count / total) * 100),
      count,
      color: distributionColors[level],
    };
  });
}

export function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

function toTitleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
