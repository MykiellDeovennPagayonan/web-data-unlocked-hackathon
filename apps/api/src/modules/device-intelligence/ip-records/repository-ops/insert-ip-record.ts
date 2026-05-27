import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateIpRecordData, IpRecord } from '../entities/ip-record.entity';

export async function insertIpRecord(
  prisma: PrismaService,
  data: CreateIpRecordData,
): Promise<IpRecord> {
  return prisma.ipRecord.create({
    data: {
      ipAddress: data.ipAddress,
      ipType: data.ipType,
      country: data.country,
      region: data.region,
      asn: data.asn,
      riskScore: data.riskScore,
      isBlacklisted: data.isBlacklisted ?? false,
      blacklistSource: data.blacklistSource ?? null,
      lastEvaluatedAt: data.lastEvaluatedAt,
    },
  });
}
