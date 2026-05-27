import { PrismaService } from '../../../../prisma/prisma.service';
import { ConsentRecord } from '../entities/consent-record.entity';

export function findConsentById(
  prisma: PrismaService,
  id: string,
): Promise<ConsentRecord | null> {
  return prisma.consentRecord.findUnique({
    where: { id },
  });
}
