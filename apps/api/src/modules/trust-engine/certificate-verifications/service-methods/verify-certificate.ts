import { CertificateVerificationsRepository } from '../certificate-verifications.repository';
import { TrustCertificatesRepository } from '../../trust-certificates/trust-certificates.repository';
import { CertificateVerification } from '../entities/certificate-verification.entity';
import { CertificateVerificationVerdict } from '../../../../generated/client';

export async function verifyCertificate(
  verificationRepo: CertificateVerificationsRepository,
  certificateRepo: TrustCertificatesRepository,
  certificateId: string,
  verifiedByPlatformId: string,
): Promise<CertificateVerification> {
  const cert = await certificateRepo.findById(certificateId);

  let verdict: CertificateVerificationVerdict;
  if (!cert) {
    verdict = CertificateVerificationVerdict.not_found;
  } else if (cert.status === 'revoked') {
    verdict = CertificateVerificationVerdict.revoked;
  } else if (cert.expiresAt && cert.expiresAt < new Date()) {
    verdict = CertificateVerificationVerdict.expired;
  } else {
    verdict = CertificateVerificationVerdict.valid;
  }

  return verificationRepo.insert({
    certificateId,
    verifiedByPlatformId,
    verdict,
  });
}
