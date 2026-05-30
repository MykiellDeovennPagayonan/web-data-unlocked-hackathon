import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ComplianceModule } from '../compliance/compliance.module';
import { EntityAliasesModule } from '../identity/entity-aliases/entity-aliases.module';
import { TrustEngineModule } from '../trust-engine/trust-engine.module';
import { DevicesController } from './devices/devices.controller';
import { IpRecordsController } from './ip-records/ip-records.controller';
import { DevicesService } from './devices/devices.service';
import { DeviceSignalsService } from './device-signals/device-signals.service';
import { IpRecordsService } from './ip-records/ip-records.service';
import { DevicesRepository } from './devices/devices.repository';
import { DeviceSignalsRepository } from './device-signals/device-signals.repository';
import { IpRecordsRepository } from './ip-records/ip-records.repository';

@Module({
  imports: [ComplianceModule, EntityAliasesModule, TrustEngineModule],
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
