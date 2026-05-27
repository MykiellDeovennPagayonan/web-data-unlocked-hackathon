import { TrustScoreSnapshotsRepository } from '../trust-score-snapshots.repository';
import { TrustScoreSnapshot } from '../entities/trust-score-snapshot.entity';
import { EntityType } from '../../../../generated/client';

export async function getSnapshotsByEntity(
  repository: TrustScoreSnapshotsRepository,
  entityType: EntityType,
  entityId: string,
): Promise<TrustScoreSnapshot[]> {
  return repository.findByEntity(entityType, entityId);
}
