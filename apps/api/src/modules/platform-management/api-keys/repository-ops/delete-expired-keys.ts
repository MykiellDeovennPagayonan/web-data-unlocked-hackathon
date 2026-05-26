import { PrismaService } from '../../../../prisma/prisma.service';

export function deleteExpiredKeys(
  prisma: PrismaService,
  before: Date,
): Promise<number> {
  return prisma.apiKey
    .deleteMany({
      where: {
        expiresAt: { lt: before },
        revokedAt: { not: null },
      },
    })
    .then((result) => result.count);
}
