import { TrustSignalsRepository } from '../trust-signals.repository';
import { EntityType } from '../../../../generated/client';

export interface ComputedTrustScore {
  score: number;
  signalCount: number;
}

export async function computeTrustScore(
  repository: TrustSignalsRepository,
  entityType: EntityType,
  entityId: string,
): Promise<ComputedTrustScore> {
  const signals = await repository.findActiveByEntity(entityType, entityId);

  if (signals.length === 0) {
    return { score: 50, signalCount: 0 };
  }

  const totalWeight = signals.reduce((sum, s) => sum + Number(s.weight), 0);

  // Normalize to 0-100 range: baseline 50, bounded [0, 100]
  const raw = 50 + totalWeight;
  const score = Math.max(0, Math.min(100, raw));

  return { score, signalCount: signals.length };
}
