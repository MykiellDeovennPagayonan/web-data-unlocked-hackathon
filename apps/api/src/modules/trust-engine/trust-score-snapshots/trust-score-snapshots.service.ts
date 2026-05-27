import { Injectable } from '@nestjs/common';
import { TrustScoreSnapshotsRepository } from './trust-score-snapshots.repository';
import { createSnapshot } from './service-methods/create-snapshot';
import { getSnapshotsByEntity } from './service-methods/get-snapshots-by-entity';
import {
  TrustScoreSnapshot,
  CreateTrustScoreSnapshotData,
} from './entities/trust-score-snapshot.entity';
import { EntityType } from '../../../generated/client';

@Injectable()
export class TrustScoreSnapshotsService {
  constructor(private readonly repository: TrustScoreSnapshotsRepository) {}

  createSnapshot = (
    input: CreateTrustScoreSnapshotData,
  ): Promise<TrustScoreSnapshot> => createSnapshot(this.repository, input);

  getSnapshotsByEntity = (
    entityType: EntityType,
    entityId: string,
  ): Promise<TrustScoreSnapshot[]> =>
    getSnapshotsByEntity(this.repository, entityType, entityId);
}
