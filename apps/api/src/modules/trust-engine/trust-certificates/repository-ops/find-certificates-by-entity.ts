import { PrismaService } from '../../../../prisma/prisma.service';
import { TrustCertificate } from '../entities/trust-certificate.entity';
import { EntityType } from '../../../../generated/client';

export async function findCertificatesByEntity(
  prisma: PrismaService,
  entityType: EntityType,
  entityId: string,
): Promise<TrustCertificate[]> {
  const where =
    entityType === 'identity'
      ? { identityId: entityId, entityType }
      : { orgId: entityId, entityType };

  return prisma.trustCertificate.findMany({
    where,
    orderBy: { issuedAt: 'desc' },
  });
}
