import { PrismaService } from '../../../../prisma/prisma.service';
import { ApiKey, ApiKeyFilters } from '../entities/api-key.entity';

export function findApiKeysByPlatform(
  prisma: PrismaService,
  filters: ApiKeyFilters,
): Promise<ApiKey[]> {
  return prisma.apiKey.findMany({
    where: {
      platformId: filters.platformId,
      ...(filters.isActive !== undefined && {
        revokedAt: filters.isActive ? null : { not: null },
      }),
    },
    orderBy: { createdAt: 'desc' },
  });
}
