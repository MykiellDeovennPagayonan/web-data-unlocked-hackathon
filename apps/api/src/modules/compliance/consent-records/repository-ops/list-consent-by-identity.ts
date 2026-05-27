import { PrismaService } from '../../../../prisma/prisma.service';
import {
  ConsentRecord,
  ConsentRecordFilters,
} from '../entities/consent-record.entity';

export async function listConsentByIdentity(
  prisma: PrismaService,
  filters: ConsentRecordFilters,
): Promise<ConsentRecord[]> {
  return prisma.consentRecord.findMany({
    where: {
      identityId: filters.identityId,
      platformId: filters.platformId,
      consentType: filters.consentType,
    },
    take: filters.limit ?? 50,
    skip: filters.offset ?? 0,
    orderBy: { acceptedAt: 'desc' },
  });
}
