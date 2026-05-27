import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { insertConsent } from './repository-ops/insert-consent';
import { findActiveConsent } from './repository-ops/find-active-consent';
import { findConsentById } from './repository-ops/find-consent-by-id';
import { listConsentByIdentity } from './repository-ops/list-consent-by-identity';
import { revokeConsent } from './repository-ops/revoke-consent';
import {
  ConsentRecord,
  CreateConsentRecordData,
  ConsentRecordFilters,
} from './entities/consent-record.entity';
import { ConsentType } from '../../../generated/client';

@Injectable()
export class ConsentRecordsRepository {
  constructor(private readonly prisma: PrismaService) {}

  insert = (data: CreateConsentRecordData): Promise<ConsentRecord> =>
    insertConsent(this.prisma, data);

  findActiveConsent = (
    identityId: string,
    platformId: string,
    consentType: ConsentType,
  ): Promise<ConsentRecord | null> =>
    findActiveConsent(this.prisma, identityId, platformId, consentType);

  listByIdentity = (filters: ConsentRecordFilters): Promise<ConsentRecord[]> =>
    listConsentByIdentity(this.prisma, filters);

  findById = (id: string): Promise<ConsentRecord | null> =>
    findConsentById(this.prisma, id);

  revoke = (id: string): Promise<ConsentRecord> =>
    revokeConsent(this.prisma, id);
}
