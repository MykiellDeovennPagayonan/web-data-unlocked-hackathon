import { StrictnessLevel } from '../../../../generated/client';
import { PlatformsRepository } from '../platforms.repository';
import { AuditLogsService } from '../../../compliance/audit-logs/audit-logs.service';
import { AuditActorType } from '../../../../generated/client';
import { Platform } from '../entities/platform.entity';

export async function updateStrictnessLevel(
  repository: PlatformsRepository,
  auditLogsService: AuditLogsService,
  id: string,
  strictnessLevel: StrictnessLevel,
): Promise<Platform> {
  const old = await repository.findById(id);
  if (!old) {
    throw new Error(`Platform not found: ${id}`);
  }

  const updated = await repository.update(id, { strictnessLevel });

  await auditLogsService.logAction({
    actorType: AuditActorType.system,
    actorId: 'system',
    action: 'platform_strictness_updated',
    targetType: 'platform',
    targetId: id,
    oldValue: { strictnessLevel: old.strictnessLevel },
    newValue: { strictnessLevel: updated.strictnessLevel },
  });

  return updated;
}
