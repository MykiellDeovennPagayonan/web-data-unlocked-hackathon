import {
  ConsentRecord as PrismaConsentRecord,
  ConsentType,
} from '../../../../generated/client';

export type ConsentRecord = PrismaConsentRecord;

export interface CreateConsentRecordData {
  identityId: string;
  platformId: string;
  consentType: ConsentType;
  consentVersion: string;
  ipAtConsent: string;
}

export interface ConsentRecordFilters {
  identityId?: string;
  platformId?: string;
  consentType?: ConsentType;
  limit?: number;
  offset?: number;
}
