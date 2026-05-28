import { post } from "./fetch"
import type {
  TunaiConfig,
  CommunityReport,
  ReportTargetType,
  ReportSeverity,
  ReportCategory,
} from "./types"

export interface SubmitReportParams {
  reportingPlatformId: string
  targetType: ReportTargetType
  identityId?: string
  orgId?: string
  ipId?: string
  email?: string
  severity: ReportSeverity
  category: ReportCategory
  description: string
  evidenceUrls?: string[]
}

export function submitCommunityReport(
  config: TunaiConfig,
  params: SubmitReportParams
): Promise<CommunityReport> {
  return post<CommunityReport>(config, "/v1/registry/community-reports", params)
}
