import type {
  AccessEventType,
  AccessVerdict,
  CertificateStatus,
  Device,
  Identity,
  IpRecord,
  Organization,
  Platform,
  TrustCertificate,
  WebhookDeliveryLog,
} from '../../generated/client';
import type {
  DashboardDistributionSegment,
  DashboardRiskLevel,
} from './admin-dashboard-analytics';
import type { GeoActivity } from './geo-location';

export type DashboardMetricIcon =
  | 'activity'
  | 'identity'
  | 'shield'
  | 'lock'
  | 'score';

export interface DashboardMetricDto {
  label: string;
  value: string;
  trend: string;
  trendDirection: 'up' | 'down' | 'flat';
  comparison: string;
  icon: DashboardMetricIcon;
  tone: 'blue' | 'red';
  chartData: number[];
}

export interface DashboardAccessEventDto {
  id: string;
  time: string;
  identity: string;
  identityId: string;
  ipAddress: string;
  action: string;
  riskLevel: Exclude<DashboardRiskLevel, 'unknown'>;
  trustScore: number;
  flag: string;
  location: string;
  device: string;
  client: string;
}

export interface DashboardReviewDto {
  id: string;
  title: string;
  meta: string;
  time: string;
  riskLevel: Exclude<DashboardRiskLevel, 'unknown'>;
}

export interface DashboardRiskListItemDto {
  name: string;
  score: number;
  level: Exclude<DashboardRiskLevel, 'low' | 'unknown'>;
  events: number;
}

export interface DashboardWebhookDto {
  successRate: number;
  successDelta: number;
  failures: number;
  failureDelta: number;
  avgLatencyMs: number;
  latencyDeltaMs: number;
  series: Array<{ time: string; success: number }>;
}

export interface AdminDashboardDto {
  status: 'ready' | 'empty';
  generatedAt: string;
  emptyReason?: string;
  platform: {
    id: string;
    name: string;
    domain: string;
  } | null;
  metrics: DashboardMetricDto[];
  accessEvents: {
    rows: DashboardAccessEventDto[];
    total: number;
    isStreaming: boolean;
  };
  pendingReviews: {
    items: DashboardReviewDto[];
    total: number;
  };
  aiInsights: string[];
  webhook: DashboardWebhookDto;
  geoActivity: GeoActivity;
  riskyIps: DashboardRiskListItemDto[];
  riskyAsns: DashboardRiskListItemDto[];
  riskDistribution: {
    total: number;
    segments: DashboardDistributionSegment[];
  };
  certificateHealth: {
    total: number;
    segments: DashboardDistributionSegment[];
  };
  footer: {
    systemStatus: string;
    dataLastUpdated: string;
    streamHealth: string;
    eventsPerSecond: number;
  };
}

export interface DashboardEventRecord {
  id: string;
  platformId: string;
  identityId: string | null;
  orgId: string | null;
  eventType: AccessEventType;
  verdict: AccessVerdict;
  scoreAtEvent: unknown;
  triggeredRules: unknown;
  createdAt: Date;
  identity: Pick<Identity, 'id' | 'encryptedEmail'> | null;
  org: Pick<Organization, 'id' | 'legalName'> | null;
  ip: Pick<
    IpRecord,
    'id' | 'ipAddress' | 'country' | 'region' | 'asn' | 'riskScore'
  >;
  device: Pick<Device, 'id' | 'stableHash' | 'riskScore'>;
}

export interface DashboardCommunityReportRecord {
  id: string;
  severity: 'low' | 'medium' | 'high';
  category: string;
  description: string;
  createdAt: Date;
  ip: Pick<IpRecord, 'ipAddress'> | null;
  identity: Pick<Identity, 'encryptedEmail'> | null;
}

export interface DashboardVerificationRequestRecord {
  id: string;
  verificationType: string;
  provider: string;
  status: string;
  createdAt: Date;
  identity: Pick<Identity, 'encryptedEmail'>;
}

export interface DashboardRecords {
  platform: Pick<Platform, 'id' | 'name' | 'domain'> | null;
  currentEvents: DashboardEventRecord[];
  previousEvents: DashboardEventRecord[];
  latestEvents: DashboardEventRecord[];
  identityCount: number;
  currentIdentityJoins: Date[];
  previousIdentityJoins: Date[];
  webhookLogs: WebhookDeliveryLog[];
  pendingReports: DashboardCommunityReportRecord[];
  pendingVerifications: DashboardVerificationRequestRecord[];
  certificates: Array<Pick<TrustCertificate, 'status' | 'expiresAt'>>;
  activeSessions: number;
}

export interface CertificateHealthBucket {
  label: string;
  status?: CertificateStatus;
  color: string;
}
