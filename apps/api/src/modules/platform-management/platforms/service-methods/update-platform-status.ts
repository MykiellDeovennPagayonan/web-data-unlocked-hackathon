import { PlatformStatus } from '../../../../generated/enums';
import { PlatformsRepository } from '../platforms.repository';
import { AuditLogsService } from '../../../compliance/audit-logs/audit-logs.service';
import { AuditActorType } from '../../../../generated/client';
import { Platform } from '../entities/platform.entity';

export async function updatePlatformStatus(
  repository: PlatformsRepository,
  auditLogsService: AuditLogsService,
  id: string,
  status: PlatformStatus,
): Promise<Platform> {
  const old = await repository.findById(id);
  if (!old) {
    throw new Error(`Platform not found: ${id}`);
  }

  const updated = await repository.update(id, { status });

  await auditLogsService.logAction({
    actorType: AuditActorType.system,
    actorId: 'system',
    action: 'platform_status_updated',
    targetType: 'platform',
    targetId: id,
    oldValue: { status: old.status },
    newValue: { status: updated.status },
  });

  return updated;
}
