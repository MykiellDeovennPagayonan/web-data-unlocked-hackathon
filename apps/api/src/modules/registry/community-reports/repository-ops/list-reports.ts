import { PrismaService } from '../../../../prisma/prisma.service';
import {
  CommunityReport,
  CommunityReportFilters,
} from '../entities/community-report.entity';

export async function listReports(
  prisma: PrismaService,
  filters: CommunityReportFilters,
): Promise<CommunityReport[]> {
  return prisma.communityReport.findMany({
    where: {
      reportingPlatformId: filters.reportingPlatformId,
      status: filters.status,
      targetType: filters.targetType,
    },
    take: filters.limit ?? 50,
    skip: filters.offset ?? 0,
    orderBy: { createdAt: 'desc' },
  });
}
