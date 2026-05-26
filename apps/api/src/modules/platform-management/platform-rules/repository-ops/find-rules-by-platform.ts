import { PrismaService } from '../../../../prisma/prisma.service';
import {
  PlatformRule,
  PlatformRuleFilters,
} from '../entities/platform-rule.entity';

export function findRulesByPlatform(
  prisma: PrismaService,
  filters: PlatformRuleFilters,
): Promise<PlatformRule[]> {
  return prisma.platformRule.findMany({
    where: {
      platformId: filters.platformId,
      ...(filters.ruleTrigger && { ruleTrigger: filters.ruleTrigger }),
      ...(filters.isActive !== undefined && { isActive: filters.isActive }),
    },
    orderBy: { createdAt: 'desc' },
  });
}
