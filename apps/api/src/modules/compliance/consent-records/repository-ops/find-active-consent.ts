import { PrismaService } from '../../../../prisma/prisma.service';
import { ConsentRecord } from '../entities/consent-record.entity';
import { ConsentType } from '../../../../generated/client';

export async function findActiveConsent(
  prisma: PrismaService,
  identityId: string,
  platformId: string,
  consentType: ConsentType,
): Promise<ConsentRecord | null> {
  return prisma.consentRecord.findFirst({
    where: {
      identityId,
      platformId,
      consentType,
      revokedAt: null,
    },
    orderBy: { acceptedAt: 'desc' },
  });
}
