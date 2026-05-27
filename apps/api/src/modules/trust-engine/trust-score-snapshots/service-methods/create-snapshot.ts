import { TrustScoreSnapshotsRepository } from '../trust-score-snapshots.repository';
import {
  TrustScoreSnapshot,
  CreateTrustScoreSnapshotData,
} from '../entities/trust-score-snapshot.entity';

export async function createSnapshot(
  repository: TrustScoreSnapshotsRepository,
  input: CreateTrustScoreSnapshotData,
): Promise<TrustScoreSnapshot> {
  return repository.insert(input);
}
