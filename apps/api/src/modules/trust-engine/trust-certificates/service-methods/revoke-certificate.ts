import { TrustCertificatesRepository } from '../trust-certificates.repository';
import { TrustCertificate } from '../entities/trust-certificate.entity';
import { CertificateStatus } from '../../../../generated/client';

export async function revokeCertificate(
  repository: TrustCertificatesRepository,
  id: string,
  reason: string,
): Promise<TrustCertificate> {
  return repository.update(id, {
    status: CertificateStatus.revoked,
    revocationReason: reason,
  });
}
