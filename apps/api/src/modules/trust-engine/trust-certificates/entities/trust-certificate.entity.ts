import {
  TrustCertificate as PrismaTrustCertificate,
  EntityType,
  CertificateStatus,
} from '../../../../generated/client';

export type TrustCertificate = PrismaTrustCertificate;

export interface CreateTrustCertificateData {
  entityType: EntityType;
  identityId?: string;
  orgId?: string;
  expiresAt: Date;
  status: CertificateStatus;
  certificateHash: string;
  blockchainTxHash: string;
  issuingCheckId: string;
}

export interface RevokeCertificateData {
  status: CertificateStatus;
  revocationReason: string;
}
