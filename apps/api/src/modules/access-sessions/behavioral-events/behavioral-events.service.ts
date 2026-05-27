import { Injectable } from '@nestjs/common';
import { BehavioralEventsRepository } from './behavioral-events.repository';
import { logBehavioralEvent } from './service-methods/log-behavioral-event';
import { getSessionEvents } from './service-methods/get-session-events';
import {
  BehavioralEvent,
  CreateBehavioralEventData,
} from './entities/behavioral-event.entity';

@Injectable()
export class BehavioralEventsService {
  constructor(private readonly repository: BehavioralEventsRepository) {}

  logBehavioralEvent = (
    data: CreateBehavioralEventData,
  ): Promise<BehavioralEvent> => logBehavioralEvent(this.repository, data);

  getSessionEvents = (sessionId: string): Promise<BehavioralEvent[]> =>
    getSessionEvents(this.repository, sessionId);
}
