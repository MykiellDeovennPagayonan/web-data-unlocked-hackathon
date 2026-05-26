import { PrismaService } from '../../../../prisma/prisma.service';
import { Platform, PlatformFilters } from '../entities/platform.entity';

export function findManyPlatforms(
  prisma: PrismaService,
  filters: PlatformFilters,
): Promise<Platform[]> {
  return prisma.platform.findMany({
    where: {
      status: filters.status,
    },
    take: filters.limit,
    skip: filters.offset,
    orderBy: { createdAt: 'desc' },
  });
}
