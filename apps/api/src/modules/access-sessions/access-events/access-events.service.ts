import { Injectable } from '@nestjs/common';
import { AccessEventsRepository } from './access-events.repository';
import { recordAccessEvent } from './service-methods/record-access-event';
import { getPlatformEvents } from './service-methods/get-platform-events';
import {
  evaluateAccess,
  AccessContext,
  EvaluationResult,
} from './service-methods/evaluate-access';
import {
  AccessEvent,
  CreateAccessEventData,
} from './entities/access-event.entity';

@Injectable()
export class AccessEventsService {
  constructor(private readonly repository: AccessEventsRepository) {}

  recordAccessEvent = (data: CreateAccessEventData): Promise<AccessEvent> =>
    recordAccessEvent(this.repository, data);

  getPlatformEvents = (
    platformId: string,
    take?: number,
  ): Promise<AccessEvent[]> =>
    getPlatformEvents(this.repository, platformId, take);

  evaluateAccess = (ctx: AccessContext): EvaluationResult =>
    evaluateAccess(ctx);
}
