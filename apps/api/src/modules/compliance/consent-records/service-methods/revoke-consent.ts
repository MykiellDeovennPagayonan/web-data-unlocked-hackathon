import { ConsentRecordsRepository } from '../consent-records.repository';
import { AuditLogsService } from '../../audit-logs/audit-logs.service';
import { AuditActorType } from '../../../../generated/client';
import { ConsentRecord } from '../entities/consent-record.entity';

export async function revokeConsent(
  repository: ConsentRecordsRepository,
  auditLogsService: AuditLogsService,
  id: string,
): Promise<ConsentRecord> {
  const old = await repository.findById(id);
  if (!old) {
    throw new Error(`Consent record not found: ${id}`);
  }

  const revoked = await repository.revoke(id);

  await auditLogsService.logAction({
    actorType: AuditActorType.system,
    actorId: 'system',
    action: 'consent_revoked',
    targetType: 'consent_record',
    targetId: id,
    oldValue: { revokedAt: old.revokedAt },
    newValue: { revokedAt: revoked.revokedAt },
  });

  return revoked;
}
