import { PrismaService } from '../../../../prisma/prisma.service';
import { IpRecord } from '../entities/ip-record.entity';

export async function findIpByAddress(
  prisma: PrismaService,
  ipAddress: string,
): Promise<IpRecord | null> {
  return prisma.ipRecord.findFirst({ where: { ipAddress } });
}
