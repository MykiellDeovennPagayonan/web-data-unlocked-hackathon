import { ConsentRecordsRepository } from '../consent-records.repository';
import { ConsentRecord } from '../entities/consent-record.entity';
import { ConsentType } from '../../../../generated/client';

export async function checkActiveConsent(
  repository: ConsentRecordsRepository,
  identityId: string,
  platformId: string,
  consentType: ConsentType,
): Promise<ConsentRecord | null> {
  return repository.findActiveConsent(identityId, platformId, consentType);
}
