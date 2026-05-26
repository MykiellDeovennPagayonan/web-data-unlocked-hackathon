import { PrismaService } from '../../../../prisma/prisma.service';
import { PlatformRule } from '../entities/platform-rule.entity';

export function findRuleById(
  prisma: PrismaService,
  id: string,
): Promise<PlatformRule | null> {
  return prisma.platformRule.findUnique({
    where: { id },
  });
}
