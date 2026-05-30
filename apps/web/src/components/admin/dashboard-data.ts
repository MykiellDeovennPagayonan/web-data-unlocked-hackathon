export type MetricTone = "blue" | "red";

export type Metric = {
  label: string;
  value: string;
  trend: string;
  trendDirection?: "up" | "down" | "flat";
  comparison: string;
  icon: "activity" | "identity" | "shield" | "lock" | "score";
  tone: MetricTone;
  chartData: number[];
};

export type RiskLevel = "critical" | "high" | "medium" | "low";

export type AccessEvent = {
  id?: string;
  time: string;
  identity: string;
  identityId: string;
  ipAddress: string;
  action: string;
  riskLevel: RiskLevel;
  trustScore: number;
  flag: string;
  location: string;
  device: string;
  client: string;
};

export type ReviewItem = {
  title: string;
  meta: string;
  time: string;
  riskLevel: RiskLevel;
};

export type RiskListItem = {
  name: string;
  score: number;
  level: Exclude<RiskLevel, "low">;
  events: string;
};

export type DistributionSegment = {
  label: string;
  value: number;
  percent: string;
  count: string;
  color: string;
};

export type WebhookHealth = {
  successRate: string;
  successDelta: string;
  failures: string;
  failureDelta: string;
  avgLatency: string;
  latencyDelta: string;
  series: Array<{ time: string; success: number }>;
};

export type GeoRiskLevel = "low" | "medium" | "high";

export type GeoPoint = {
  id: string;
  location: string;
  country: string;
  region: string;
  latitude: number;
  longitude: number;
  source: "region" | "country" | "unknown";
  x: number;
  y: number;
  ipAddress: string;
  asn: string;
  riskScore: number;
  riskLevel: GeoRiskLevel;
  events: number;
};

export type GeoAttackFlow = {
  id: string;
  sourceLocation: string;
  targetLocation: string;
  source: { x: number; y: number };
  target: { x: number; y: number };
  riskLevel: Exclude<GeoRiskLevel, "low">;
  events: number;
};

export type GeoActivity = {
  points: GeoPoint[];
  attackFlows: GeoAttackFlow[];
  legendCounts: Record<GeoRiskLevel | "attackFlow", number>;
  callout: GeoPoint | null;
};

export type DashboardData = {
  status: "ready" | "empty";
  generatedAt: string;
  emptyReason?: string;
  platform: { id: string; name: string; domain: string } | null;
  metrics: Metric[];
  accessEvents: {
    rows: AccessEvent[];
    total: number;
    isStreaming: boolean;
  };
  pendingReviews: {
    items: ReviewItem[];
    total: number;
  };
  aiInsights: string[];
  webhook: WebhookHealth;
  geoActivity: GeoActivity;
  riskyIps: RiskListItem[];
  riskyAsns: RiskListItem[];
  riskDistribution: {
    total: string;
    segments: DistributionSegment[];
  };
  certificateHealth: {
    total: string;
    segments: DistributionSegment[];
  };
  footer: {
    systemStatus: string;
    dataLastUpdated: string;
    streamHealth: string;
    eventsPerSecond: string;
  };
};

export type DashboardConnectionState =
  | { status: "ready"; message?: string }
  | { status: "loading"; message?: string }
  | { status: "empty"; message: string }
  | { status: "error"; message: string };

export const metrics: Metric[] = [
  {
    label: "ACCESS EVENTS",
    value: "1.24M",
    trend: "12.5%",
    comparison: "vs 24h ago",
    icon: "activity",
    tone: "blue",
    chartData: [34, 28, 42, 36, 46, 43, 53, 58, 72, 51, 64, 58, 62, 55],
  },
  {
    label: "IDENTITIES",
    value: "18,392",
    trend: "8.1%",
    comparison: "vs 24h ago",
    icon: "identity",
    tone: "blue",
    chartData: [22, 25, 33, 30, 37, 35, 34, 42, 38, 48, 44, 36, 32, 34],
  },
  {
    label: "RISKY EVENTS",
    value: "2,847",
    trend: "15.3%",
    comparison: "vs 24h ago",
    icon: "shield",
    tone: "red",
    chartData: [24, 28, 27, 31, 30, 33, 29, 42, 36, 31, 25, 29, 26, 31],
  },
  {
    label: "BLOCKED EVENTS",
    value: "732",
    trend: "6.2%",
    comparison: "vs 24h ago",
    icon: "lock",
    tone: "red",
    chartData: [18, 22, 21, 27, 25, 31, 26, 39, 34, 27, 23, 28, 24, 27],
  },
  {
    label: "TRUST SCORE (AVG)",
    value: "78",
    trend: "5 pts",
    comparison: "vs 24h ago",
    icon: "score",
    tone: "blue",
    chartData: [72, 76, 78, 80, 82, 85, 87],
  },
];

