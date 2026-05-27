import { OrganizationsRepository } from '../organizations.repository';
import { AuditLogsService } from '../../../compliance/audit-logs/audit-logs.service';
import { AuditActorType } from '../../../../generated/client';
import {
  Organization,
  UpdateOrganizationData,
} from '../entities/organization.entity';

export async function updateTrustStatus(
  repository: OrganizationsRepository,
  auditLogsService: AuditLogsService,
  id: string,
  status: UpdateOrganizationData['trustStatus'],
): Promise<Organization> {
  const old = await repository.findById(id);
  if (!old) {
    throw new Error(`Organization not found: ${id}`);
  }

  const updated = await repository.update(id, { trustStatus: status });

  await auditLogsService.logAction({
    actorType: AuditActorType.system,
    actorId: 'system',
    action: 'organization_trust_status_updated',
    targetType: 'organization',
    targetId: id,
    oldValue: { trustStatus: old.trustStatus },
    newValue: { trustStatus: updated.trustStatus },
  });

  return updated;
}
