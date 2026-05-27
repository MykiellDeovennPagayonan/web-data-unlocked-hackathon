import { PrismaService } from '../../../../prisma/prisma.service';
import {
  CommunityReport,
  UpdateCommunityReportStatusData,
} from '../entities/community-report.entity';

export async function updateReportStatus(
  prisma: PrismaService,
  id: string,
  data: UpdateCommunityReportStatusData,
): Promise<CommunityReport> {
  return prisma.communityReport.update({
    where: { id },
    data: {
      status: data.status,
      registryEntryId: data.registryEntryId,
    },
  });
}
