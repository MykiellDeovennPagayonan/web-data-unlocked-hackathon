import { Injectable } from '@nestjs/common';
import { IpRecordsRepository } from './ip-records.repository';
import { getIpIntelligence } from './service-methods/get-ip-intelligence';
import { createOrUpdateIp } from './service-methods/create-or-update-ip';
import { IpRecord } from './entities/ip-record.entity';

@Injectable()
export class IpRecordsService {
  constructor(private readonly repository: IpRecordsRepository) {}

  getIpIntelligence = (ipAddress: string): Promise<IpRecord> =>
    getIpIntelligence(this.repository, ipAddress);

  createOrUpdateIp = (ipAddress: string): Promise<IpRecord> =>
    createOrUpdateIp(this.repository, ipAddress);
}