export const accessEvents: AccessEvent[] = [
  {
    time: "14:32:11",
    identity: "jane.doe@acme.com",
    identityId: "ba177bcd",
    ipAddress: "203.0.113.45",
    action: "LOGIN",
    riskLevel: "critical",
    trustScore: 12,
    flag: "🇷🇺",
    location: "Moscow, RU",
    device: "Chrome 125",
    client: "Windows",
  },
  {
    time: "14:31:45",
    identity: "service-account-1",
    identityId: "c2f13b9e",
    ipAddress: "198.51.100.23",
    action: "API ACCESS",
    riskLevel: "low",
    trustScore: 85,
    flag: "🇺🇸",
    location: "New York, US",
    device: "AkamaiWP.21",
    client: "Server",
  },
  {
    time: "14:31:02",
    identity: "mobile_user_392",
    identityId: "6d5e4d03",
    ipAddress: "45.73.32.11",
    action: "LOGIN",
    riskLevel: "medium",
    trustScore: 56,
    flag: "🇬🇧",
    location: "London, GB",
    device: "iOS 17.5",
    client: "iPhone",
  },
  {
    time: "14:30:18",
    identity: "admin@acme.com",
    identityId: "a7f3cfee",
    ipAddress: "203.0.113.85",
    action: "ADMIN ACTION",
    riskLevel: "low",
    trustScore: 92,
    flag: "🇺🇸",
    location: "San Francisco, US",
    device: "Chrome 125",
    client: "macOS",
  },
  {
    time: "14:30:18",
    identity: "api-user",
    identityId: "7b7f1cee",
    ipAddress: "185.199.110.153",
    action: "API ACCESS",
    riskLevel: "high",
    trustScore: 18,
    flag: "🇧🇷",
    location: "Sao Paulo, BR",
    device: "curl/8.5.0",
    client: "Linux",
  },
  {
    time: "14:28:35",
    identity: "batch@acme.com",
    identityId: "5c30a24f",
    ipAddress: "192.0.2.77",
    action: "DATA EXPORT",
    riskLevel: "medium",
    trustScore: 43,
    flag: "🇨🇦",
    location: "Toronto, CA",
    device: "Chrome 125",
    client: "Windows",
  },
];

export const pendingReviews: ReviewItem[] = [
  {
    title: "Critical login from new ASN",
    meta: "infra-id@acme.com  •  203.0.113.45",
    time: "2m ago",
    riskLevel: "critical",
  },
  {
    title: "Impossible travel detected",
    meta: "admin@acme.com  •  US -> DE",
    time: "11m ago",
    riskLevel: "medium",
  },
  {
    title: "High volume data export",
    meta: "backup@acme.com  •  192.0.2.77",
    time: "11m ago",
    riskLevel: "high",
  },
  {
    title: "New device seen",
    meta: "contractor.user  •  iPhone iOS 17.5",
    time: "26m ago",
    riskLevel: "medium",
  },
  {
    title: "Unusual API activity",
    meta: "service-account-1  •  198.51.100.23",
    time: "34m ago",
    riskLevel: "medium",
  },
];

export const aiInsights = [
  "Identity risk for account: contractor.user is elevated from unusual authentication patterns observed.",
  "2 Critical sign-ins require immediate attention",
  "5 identities show anomalous behavior",
  "10 risky events in the last 24h",
];

export const webhookSeries = [
  { time: "00:00", success: 72 },
  { time: "02:00", success: 76 },
  { time: "04:00", success: 70 },
  { time: "06:00", success: 78 },
  { time: "08:00", success: 75 },
  { time: "10:00", success: 79 },
  { time: "12:00", success: 73 },
  { time: "14:00", success: 77 },
  { time: "16:00", success: 80 },
  { time: "18:00", success: 76 },
  { time: "20:00", success: 82 },
];

