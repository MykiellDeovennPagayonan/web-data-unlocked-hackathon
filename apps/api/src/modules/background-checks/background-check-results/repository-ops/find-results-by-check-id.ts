import { PrismaService } from '../../../../prisma/prisma.service';
import { BackgroundCheckResult } from '../entities/background-check-result.entity';

export async function findResultsByCheckId(
  prisma: PrismaService,
  checkId: string,
): Promise<BackgroundCheckResult[]> {
  return prisma.backgroundCheckResult.findMany({
    where: { checkId },
    orderBy: { checkedAt: 'desc' },
  });
}
