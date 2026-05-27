import { CertificateVerificationsRepository } from '../certificate-verifications.repository';
import { CertificateVerification } from '../entities/certificate-verification.entity';

export async function getVerificationsByCertificate(
  repository: CertificateVerificationsRepository,
  certificateId: string,
): Promise<CertificateVerification[]> {
  return repository.findByCertificate(certificateId);
}
