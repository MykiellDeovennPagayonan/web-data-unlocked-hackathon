import { Injectable } from '@nestjs/common';
import { ConsentRecordsRepository } from './consent-records.repository';
import { recordConsent } from './service-methods/record-consent';
import { revokeConsent } from './service-methods/revoke-consent';
import { listConsentByIdentity } from './service-methods/list-consent-by-identity';
import { checkActiveConsent } from './service-methods/check-active-consent';
import {
  ConsentRecord,
  CreateConsentRecordData,
  ConsentRecordFilters,
} from './entities/consent-record.entity';
import { ConsentType } from '../../../generated/client';

@Injectable()
export class ConsentRecordsService {
  constructor(private readonly repository: ConsentRecordsRepository) {}

  recordConsent = (input: CreateConsentRecordData): Promise<ConsentRecord> =>
    recordConsent(this.repository, input);

  revokeConsent = (id: string): Promise<ConsentRecord> =>
    revokeConsent(this.repository, id);

  listConsentByIdentity = (
    filters: ConsentRecordFilters,
  ): Promise<ConsentRecord[]> =>
    listConsentByIdentity(this.repository, filters);

  checkActiveConsent = (
    identityId: string,
    platformId: string,
    consentType: ConsentType,
  ): Promise<ConsentRecord | null> =>
    checkActiveConsent(this.repository, identityId, platformId, consentType);
}
