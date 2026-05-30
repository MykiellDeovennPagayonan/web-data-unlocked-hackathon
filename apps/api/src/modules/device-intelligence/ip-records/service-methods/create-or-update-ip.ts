import { IpRecordsRepository } from '../ip-records.repository';
import { IpRecord } from '../entities/ip-record.entity';
import { classifyIp } from './classify-ip';

export async function createOrUpdateIp(
  repository: IpRecordsRepository,
  ipAddress: string,
): Promise<IpRecord> {
  const existing = await repository.findByAddress(ipAddress);
  const classification = classifyIp(ipAddress);

  if (existing) {
    return repository.update(existing.id, {
      ipType: classification.ipType,
      riskScore: existing.isBlacklisted
        ? Number(existing.riskScore)
        : classification.riskScore,
      lastEvaluatedAt: new Date(),
    });
  }

  return repository.insert({
    ipAddress,
    ipType: classification.ipType,
    country: classification.country,
    region: classification.region,
    asn: classification.asn,
    riskScore: classification.riskScore,
    lastEvaluatedAt: new Date(),
  });
}
