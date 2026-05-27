import { ConsentRecordsRepository } from '../consent-records.repository';
import { ConsentRecord } from '../entities/consent-record.entity';

export async function revokeConsent(
  repository: ConsentRecordsRepository,
  id: string,
): Promise<ConsentRecord> {
  return repository.revoke(id);
}
