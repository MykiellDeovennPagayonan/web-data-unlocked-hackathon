import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { insertIpRecord } from './repository-ops/insert-ip-record';
import { findIpByAddress } from './repository-ops/find-ip-by-address';
import { findManyIpRecords } from './repository-ops/find-many-ip-records';
import { updateIpRecord } from './repository-ops/update-ip-record';
import {
  CreateIpRecordData,
  IpRecord,
  UpdateIpRecordData,
} from './entities/ip-record.entity';

@Injectable()
export class IpRecordsRepository {
  constructor(private readonly prisma: PrismaService) {}

  insert = (data: CreateIpRecordData): Promise<IpRecord> =>
    insertIpRecord(this.prisma, data);

  findByAddress = (ipAddress: string): Promise<IpRecord | null> =>
    findIpByAddress(this.prisma, ipAddress);

  findMany = (take?: number, skip?: number): Promise<IpRecord[]> =>
    findManyIpRecords(this.prisma, take, skip);

  update = (id: string, data: UpdateIpRecordData): Promise<IpRecord> =>
    updateIpRecord(this.prisma, id, data);
}
