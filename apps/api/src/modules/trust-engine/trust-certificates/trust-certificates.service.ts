import { Injectable } from '@nestjs/common';
import { AuditLogsService } from '../../compliance/audit-logs/audit-logs.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { TrustCertificatesRepository } from './trust-certificates.repository';
import { CertificateVerificationsRepository } from '../certificate-verifications/certificate-verifications.repository';
import {
  issueCertificate,
  IssueCertificateInput,
} from './service-methods/issue-certificate';
import { revokeCertificate } from './service-methods/revoke-certificate';
import { getCertificatesByEntity } from './service-methods/get-certificates-by-entity';
import {
  verifyCertificateByHash,
  VerifyCertificateByHashResult,
} from './service-methods/verify-certificate-by-hash';
import { TrustCertificate } from './entities/trust-certificate.entity';
import { EntityType } from '../../../generated/client';

@Injectable()
export class TrustCertificatesService {
  constructor(
    private readonly repository: TrustCertificatesRepository,
    private readonly auditLogsService: AuditLogsService,
    private readonly verificationRepo: CertificateVerificationsRepository,
    private readonly prisma: PrismaService,
  ) {}

  issueCertificate = (
    input: IssueCertificateInput,
  ): Promise<TrustCertificate> =>
    issueCertificate(this.repository, this.auditLogsService, input);

  revokeCertificate = (id: string, reason: string): Promise<TrustCertificate> =>
    revokeCertificate(this.repository, this.auditLogsService, id, reason);

  getCertificatesByEntity = (
    entityType: EntityType,
    entityId: string,
  ): Promise<TrustCertificate[]> =>
    getCertificatesByEntity(this.repository, entityType, entityId);

  verifyByHash = (
    hash: string,
    verifiedByPlatformId: string,
  ): Promise<VerifyCertificateByHashResult> =>
    verifyCertificateByHash(
      this.repository,
      this.verificationRepo,
      this.prisma,
      hash,
      verifiedByPlatformId,
    );
}
