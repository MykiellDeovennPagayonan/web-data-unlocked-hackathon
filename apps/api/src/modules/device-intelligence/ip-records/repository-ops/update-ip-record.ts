import { PrismaService } from '../../../../prisma/prisma.service';
import { IpRecord, UpdateIpRecordData } from '../entities/ip-record.entity';

export async function updateIpRecord(
  prisma: PrismaService,
  id: string,
  data: UpdateIpRecordData,
): Promise<IpRecord> {
  return prisma.ipRecord.update({
    where: { id },
    data: {
      ...(data.ipType !== undefined && { ipType: data.ipType }),
      ...(data.country !== undefined && { country: data.country }),
      ...(data.region !== undefined && { region: data.region }),
      ...(data.asn !== undefined && { asn: data.asn }),
      ...(data.riskScore !== undefined && { riskScore: data.riskScore }),
      ...(data.isBlacklisted !== undefined && {
        isBlacklisted: data.isBlacklisted,
      }),
      ...('blacklistSource' in data && {
        blacklistSource: data.blacklistSource,
      }),
      ...(data.lastEvaluatedAt !== undefined && {
        lastEvaluatedAt: data.lastEvaluatedAt,
      }),
    },
  });
}
