import { PlatformsRepository } from '../platforms.repository';
import { AuditLogsService } from '../../../compliance/audit-logs/audit-logs.service';
import { AuditActorType } from '../../../../generated/client';
import { Platform, UpdatePlatformData } from '../entities/platform.entity';

export async function updatePlatform(
  repository: PlatformsRepository,
  auditLogsService: AuditLogsService,
  id: string,
  input: UpdatePlatformData,
): Promise<Platform> {
  const old = await repository.findById(id);
  if (!old) {
    throw new Error(`Platform not found: ${id}`);
  }

  const updated = await repository.update(id, input);

  await auditLogsService.logAction({
    actorType: AuditActorType.system,
    actorId: 'system',
    action: 'platform_updated',
    targetType: 'platform',
    targetId: id,
    oldValue: {
      name: old.name,
      domain: old.domain,
      status: old.status,
      strictnessLevel: old.strictnessLevel,
    },
    newValue: {
      name: updated.name,
      domain: updated.domain,
      status: updated.status,
      strictnessLevel: updated.strictnessLevel,
    },
  });

  return updated;
}
