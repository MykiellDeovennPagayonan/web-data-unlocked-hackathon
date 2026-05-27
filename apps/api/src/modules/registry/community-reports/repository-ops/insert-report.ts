import { PrismaService } from '../../../../prisma/prisma.service';
import {
  CommunityReport,
  CreateCommunityReportData,
} from '../entities/community-report.entity';
import { ReportStatus } from '../../../../generated/client';

export async function insertReport(
  prisma: PrismaService,
  data: CreateCommunityReportData,
): Promise<CommunityReport> {
  return prisma.communityReport.create({
    data: {
      reportingPlatformId: data.reportingPlatformId,
      targetType: data.targetType,
      identityId: data.identityId,
      orgId: data.orgId,
      ipId: data.ipId,
      emailHash: data.emailHash,
      severity: data.severity,
      category: data.category,
      description: data.description,
      evidenceUrls: data.evidenceUrls ?? [],
      status: ReportStatus.pending,
    },
  });
}
