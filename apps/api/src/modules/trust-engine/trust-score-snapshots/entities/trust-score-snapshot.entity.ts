import {
  TrustScoreSnapshot as PrismaTrustScoreSnapshot,
  EntityType,
  SnapshotReason,
} from '../../../../generated/client';

export type TrustScoreSnapshot = PrismaTrustScoreSnapshot;

export interface CreateTrustScoreSnapshotData {
  entityType: EntityType;
  identityId?: string;
  orgId?: string;
  score: number;
  snapshotReason: SnapshotReason;
  referenceId: string;
}
