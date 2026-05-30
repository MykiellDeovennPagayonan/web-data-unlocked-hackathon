import { Inject, Injectable } from '@nestjs/common';
import type Redis from 'ioredis';
import { REDIS_CLIENT } from '../../../config/redis.module';
import { IpRecordsRepository } from './ip-records.repository';
import { getIpIntelligence } from './service-methods/get-ip-intelligence';
import { createOrUpdateIp } from './service-methods/create-or-update-ip';
import {
  trackIpVelocity,
  VelocityResult,
} from './service-methods/track-ip-velocity';
import { trackIpProbe, ProbeResult } from './service-methods/track-ip-probe';
import { IpRecord } from './entities/ip-record.entity';

@Injectable()
export class IpRecordsService {
  constructor(
    private readonly repository: IpRecordsRepository,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  getIpIntelligence = (ipAddress: string): Promise<IpRecord> =>
    getIpIntelligence(this.repository, ipAddress);

  listIpRecords = (take?: number, skip?: number): Promise<IpRecord[]> =>
    this.repository.findMany(take, skip);

  createOrUpdateIp = (ipAddress: string): Promise<IpRecord> =>
    createOrUpdateIp(this.repository, ipAddress);

  trackVelocity = (ipAddress: string): Promise<VelocityResult> =>
    trackIpVelocity(this.repository, this.redis, ipAddress);

  trackProbe = (
    ipAddress: string,
    endpointSignature: string,
  ): Promise<ProbeResult> =>
    trackIpProbe(this.repository, this.redis, ipAddress, endpointSignature);

  unbanIp = (ipAddress: string): Promise<{ count: number }> =>
    this.repository.unbanByAddress(ipAddress);
}
