import { Inject, Injectable, Logger } from '@nestjs/common';
import type Redis from 'ioredis';
import { AccessEventsRepository } from './access-events.repository';
import { TrustSignalsService } from '../../trust-engine/trust-signals/trust-signals.service';
import { REDIS_CLIENT } from '../../../config/redis.module';
import { recordAccessEvent } from './service-methods/record-access-event';
import { getPlatformEvents } from './service-methods/get-platform-events';
import {
  evaluateAccess,
  AccessContext,
  EvaluationResult,
} from './service-methods/evaluate-access';
import {
  trackIdentityApiVelocity,
  IdentityApiVelocityResult,
} from './service-methods/track-identity-api-velocity';
import {
  AccessEvent,
  CreateAccessEventData,
} from './entities/access-event.entity';
import { EntityType, AccessEventType } from '../../../generated/client';

@Injectable()
export class AccessEventsService {
  private readonly logger = new Logger(AccessEventsService.name);

  constructor(
    private readonly repository: AccessEventsRepository,
    private readonly trustSignalsService: TrustSignalsService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async recordAccessEvent(data: CreateAccessEventData): Promise<AccessEvent> {
    this.logger.log(
      `[RECORD] Recording access event: type=${data.eventType}, identityId=${data.identityId?.slice(0, 8)}...`,
    );

    const event = await recordAccessEvent(this.repository, data);

    // Track API velocity for identity-based behavioral analysis
    if (data.eventType === AccessEventType.api_call && data.identityId) {
      this.logger.log(
        `[VELOCITY CHECK] Triggering velocity tracking for identity ${data.identityId.slice(0, 8)}...`,
      );
      const result = await this.trackIdentityApiVelocity(data.identityId);
      this.logger.log(
        `[VELOCITY RESULT] count=${result.requestCount}, exceeded=${result.thresholdExceeded}, signalCreated=${result.trustSignalCreated}`,
      );
    } else {
      this.logger.log(
        `[VELOCITY SKIP] eventType=${data.eventType}, hasIdentity=${!!data.identityId}`,
      );
    }

    return event;
  }

  trackIdentityApiVelocity(
    identityId: string,
  ): Promise<IdentityApiVelocityResult> {
    return trackIdentityApiVelocity(
      this.redis,
      this.trustSignalsService,
      identityId,
    );
  }

  getPlatformEvents = (
    platformId: string,
    take?: number,
  ): Promise<AccessEvent[]> =>
    getPlatformEvents(this.repository, platformId, take);

  evaluateAccess = (ctx: AccessContext): EvaluationResult =>
    evaluateAccess(ctx);

  async computeTrustScore(identityId: string): Promise<number> {
    const result = await this.trustSignalsService.computeTrustScore(
      EntityType.identity,
      identityId,
    );
    return result.score;
  }
}
