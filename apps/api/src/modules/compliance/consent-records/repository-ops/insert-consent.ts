import { PrismaService } from '../../../../prisma/prisma.service';
import {
  ConsentRecord,
  CreateConsentRecordData,
} from '../entities/consent-record.entity';

export async function insertConsent(
  prisma: PrismaService,
  data: CreateConsentRecordData,
): Promise<ConsentRecord> {
  return prisma.consentRecord.create({
    data: {
      identityId: data.identityId,
      platformId: data.platformId,
      consentType: data.consentType,
      consentVersion: data.consentVersion,
      ipAtConsent: data.ipAtConsent,
      acceptedAt: new Date(),
    },
  });
}
