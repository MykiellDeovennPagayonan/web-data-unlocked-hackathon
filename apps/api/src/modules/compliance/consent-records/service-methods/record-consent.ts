import { ConsentRecordsRepository } from '../consent-records.repository';
import {
  ConsentRecord,
  CreateConsentRecordData,
} from '../entities/consent-record.entity';

export async function recordConsent(
  repository: ConsentRecordsRepository,
  input: CreateConsentRecordData,
): Promise<ConsentRecord> {
  return repository.insert(input);
}
