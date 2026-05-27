import { RegistryTargetsRepository } from '../registry-targets.repository';
import { AuditLogsService } from '../../../compliance/audit-logs/audit-logs.service';
import { AuditActorType } from '../../../../generated/client';
import {
  RegistryTarget,
  CreateRegistryTargetData,
} from '../entities/registry-target.entity';

export async function createTarget(
  repository: RegistryTargetsRepository,
  auditLogsService: AuditLogsService,
  input: CreateRegistryTargetData,
): Promise<RegistryTarget> {
  const target = await repository.insert(input);

  await auditLogsService.logAction({
    actorType: AuditActorType.system,
    actorId: 'system',
    action: 'registry_target_created',
    targetType: 'registry_target',
    targetId: target.id,
    newValue: {
      registryEntryId: target.registryEntryId,
      targetType: target.targetType,
    },
  });

  return target;
}
