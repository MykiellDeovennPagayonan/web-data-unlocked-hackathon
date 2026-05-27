import { PrismaService } from '../../../../prisma/prisma.service';
import {
  TrustScoreSnapshot,
  CreateTrustScoreSnapshotData,
} from '../entities/trust-score-snapshot.entity';

export async function insertSnapshot(
  prisma: PrismaService,
  data: CreateTrustScoreSnapshotData,
): Promise<TrustScoreSnapshot> {
  return prisma.trustScoreSnapshot.create({
    data: {
      entityType: data.entityType,
      identityId: data.identityId,
      orgId: data.orgId,
      score: data.score,
      snapshotReason: data.snapshotReason,
      referenceId: data.referenceId,
    },
  });
}
