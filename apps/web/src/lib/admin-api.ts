import { apiBaseUrl } from "./admin-dashboard";

export async function fetchAdmin<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Backend returned ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export type IdentityDto = {
  id: string;
  emailHash: string;
  encryptedEmail: string;
  encryptedFullName: string;
  trustStatus: string;
  isHumanVerified: boolean;
  certificateId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OrganizationDto = {
  id: string;
  legalName: string;
  domain: string;
  registrationNumber: string;
  country: string;
  industry: string;
  trustStatus: string;
  certificateId: string | null;
  submittedByPlatformId: string;
  createdAt: string;
  updatedAt: string;
};

export type DeviceDto = {
  id: string;
  stableHash: string;
  firstSeenAt: string;
  lastSeenAt: string;
  riskScore: number;
  isFlagged: boolean;
};

export type IpRecordDto = {
  id: string;
  ipAddress: string;
  ipType: string;
  country: string;
  region: string;
  asn: string;
  riskScore: number;
  isBlacklisted: boolean;
  blacklistSource: string | null;
  lastEvaluatedAt: string;
  createdAt: string;
};

export type TrustCertificateDto = {
  id: string;
  entityType: string;
  identityId: string | null;
  orgId: string | null;
  issuedAt: string;
  expiresAt: string;
  status: string;
  revocationReason: string | null;
  certificateHash: string;
  blockchainTxHash: string;
  issuingCheckId: string;
};

export type AccessEventDto = {
  id: string;
  platformId: string;
  identityId: string | null;
  orgId: string | null;
  ipId: string;
  deviceId: string;
  eventType: string;
  verdict: string;
  scoreAtEvent: number;
  triggeredRules: Record<string, unknown>;
  createdAt: string;
};

export type VerificationRequestDto = {
  id: string;
  identityId: string;
  platformId: string;
  verificationType: string;
  provider: string;
  status: string;
  submittedAt: string | null;
  decidedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
};

export type CommunityReportDto = {
  id: string;
  reportingPlatformId: string;
  targetType: string;
  identityId: string | null;
  orgId: string | null;
  ipId: string | null;
  emailHash: string | null;
  severity: string;
  category: string;
  description: string;
  evidenceUrls: string[];
  status: string;
  registryEntryId: string | null;
  createdAt: string;
};

export type WebhookLogDto = {
  id: string;
  platformId: string;
  eventType: string;
  payload: Record<string, unknown>;
  responseStatus: number;
  responseBody: string | null;
  attemptNumber: number;
  deliveredAt: string | null;
  createdAt: string;
};

export type AuditLogDto = {
  id: string;
  actorType: string;
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  createdAt: string;
};

export type PlatformDto = {
  id: string;
  name: string;
  domain: string;
  status: string;
  strictnessLevel: string;
  createdAt: string;
  updatedAt: string;
};

export type ApiKeyDto = {
  id: string;
  name: string;
  scopes: string[];
  createdAt: string;
  expiresAt: string | null;
  revokedAt: string | null;
  lastUsedAt: string | null;
};
