import { PrismaService } from '../../../../prisma/prisma.service';

export async function unbanIp(
  prisma: PrismaService,
  ipAddress: string,
): Promise<{ count: number }> {
  const result = await prisma.ipRecord.updateMany({
    where: { ipAddress },
    data: {
      isBlacklisted: false,
      blacklistSource: null,
    },
  });

  return { count: result.count };
}
