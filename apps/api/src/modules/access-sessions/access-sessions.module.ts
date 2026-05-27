import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DeviceIntelligenceModule } from '../device-intelligence/device-intelligence.module';
import { TrustEngineModule } from '../trust-engine/trust-engine.module';
import { AccessEventsController } from './access-events/access-events.controller';
import { SessionsController } from './sessions/sessions.controller';
import { BehavioralEventsController } from './behavioral-events/behavioral-events.controller';
import { AccessEventsService } from './access-events/access-events.service';
import { SessionsService } from './sessions/sessions.service';
import { BehavioralEventsService } from './behavioral-events/behavioral-events.service';
import { AccessEventsRepository } from './access-events/access-events.repository';
import { SessionsRepository } from './sessions/sessions.repository';
import { BehavioralEventsRepository } from './behavioral-events/behavioral-events.repository';

@Module({
  imports: [DeviceIntelligenceModule, TrustEngineModule],
  controllers: [
    AccessEventsController,
    SessionsController,
    BehavioralEventsController,
  ],
  providers: [
    PrismaService,
    AccessEventsService,
    SessionsService,
    BehavioralEventsService,
    AccessEventsRepository,
    SessionsRepository,
    BehavioralEventsRepository,
  ],
  exports: [AccessEventsService, SessionsService, BehavioralEventsService],
})
export class AccessSessionsModule {}
