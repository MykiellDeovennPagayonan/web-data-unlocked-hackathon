import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DevicesController } from './devices/devices.controller';
import { IpRecordsController } from './ip-records/ip-records.controller';
import { DevicesService } from './devices/devices.service';
import { DeviceSignalsService } from './device-signals/device-signals.service';
import { IpRecordsService } from './ip-records/ip-records.service';
import { DevicesRepository } from './devices/devices.repository';
import { DeviceSignalsRepository } from './device-signals/device-signals.repository';
import { IpRecordsRepository } from './ip-records/ip-records.repository';

@Module({
  controllers: [DevicesController, IpRecordsController],
  providers: [
    PrismaService,
    DevicesService,
    DeviceSignalsService,
    IpRecordsService,
    DevicesRepository,
    DeviceSignalsRepository,
    IpRecordsRepository,
  ],
  exports: [DevicesService, DeviceSignalsService, IpRecordsService],
})
export class DeviceIntelligenceModule {}
