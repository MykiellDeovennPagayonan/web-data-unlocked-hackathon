import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { insertDeviceSignals } from './repository-ops/insert-device-signals';
import { findSignalsByDevice } from './repository-ops/find-signals-by-device';
import {
  CreateDeviceSignalData,
  DeviceSignal,
} from './entities/device-signal.entity';

@Injectable()
export class DeviceSignalsRepository {
  constructor(private readonly prisma: PrismaService) {}

  insertMany = (signals: CreateDeviceSignalData[]): Promise<DeviceSignal[]> =>
    insertDeviceSignals(this.prisma, signals);

  findByDevice = (deviceId: string): Promise<DeviceSignal[]> =>
    findSignalsByDevice(this.prisma, deviceId);
}
