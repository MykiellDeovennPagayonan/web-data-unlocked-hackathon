import {
  CertificateVerification as PrismaCertificateVerification,
  CertificateVerificationVerdict,
} from '../../../../generated/client';

export type CertificateVerification = PrismaCertificateVerification;

export interface CreateCertificateVerificationData {
  certificateId: string;
  verifiedByPlatformId: string;
  verdict: CertificateVerificationVerdict;
}
