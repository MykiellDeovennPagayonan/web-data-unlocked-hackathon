import { PrismaService } from '../../../../prisma/prisma.service';
import { TrustSignal } from '../entities/trust-signal.entity';
import { EntityType } from '../../../../generated/client';

export async function findActiveSignalsByEntity(
  prisma: PrismaService,
  entityType: EntityType,
  entityId: string,
): Promise<TrustSignal[]> {
  const now = new Date();
  const where =
    entityType === 'identity'
      ? { identityId: entityId, entityType }
      : { orgId: entityId, entityType };

  return prisma.trustSignal.findMany({
    where: {
      ...where,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
    orderBy: { createdAt: 'desc' },
  });
}