export const riskyIps: RiskListItem[] = [
  { name: "203.0.113.45", score: 96, level: "critical", events: "1,298" },
  { name: "198.51.100.23", score: 85, level: "high", events: "781" },
  { name: "45.73.32.11", score: 73, level: "high", events: "321" },
  { name: "185.199.110.153", score: 56, level: "medium", events: "310" },
  { name: "192.0.2.45", score: 40, level: "medium", events: "410" },
];

export const riskyAsns: RiskListItem[] = [
  { name: "203.0.113.45", score: 96, level: "critical", events: "1,298" },
  { name: "198.51.100.23", score: 85, level: "high", events: "781" },
  { name: "45.73.32.11", score: 73, level: "high", events: "321" },
  { name: "185.199.110.153", score: 56, level: "medium", events: "310" },
  { name: "192.0.2.45", score: 40, level: "medium", events: "410" },
];

export const riskDistribution: DistributionSegment[] = [
  {
    label: "Critical",
    value: 98,
    percent: "3.4%",
    count: "98",
    color: "#ef4444",
  },
  {
    label: "High",
    value: 608,
    percent: "21.2%",
    count: "608",
    color: "#f97316",
  },
  {
    label: "Medium",
    value: 1244,
    percent: "43.7%",
    count: "1,244",
    color: "#f59e0b",
  },
  {
    label: "Low",
    value: 712,
    percent: "25.0%",
    count: "712",
    color: "#3b82f6",
  },
  {
    label: "Unknown",
    value: 183,
    percent: "6.4%",
    count: "183",
    color: "#94a3b8",
  },
];

export const certificateHealth: DistributionSegment[] = [
  {
    label: "Good",
    value: 185,
    percent: "14.8%",
    count: "185",
    color: "#3b82f6",
  },
  {
    label: "Expiring",
    value: 234,
    percent: "18.8%",
    count: "234",
    color: "#f59e0b",
  },
  {
    label: "Invalid",
    value: 250,
    percent: "20.0%",
    count: "250",
    color: "#ef4444",
  },
  {
    label: "Revoked",
    value: 256,
    percent: "20.6%",
    count: "256",
    color: "#64748b",
  },
  {
    label: "Unknown",
    value: 323,
    percent: "25.8%",
    count: "323",
    color: "#94a3b8",
  },
];

