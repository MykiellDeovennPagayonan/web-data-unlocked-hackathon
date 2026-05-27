import { PrismaService } from '../../../../prisma/prisma.service';
import { CommunityReport } from '../entities/community-report.entity';

export async function findReportById(
  prisma: PrismaService,
  id: string,
): Promise<CommunityReport | null> {
  return prisma.communityReport.findUnique({
    where: { id },
  });
}
