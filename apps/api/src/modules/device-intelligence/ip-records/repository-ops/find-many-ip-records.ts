import { PrismaService } from '../../../../prisma/prisma.service';
import { IpRecord } from '../entities/ip-record.entity';

export async function findManyIpRecords(
  prisma: PrismaService,
  take = 100,
  skip = 0,
): Promise<IpRecord[]> {
  return prisma.ipRecord.findMany({
    orderBy: { createdAt: 'desc' },
    take,
    skip,
  });
}
