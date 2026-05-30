import type Redis from 'ioredis';
import { IpRecordsRepository } from '../ip-records.repository';

const VELOCITY_WINDOW_SECONDS = 60;
const VELOCITY_THRESHOLD = 30;

export interface VelocityResult {
  ipAddress: string;
  requestCount: number;
  thresholdExceeded: boolean;
  isBlacklisted: boolean;
}

export async function trackIpVelocity(
  repository: IpRecordsRepository,
  redis: Redis,
  ipAddress: string,
): Promise<VelocityResult> {
  const key = `ip_velocity:${ipAddress}`;

  const count = await redis
    .multi()
    .incr(key)
    .expire(key, VELOCITY_WINDOW_SECONDS)
    .exec()
    .then((results) => {
      if (!results) return 1;
      const incrResult = results[0];
      return incrResult ? (incrResult[1] as number) : 1;
    })
    .catch(() => 1);

  const thresholdExceeded = count >= VELOCITY_THRESHOLD;

  if (thresholdExceeded) {
    const existing = await repository.findByAddress(ipAddress);
    if (existing && !existing.isBlacklisted) {
      console.warn(
        `[TrustLayer IP Intelligence] Blacklisting IP ${ipAddress}:` +
          ` ${count} requests in ${VELOCITY_WINDOW_SECONDS}s` +
          ` exceeded threshold of ${VELOCITY_THRESHOLD}.` +
          ` Source: behavioral:velocity`,
      );
      await repository.update(existing.id, {
        isBlacklisted: true,
        blacklistSource: 'behavioral:velocity',
        riskScore: 95,
        lastEvaluatedAt: new Date(),
      });
    }
  }

  const record = await repository.findByAddress(ipAddress);

  return {
    ipAddress,
    requestCount: count,
    thresholdExceeded,
    isBlacklisted: record?.isBlacklisted ?? false,
  };
}
