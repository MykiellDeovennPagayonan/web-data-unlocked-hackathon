import { RegistryEntriesRepository } from '../registry-entries.repository';
import { AuditLogsService } from '../../../compliance/audit-logs/audit-logs.service';
import { AuditActorType } from '../../../../generated/client';
import {
  RegistryEntry,
  UpdateRegistryEntryData,
} from '../entities/registry-entry.entity';

export async function updateEntry(
  repository: RegistryEntriesRepository,
  auditLogsService: AuditLogsService,
  id: string,
  input: UpdateRegistryEntryData,
): Promise<RegistryEntry> {
  const old = await repository.findById(id);
  if (!old) {
    throw new Error(`Registry entry not found: ${id}`);
  }

  const updated = await repository.update(id, input);

  await auditLogsService.logAction({
    actorType: AuditActorType.system,
    actorId: 'system',
    action: 'registry_entry_updated',
    targetType: 'registry_entry',
    targetId: id,
    oldValue: {
      listType: old.listType,
      severity: old.severity,
      isActive: old.isActive,
    },
    newValue: {
      listType: updated.listType,
      severity: updated.severity,
      isActive: updated.isActive,
    },
  });

  return updated;
}
