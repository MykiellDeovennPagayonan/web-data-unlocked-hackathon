import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { insertDevice } from './repository-ops/insert-device';
import { findDeviceById } from './repository-ops/find-device-by-id';
import { findDeviceByStableHash } from './repository-ops/find-device-by-stable-hash';
import { updateDevice } from './repository-ops/update-device';
import {
  CreateDeviceData,
  Device,
  UpdateDeviceData,
} from './entities/device.entity';

@Injectable()
export class DevicesRepository {
  constructor(private readonly prisma: PrismaService) {}

  insert = (data: CreateDeviceData): Promise<Device> =>
    insertDevice(this.prisma, data);

  findById = (id: string): Promise<Device | null> =>
    findDeviceById(this.prisma, id);

  findByStableHash = (stableHash: string): Promise<Device | null> =>
    findDeviceByStableHash(this.prisma, stableHash);

  update = (id: string, data: UpdateDeviceData): Promise<Device> =>
    updateDevice(this.prisma, id, data);
}
