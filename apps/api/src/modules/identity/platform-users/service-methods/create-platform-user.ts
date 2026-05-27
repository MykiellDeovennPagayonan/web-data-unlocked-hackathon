import { PlatformUsersRepository } from '../platform-users.repository';
import { AuditLogsService } from '../../../compliance/audit-logs/audit-logs.service';
import { AuditActorType } from '../../../../generated/client';
import {
  CreatePlatformUserData,
  PlatformUser,
} from '../entities/platform-user.entity';

export async function createPlatformUser(
  repository: PlatformUsersRepository,
  auditLogsService: AuditLogsService,
  input: CreatePlatformUserData,
): Promise<PlatformUser> {
  const existing = await repository.findByExternalId(
    input.platformId,
    input.externalUserId,
  );
  if (existing) {
    throw new Error('Platform user already exists');
  }
  const user = await repository.insert(input);

  await auditLogsService.logAction({
    actorType: AuditActorType.system,
    actorId: 'system',
    action: 'platform_user_created',
    targetType: 'platform_user',
    targetId: user.id,
    newValue: {
      platformId: user.platformId,
      externalUserId: user.externalUserId,
      statusOnPlatform: user.statusOnPlatform,
    },
  });

  return user;
}
