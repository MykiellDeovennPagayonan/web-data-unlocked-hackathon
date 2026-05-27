import { Injectable } from '@nestjs/common';
import { CertificateVerificationsRepository } from './certificate-verifications.repository';
import { TrustCertificatesRepository } from '../trust-certificates/trust-certificates.repository';
import { verifyCertificate } from './service-methods/verify-certificate';
import { getVerificationsByCertificate } from './service-methods/get-verifications-by-certificate';
import { CertificateVerification } from './entities/certificate-verification.entity';

@Injectable()
export class CertificateVerificationsService {
  constructor(
    private readonly repository: CertificateVerificationsRepository,
    private readonly certificatesRepository: TrustCertificatesRepository,
  ) {}

  verifyCertificate = (
    certificateId: string,
    verifiedByPlatformId: string,
  ): Promise<CertificateVerification> =>
    verifyCertificate(
      this.repository,
      this.certificatesRepository,
      certificateId,
      verifiedByPlatformId,
    );

  getVerificationsByCertificate = (
    certificateId: string,
  ): Promise<CertificateVerification[]> =>
    getVerificationsByCertificate(this.repository, certificateId);
}
