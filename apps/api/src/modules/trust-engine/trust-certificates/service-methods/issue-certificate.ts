import { TrustCertificatesRepository } from '../trust-certificates.repository';
import { AuditLogsService } from '../../../compliance/audit-logs/audit-logs.service';
import { TrustCertificate } from '../entities/trust-certificate.entity';
import {
  CertificateStatus,
  EntityType,
  AuditActorType,
} from '../../../../generated/client';
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
  auditLogsService: AuditLogsService,
  input: IssueCertificateInput,
): Promise<TrustCertificate> {
  const certificateHash = randomUUID();
  const blockchainTxHash = mockBlockchainAnchor(certificateHash);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (input.validDays ?? 90));

  const certificate = await repository.insert({
    entityType: input.entityType,
    identityId: input.identityId,
    orgId: input.orgId,
    expiresAt,
    status: CertificateStatus.active,
    certificateHash,
    blockchainTxHash,
    issuingCheckId: input.issuingCheckId,
  });

  await auditLogsService.logAction({
    actorType: AuditActorType.system,
    actorId: 'system',
    action: 'certificate_issued',
    targetType: 'trust_certificate',
    targetId: certificate.id,
    newValue: {
      entityType: input.entityType,
      identityId: input.identityId,
      orgId: input.orgId,
      status: CertificateStatus.active,
    },
  });

  return certificate;
}
