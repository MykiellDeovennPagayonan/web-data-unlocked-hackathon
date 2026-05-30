import { TrustCertificatesRepository } from '../trust-certificates.repository';
import { CertificateVerificationsRepository } from '../../certificate-verifications/certificate-verifications.repository';
import { PrismaService } from '../../../../prisma/prisma.service';
import { TrustCertificate } from '../entities/trust-certificate.entity';
import {
  CertificateVerificationVerdict,
  CertificateStatus,
  EntityType,
} from '../../../../generated/client';

export interface VerifyCertificateByHashResult {
  valid: boolean;
  verdict: CertificateVerificationVerdict;
  entityType?: EntityType;
  entityId?: string;
  certificate?: TrustCertificate;
}

export async function verifyCertificateByHash(
  trustCertRepo: TrustCertificatesRepository,
  verificationRepo: CertificateVerificationsRepository,
  prisma: PrismaService,
  hash: string,
  verifiedByPlatformId: string,
): Promise<VerifyCertificateByHashResult> {
  const cert = await trustCertRepo.findByHash(hash);

  if (!cert) {
    return {
      valid: false,
      verdict: CertificateVerificationVerdict.not_found,
    };
  }

  let verdict: CertificateVerificationVerdict;

  if (cert.status === CertificateStatus.revoked) {
    verdict = CertificateVerificationVerdict.revoked;
  } else if (cert.expiresAt && new Date(cert.expiresAt) < new Date()) {
    verdict = CertificateVerificationVerdict.expired;
  } else {
    // Check entity trust status
    if (cert.entityType === EntityType.identity && cert.identityId) {
      const identity = await prisma.identity.findUnique({
        where: { id: cert.identityId },
      });
      if (!identity || !identity.isHumanVerified) {
        verdict = CertificateVerificationVerdict.not_found;
      } else {
        verdict = CertificateVerificationVerdict.valid;
      }
    } else if (cert.entityType === EntityType.organization && cert.orgId) {
      const org = await prisma.organization.findUnique({
        where: { id: cert.orgId },
      });
      if (
        !org ||
        (org.trustStatus !== 'verified' && org.trustStatus !== 'clean')
      ) {
        verdict = CertificateVerificationVerdict.not_found;
      } else {
        verdict = CertificateVerificationVerdict.valid;
      }
    } else {
      verdict = CertificateVerificationVerdict.not_found;
    }
  }

  // Always log the verification attempt
  await verificationRepo.insert({
    certificateId: cert.id,
    verifiedByPlatformId,
    verdict,
  });

  return {
    valid: verdict === CertificateVerificationVerdict.valid,
    verdict,
    entityType: cert.entityType,
    entityId: cert.identityId ?? cert.orgId ?? undefined,
    certificate: cert,
  };
}
