import { Logger } from '@nestjs/common';
import type Redis from 'ioredis';
import { TrustSignalsService } from '../../../trust-engine/trust-signals/trust-signals.service';
import {
  EntityType,
  SignalType,
  SignalSource,
} from '../../../../generated/client';

const API_VELOCITY_WINDOW_SECONDS = 60;
const API_VELOCITY_THRESHOLD = 40;

const logger = new Logger('IdentityApiVelocity');

export interface IdentityApiVelocityResult {
  identityId: string;
  requestCount: number;
  thresholdExceeded: boolean;
  trustSignalCreated?: boolean;
}

export async function trackIdentityApiVelocity(
  redis: Redis,
  trustSignalsService: TrustSignalsService,
  identityId: string,
): Promise<IdentityApiVelocityResult> {
  const key = `identity_api_velocity:${identityId}`;

  logger.log(
    `[TRACK] Tracking API velocity for identity ${identityId.slice(0, 8)}...`,
  );

  let count: number;
  try {
    const results = await redis
      .multi()
      .incr(key)
      .expire(key, API_VELOCITY_WINDOW_SECONDS)
      .exec();

    if (!results) {
      count = 1;
    } else {
      const incrResult = results[0];
      count = incrResult ? (incrResult[1] as number) : 1;
    }
    logger.log(`[COUNT] Identity ${identityId.slice(0, 8)}... count: ${count}`);
  } catch (err) {
    logger.error(`[REDIS ERROR] Failed to increment velocity counter: ${err}`);
    count = 1;
  }

  const thresholdExceeded = count >= API_VELOCITY_THRESHOLD;
  let trustSignalCreated = false;

  logger.log(
    `[CHECK] Count: ${count}, Threshold: ${API_VELOCITY_THRESHOLD}, Exceeded: ${thresholdExceeded}`,
  );

  if (thresholdExceeded) {
    // Create trust signal for every 10 calls over the threshold
    // So 10 calls = -5, 20 calls = -10, 30 calls = -15, etc.
    const previousThresholdCrossed = Math.floor(
      (count - 1) / API_VELOCITY_THRESHOLD,
    );
    const currentThresholdCrossed = Math.floor(count / API_VELOCITY_THRESHOLD);

    logger.log(
      `[THRESHOLD] Previous: ${previousThresholdCrossed}, Current: ${currentThresholdCrossed}`,
    );

    if (currentThresholdCrossed > previousThresholdCrossed) {
      // New threshold crossed - create trust signal
      const weight = -1 * currentThresholdCrossed;

      logger.log(
        `[SIGNAL] Creating trust signal with weight ${weight} for identity ${identityId.slice(0, 8)}...`,
      );

      try {
        await trustSignalsService.createTrustSignal({
          entityType: EntityType.identity,
          identityId,
          signalType: SignalType.behavioral_flag,
          weight,
          source: SignalSource.behavioral,
          referenceId: `api_velocity:${count}:${Date.now()}`,
        });

        trustSignalCreated = true;

        logger.warn(
          `[VELOCITY ALERT] Identity ${identityId.slice(0, 8)}...: ` +
            `${count} API calls in ${API_VELOCITY_WINDOW_SECONDS}s ` +
            `exceeded threshold ${currentThresholdCrossed}. ` +
            `Trust signal created with weight ${weight}.`,
        );
      } catch (signalErr) {
        logger.error(
          `[SIGNAL ERROR] Failed to create trust signal: ${signalErr}`,
        );
      }
    } else {
      logger.log(
        `[SKIP] Already signaled for threshold ${currentThresholdCrossed}`,
      );
    }
  }

  logger.log(
    `[RESULT] Identity ${identityId.slice(0, 8)}...: count=${count}, exceeded=${thresholdExceeded}, signalCreated=${trustSignalCreated}`,
  );

  return {
    identityId,
    requestCount: count,
    thresholdExceeded,
    trustSignalCreated,
  };
}
