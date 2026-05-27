import { IpRecordsRepository } from '../ip-records.repository';
import { IpRecord } from '../entities/ip-record.entity';
import { createOrUpdateIp } from './create-or-update-ip';

export async function getIpIntelligence(
  repository: IpRecordsRepository,
  ipAddress: string,
): Promise<IpRecord> {
  return createOrUpdateIp(repository, ipAddress);
}
