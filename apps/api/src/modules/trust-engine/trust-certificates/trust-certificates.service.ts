import { Injectable } from '@nestjs/common';
import { TrustCertificatesRepository } from './trust-certificates.repository';
import {
  issueCertificate,
  IssueCertificateInput,
} from './service-methods/issue-certificate';
import { revokeCertificate } from './service-methods/revoke-certificate';
import { getCertificatesByEntity } from './service-methods/get-certificates-by-entity';
import { TrustCertificate } from './entities/trust-certificate.entity';
import { EntityType } from '../../../generated/client';

@Injectable()
export class TrustCertificatesService {
  constructor(private readonly repository: TrustCertificatesRepository) {}

  issueCertificate = (
    input: IssueCertificateInput,
  ): Promise<TrustCertificate> => issueCertificate(this.repository, input);

  revokeCertificate = (id: string, reason: string): Promise<TrustCertificate> =>
    revokeCertificate(this.repository, id, reason);

  getCertificatesByEntity = (
    entityType: EntityType,
    entityId: string,
  ): Promise<TrustCertificate[]> =>
    getCertificatesByEntity(this.repository, entityType, entityId);
}
