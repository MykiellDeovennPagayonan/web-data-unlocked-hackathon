import { PrismaService } from '../../../../prisma/prisma.service';
import { TrustScoreSnapshot } from '../entities/trust-score-snapshot.entity';
import { EntityType } from '../../../../generated/client';

export async function findSnapshotsByEntity(
  prisma: PrismaService,
  entityType: EntityType,
  entityId: string,
  limit = 50,
): Promise<TrustScoreSnapshot[]> {
  const where =
    entityType === 'identity'
      ? { identityId: entityId, entityType }
      : { orgId: entityId, entityType };

  return prisma.trustScoreSnapshot.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}
