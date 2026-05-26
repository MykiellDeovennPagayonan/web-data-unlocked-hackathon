import { RuleTrigger } from '../../../../../generated/prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { PlatformRule } from '../entities/platform-rule.entity';

export function findRulesForTrigger(
  prisma: PrismaService,
  platformId: string,
  ruleTrigger: RuleTrigger,
): Promise<PlatformRule[]> {
  return prisma.platformRule.findMany({
    where: {
      platformId,
      ruleTrigger,
      isActive: true,
    },
  });
}
