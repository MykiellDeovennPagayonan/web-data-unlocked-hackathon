import { PlatformsRepository } from '../platforms.repository';
import { AuditLogsService } from '../../../compliance/audit-logs/audit-logs.service';
import { AuditActorType } from '../../../../generated/client';
import { CreatePlatformData, Platform } from '../entities/platform.entity';

export async function createPlatform(
  repository: PlatformsRepository,
  auditLogsService: AuditLogsService,
  input: CreatePlatformData,
): Promise<Platform> {
  const platform = await repository.insert(input);

  await auditLogsService.logAction({
    actorType: AuditActorType.system,
    actorId: 'system',
    action: 'platform_created',
    targetType: 'platform',
    targetId: platform.id,
    newValue: {
      name: platform.name,
      domain: platform.domain,
      status: platform.status,
    },
  });

  return platform;
}
