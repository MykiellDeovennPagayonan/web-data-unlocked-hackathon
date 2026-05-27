import { TrustCertificatesRepository } from '../trust-certificates.repository';
import { AuditLogsService } from '../../../compliance/audit-logs/audit-logs.service';
import { TrustCertificate } from '../entities/trust-certificate.entity';
import {
  CertificateStatus,
  AuditActorType,
} from '../../../../generated/client';

export async function revokeCertificate(
  repository: TrustCertificatesRepository,
  auditLogsService: AuditLogsService,
  id: string,
  reason: string,
): Promise<TrustCertificate> {
  const old = await repository.findById(id);
  if (!old) {
    throw new Error(`Trust certificate not found: ${id}`);
  }

  const updated = await repository.update(id, {
    status: CertificateStatus.revoked,
    revocationReason: reason,
  });

  await auditLogsService.logAction({
    actorType: AuditActorType.system,
    actorId: 'system',
    action: 'certificate_revoked',
    targetType: 'trust_certificate',
    targetId: id,
    oldValue: { status: old.status, revocationReason: old.revocationReason },
    newValue: { status: CertificateStatus.revoked, revocationReason: reason },
  });

  return updated;
}
