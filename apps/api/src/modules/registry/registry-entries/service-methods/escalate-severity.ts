import { RegistryEntriesRepository } from '../registry-entries.repository';
import { AuditLogsService } from '../../../compliance/audit-logs/audit-logs.service';
import { RegistryEntry } from '../entities/registry-entry.entity';
import { RegistrySeverity, AuditActorType } from '../../../../generated/client';

export async function escalateSeverity(
  repository: RegistryEntriesRepository,
  auditLogsService: AuditLogsService,
  id: string,
): Promise<RegistryEntry> {
  const entry = await repository.findById(id);
  if (!entry) {
    throw new Error(`Registry entry not found: ${id}`);
  }

  const nextSeverity: Record<RegistrySeverity, RegistrySeverity> = {
    [RegistrySeverity.yellow_soft]: RegistrySeverity.orange_watch,
    [RegistrySeverity.orange_watch]: RegistrySeverity.red_hard,
    [RegistrySeverity.red_hard]: RegistrySeverity.red_hard,
  };

  const updated = await repository.update(id, {
    severity: nextSeverity[entry.severity],
  });

  await auditLogsService.logAction({
    actorType: AuditActorType.system,
    actorId: 'system',
    action: 'registry_entry_severity_escalated',
    targetType: 'registry_entry',
    targetId: id,
    oldValue: { severity: entry.severity },
    newValue: { severity: updated.severity },
  });

  return updated;
}
