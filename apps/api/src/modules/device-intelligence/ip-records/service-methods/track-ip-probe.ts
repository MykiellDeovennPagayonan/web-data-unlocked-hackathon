import type Redis from 'ioredis';
import { IpRecordsRepository } from '../ip-records.repository';

const PROBE_WINDOW_SECONDS = 10;
const PROBE_THRESHOLD = 5;

export interface ProbeResult {
  ipAddress: string;
  uniqueEndpoints: number;
  thresholdExceeded: boolean;
  isBlacklisted: boolean;
}

export async function trackIpProbe(
  repository: IpRecordsRepository,
  redis: Redis,
  ipAddress: string,
  endpointSignature: string,
): Promise<ProbeResult> {
  const key = `ip_probe:${ipAddress}`;

  await redis
    .multi()
    .sadd(key, endpointSignature)
    .expire(key, PROBE_WINDOW_SECONDS)
    .exec()
    .catch(() => {});

  const uniqueEndpoints = await redis.scard(key).catch(() => 1);

  const thresholdExceeded = uniqueEndpoints >= PROBE_THRESHOLD;

  if (thresholdExceeded) {
    const existing = await repository.findByAddress(ipAddress);
    if (existing && !existing.isBlacklisted) {
      console.warn(
        `[TrustLayer IP Intelligence] Blacklisting IP ${ipAddress}:` +
          ` ${uniqueEndpoints} unique endpoints in ${PROBE_WINDOW_SECONDS}s` +
          ` exceeded threshold of ${PROBE_THRESHOLD}.` +
          ` Source: behavioral:endpoint_probe`,
      );
      await repository.update(existing.id, {
        isBlacklisted: true,
        blacklistSource: 'behavioral:endpoint_probe',
        riskScore: 95,
        lastEvaluatedAt: new Date(),
      });
    }
  }

  const record = await repository.findByAddress(ipAddress);

  return {
    ipAddress,
    uniqueEndpoints,
    thresholdExceeded,
    isBlacklisted: record?.isBlacklisted ?? false,
  };
}
