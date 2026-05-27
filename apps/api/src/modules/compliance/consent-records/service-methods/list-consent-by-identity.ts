import { ConsentRecordsRepository } from '../consent-records.repository';
import {
  ConsentRecord,
  ConsentRecordFilters,
} from '../entities/consent-record.entity';

export async function listConsentByIdentity(
  repository: ConsentRecordsRepository,
  filters: ConsentRecordFilters,
): Promise<ConsentRecord[]> {
  return repository.listByIdentity(filters);
}