export const mockGeoActivity: GeoActivity = {
  points: [
    {
      id: "mock-ru-moscow",
      location: "Moscow, RU",
      country: "RU",
      region: "Moscow",
      latitude: 55.7558,
      longitude: 37.6173,
      source: "region",
      x: 604.49,
      y: 112.54,
      ipAddress: "203.0.113.45",
      asn: "AS8359 MTS",
      riskScore: 96,
      riskLevel: "high",
      events: 1283,
    },
    {
      id: "mock-us-new-york",
      location: "New York, US",
      country: "US",
      region: "New York",
      latitude: 40.7128,
      longitude: -74.006,
      source: "region",
      x: 294.43,
      y: 135.3,
      ipAddress: "198.51.100.23",
      asn: "AS15169 Google",
      riskScore: 42,
      riskLevel: "low",
      events: 781,
    },
    {
      id: "mock-gb-london",
      location: "London, GB",
      country: "GB",
      region: "London",
      latitude: 51.5072,
      longitude: -0.1276,
      source: "region",
      x: 499.65,
      y: 120.94,
      ipAddress: "45.73.32.11",
      asn: "AS5089 Virgin Media",
      riskScore: 68,
      riskLevel: "medium",
      events: 321,
    },
    {
      id: "mock-us-san-francisco",
      location: "San Francisco, US",
      country: "US",
      region: "San Francisco",
      latitude: 37.7749,
      longitude: -122.4194,
      source: "region",
      x: 159.95,
      y: 139.15,
      ipAddress: "203.0.113.85",
      asn: "AS7922 Comcast",
      riskScore: 18,
      riskLevel: "low",
      events: 240,
    },
    {
      id: "mock-br-sao-paulo",
      location: "Sao Paulo, BR",
      country: "BR",
      region: "Sao Paulo",
      latitude: -23.5505,
      longitude: -46.6333,
      source: "region",
      x: 370.46,
      y: 204.09,
      ipAddress: "185.199.110.153",
      asn: "AS61884 Latitude.sh",
      riskScore: 56,
      riskLevel: "medium",
      events: 310,
    },
    {
      id: "mock-ca-toronto",
      location: "Toronto, CA",
      country: "CA",
      region: "Toronto",
      latitude: 43.6532,
      longitude: -79.3832,
      source: "region",
      x: 279.49,
      y: 130.95,
      ipAddress: "192.0.2.77",
      asn: "AS577 Bell Canada",
      riskScore: 63,
      riskLevel: "medium",
      events: 410,
    },
    {
      id: "mock-sg-singapore",
      location: "Singapore, SG",
      country: "SG",
      region: "Singapore",
      latitude: 1.3521,
      longitude: 103.8198,
      source: "region",
      x: 788.39,
      y: 178.65,
      ipAddress: "192.0.2.45",
      asn: "AS13335 Cloudflare",
      riskScore: 74,
      riskLevel: "medium",
      events: 410,
    },
    {
      id: "mock-jp-tokyo",
      location: "Tokyo, JP",
      country: "JP",
      region: "Tokyo",
      latitude: 35.6762,
      longitude: 139.6503,
      source: "region",
      x: 887.92,
      y: 142.31,
      ipAddress: "198.51.100.88",
      asn: "AS2516 KDDI",
      riskScore: 91,
      riskLevel: "high",
      events: 256,
    },
  ],
  attackFlows: [
    {
      id: "mock-ru-to-us",
      sourceLocation: "Moscow, RU",
      targetLocation: "San Francisco, US",
      source: { x: 604.49, y: 112.54 },
      target: { x: 159.95, y: 139.15 },
      riskLevel: "high",
      events: 1283,
    },
    {
      id: "mock-jp-to-us",
      sourceLocation: "Tokyo, JP",
      targetLocation: "San Francisco, US",
      source: { x: 887.92, y: 142.31 },
      target: { x: 159.95, y: 139.15 },
      riskLevel: "high",
      events: 256,
    },
  ],
  legendCounts: { low: 2, medium: 4, high: 2, attackFlow: 2 },
  callout: null,
};

mockGeoActivity.callout = mockGeoActivity.points[0];

export const mockDashboardData: DashboardData = {
  status: "ready",
  generatedAt: new Date().toISOString(),
  platform: {
    id: "mock-platform",
    name: "Acme Corp",
    domain: "acme.example.com",
  },
  metrics: metrics.map((metric) => ({ ...metric, trendDirection: "up" })),
  accessEvents: { rows: accessEvents, total: 25833, isStreaming: true },
  pendingReviews: { items: pendingReviews, total: 12 },
  aiInsights,
  webhook: {
    successRate: "98.7%",
    successDelta: "2.3%",
    failures: "21",
    failureDelta: "5",
    avgLatency: "312 ms",
    latencyDelta: "42ms",
    series: webhookSeries,
  },
  geoActivity: mockGeoActivity,
  riskyIps,
  riskyAsns,
  riskDistribution: { total: "2,847", segments: riskDistribution },
  certificateHealth: { total: "1,248", segments: certificateHealth },
  footer: {
    systemStatus: "All Systems Operational",
    dataLastUpdated: "14:32:12 UTC",
    streamHealth: "Live",
    eventsPerSecond: "240",
  },
};

export const emptyDashboardData: DashboardData = {
  ...mockDashboardData,
  status: "empty",
  metrics: [],
  accessEvents: { rows: [], total: 0, isStreaming: false },
  pendingReviews: { items: [], total: 0 },
  aiInsights: [],
  webhook: {
    successRate: "0%",
    successDelta: "0%",
    failures: "0",
    failureDelta: "0",
    avgLatency: "0 ms",
    latencyDelta: "0ms",
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
  riskDistribution: { total: "0", segments: [] },
  certificateHealth: { total: "0", segments: [] },
  footer: {
    systemStatus: "Waiting for data",
    dataLastUpdated: "No backend data",
    streamHealth: "Idle",
    eventsPerSecond: "0",
  },
};
