import { TrustCertificatesRepository } from '../trust-certificates.repository';
import { TrustCertificate } from '../entities/trust-certificate.entity';
import { CertificateStatus, EntityType } from '../../../../generated/client';
import { randomUUID } from 'crypto';

export interface IssueCertificateInput {
  entityType: EntityType;
  identityId?: string;
  orgId?: string;
  issuingCheckId: string;
  validDays?: number;
}

// MOCK — Replace with real blockchain anchoring
function mockBlockchainAnchor(hash: string): string {
  return `0xMOCK_TX_${hash.substring(0, 8)}`;
}

export async function issueCertificate(
  repository: TrustCertificatesRepository,
  input: IssueCertificateInput,
): Promise<TrustCertificate> {
  const certificateHash = randomUUID();
  const blockchainTxHash = mockBlockchainAnchor(certificateHash);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (input.validDays ?? 90));

  return repository.insert({
    entityType: input.entityType,
    identityId: input.identityId,
    orgId: input.orgId,
    expiresAt,
    status: CertificateStatus.active,
    certificateHash,
    blockchainTxHash,
    issuingCheckId: input.issuingCheckId,
  });
}
