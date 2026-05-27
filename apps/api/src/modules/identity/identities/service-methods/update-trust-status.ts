import { IdentitiesRepository } from '../identities.repository';
import { AuditLogsService } from '../../../compliance/audit-logs/audit-logs.service';
import { AuditActorType } from '../../../../generated/client';
import { Identity, UpdateIdentityData } from '../entities/identity.entity';

export async function updateTrustStatus(
  repository: IdentitiesRepository,
  auditLogsService: AuditLogsService,
  id: string,
  status: UpdateIdentityData['trustStatus'],
): Promise<Identity> {
  const old = await repository.findById(id);
  if (!old) {
    throw new Error(`Identity not found: ${id}`);
  }

  const updated = await repository.update(id, { trustStatus: status });

  await auditLogsService.logAction({
    actorType: AuditActorType.system,
    actorId: 'system',
    action: 'identity_trust_status_updated',
    targetType: 'identity',
    targetId: id,
    oldValue: { trustStatus: old.trustStatus },
    newValue: { trustStatus: updated.trustStatus },
  });

  return updated;
}
