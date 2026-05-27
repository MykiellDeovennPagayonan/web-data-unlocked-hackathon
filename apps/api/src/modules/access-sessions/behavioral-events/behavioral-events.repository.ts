import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { insertBehavioralEvent } from './repository-ops/insert-behavioral-event';
import { findBehavioralEventsBySession } from './repository-ops/find-behavioral-events-by-session';
import {
  BehavioralEvent,
  CreateBehavioralEventData,
} from './entities/behavioral-event.entity';

@Injectable()
export class BehavioralEventsRepository {
  constructor(private readonly prisma: PrismaService) {}

  insert = (data: CreateBehavioralEventData): Promise<BehavioralEvent> =>
    insertBehavioralEvent(this.prisma, data);

  findBySession = (sessionId: string): Promise<BehavioralEvent[]> =>
    findBehavioralEventsBySession(this.prisma, sessionId);
}
