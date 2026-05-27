import { PlatformUsersRepository } from '../platform-users.repository';
import { AuditLogsService } from '../../../compliance/audit-logs/audit-logs.service';
import { AuditActorType } from '../../../../generated/client';
import {
  PlatformUser,
  UpdatePlatformUserData,
} from '../entities/platform-user.entity';

export async function updatePlatformUserStatus(
  repository: PlatformUsersRepository,
  auditLogsService: AuditLogsService,
  id: string,
  status: UpdatePlatformUserData['statusOnPlatform'],
): Promise<PlatformUser> {
  const old = await repository.findById(id);
  if (!old) {
    throw new Error(`Platform user not found: ${id}`);
  }

  const updated = await repository.update(id, { statusOnPlatform: status });

  await auditLogsService.logAction({
    actorType: AuditActorType.system,
    actorId: 'system',
    action: 'platform_user_status_updated',
    targetType: 'platform_user',
    targetId: id,
    oldValue: { statusOnPlatform: old.statusOnPlatform },
    newValue: { statusOnPlatform: updated.statusOnPlatform },
  });

  return updated;
}
