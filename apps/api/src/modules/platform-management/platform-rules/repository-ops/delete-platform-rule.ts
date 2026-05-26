import { PrismaService } from '../../../../prisma/prisma.service';
import { PlatformRule } from '../entities/platform-rule.entity';

export function deletePlatformRule(
  prisma: PrismaService,
  id: string,
): Promise<PlatformRule> {
  return prisma.platformRule.delete({
    where: { id },
  });
}
