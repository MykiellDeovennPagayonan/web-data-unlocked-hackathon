import { RegistryEntriesRepository } from '../registry-entries.repository';
import { AuditLogsService } from '../../../compliance/audit-logs/audit-logs.service';
import { AuditActorType } from '../../../../generated/client';
import {
  RegistryEntry,
  CreateRegistryEntryData,
} from '../entities/registry-entry.entity';

export async function createEntry(
  repository: RegistryEntriesRepository,
  auditLogsService: AuditLogsService,
  input: CreateRegistryEntryData,
): Promise<RegistryEntry> {
  const entry = await repository.insert(input);

  await auditLogsService.logAction({
    actorType: AuditActorType.system,
    actorId: 'system',
    action: 'registry_entry_created',
    targetType: 'registry_entry',
    targetId: entry.id,
    newValue: {
      listType: entry.listType,
      severity: entry.severity,
      sourceType: entry.sourceType,
    },
  });

  return entry;
}
