import { PrismaService } from '../../../../prisma/prisma.service';
import { ConsentRecord } from '../entities/consent-record.entity';

export async function revokeConsent(
  prisma: PrismaService,
  id: string,
): Promise<ConsentRecord> {
  return prisma.consentRecord.update({
    where: { id },
    data: {
      revokedAt: new Date(),
    },
  });
}
