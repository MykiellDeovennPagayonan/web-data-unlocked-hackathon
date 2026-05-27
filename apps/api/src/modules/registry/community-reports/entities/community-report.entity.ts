import {
  CommunityReport as PrismaCommunityReport,
  TargetType,
  ReportSeverity,
  ReportCategory,
  ReportStatus,
} from '../../../../generated/client';

export type CommunityReport = PrismaCommunityReport;

export interface CreateCommunityReportData {
  reportingPlatformId: string;
  targetType: TargetType;
  identityId?: string;
  orgId?: string;
  ipId?: string;
  emailHash?: string;
  severity: ReportSeverity;
  category: ReportCategory;
  description: string;
  evidenceUrls?: string[];
}

export interface UpdateCommunityReportStatusData {
  status: ReportStatus;
  registryEntryId?: string;
}

export interface CommunityReportFilters {
  reportingPlatformId?: string;
  status?: ReportStatus;
  targetType?: TargetType;
  limit?: number;
  offset?: number;
}
