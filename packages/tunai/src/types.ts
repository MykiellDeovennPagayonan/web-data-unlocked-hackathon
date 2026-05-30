export interface IpRecord {
  id: string
  ipAddress: string
  ipType: "residential" | "datacenter" | "vpn" | "proxy" | "tor" | "mobile"
  riskScore: number
  isBlacklisted: boolean
  blacklistSource: string | null
  country: string
  region: string
  asn: string
  lastEvaluatedAt: string
}

export interface IpVelocity {
  ipAddress: string
  requestCount: number
  thresholdExceeded: boolean
  isBlacklisted: boolean
}

export interface IpProbe {
  ipAddress: string
  uniqueEndpoints: number
  thresholdExceeded: boolean
  isBlacklisted: boolean
}

export type DeviceSignalType =
  | "canvas_hash"
  | "webgl_hash"
  | "screen_resolution"
  | "os"
  | "timezone"
  | "user_agent"
  | "language"

export interface DeviceSignal {
  signalType: DeviceSignalType
  value: string
}

export interface Device {
  id: string
  stableHash: string
  riskScore: number
  isFlagged: boolean
  firstSeenAt: string
  lastSeenAt: string
}

export interface Identity {
  id: string
  emailHash: string
  trustStatus: string
  isHumanVerified: boolean
  createdAt: string
}

export interface Organization {
  id: string
  legalName: string
  domain: string
  trustStatus: string
  createdAt: string
}

export interface PlatformUser {
  id: string
  identityId: string | null
  orgId: string | null
  platformId: string
  externalUserId: string
  statusOnPlatform: string
  createdAt: string
}

export interface TrustScore {
  score: number
  signalCount: number
}

export type BackgroundCheckVerdict = "clean" | "flagged" | "blocked" | "not_found"
export type CheckTrigger = "registration" | "manual" | "behavioral_flag"
export type EntityType = "identity" | "organization"

export interface BackgroundCheck {
  id: string
  entityType: EntityType
  identityId: string | null
  orgId: string | null
  overallVerdict: BackgroundCheckVerdict | null
  completedAt: string | null
  createdAt: string
}

export type ReportSeverity = "low" | "medium" | "high" | "critical"
export type ReportCategory = "fraud" | "spam" | "abuse" | "fake_identity" | "scam"
export type ReportTargetType = "identity" | "organization" | "ip" | "email"

export interface CommunityReport {
  id: string
  targetType: ReportTargetType
  status: string
  severity: ReportSeverity
  category: ReportCategory
  createdAt: string
}

export interface EnrolledUser {
  identityId: string
  platformUserId: string
}

export interface EnrolledOrganization {
  orgId: string
  platformUserId: string
}

export interface CertificateVerificationResult {
  valid: boolean
  verdict: "valid" | "expired" | "revoked" | "not_found"
  entityType?: "identity" | "organization"
  entityId?: string
  certificate?: {
    id: string
    certificateHash: string
    status: string
    expiresAt: string
  }
}

export interface TunaiConfig {
  baseUrl: string
  apiKey: string
  platformId?: string
}
