import { PrismaService } from '../../../../prisma/prisma.service';
import {
  BackgroundCheck,
  BackgroundCheckFilters,
} from '../entities/background-check.entity';

export async function listBackgroundChecksByEntity(
  prisma: PrismaService,
  filters: BackgroundCheckFilters,
): Promise<BackgroundCheck[]> {
  return prisma.backgroundCheck.findMany({
    where: {
      entityType: filters.entityType,
      identityId: filters.identityId,
      orgId: filters.orgId,
      triggeredBy: filters.triggeredBy,
      overallVerdict: filters.overallVerdict,
    },
    include: { results: true },
    take: filters.limit ?? 50,
    skip: filters.offset ?? 0,
    orderBy: { createdAt: 'desc' },
  });
}
