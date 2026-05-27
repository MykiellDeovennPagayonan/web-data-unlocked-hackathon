import { ApiKeysRepository } from '../api-keys.repository';
import { AuditLogsService } from '../../../compliance/audit-logs/audit-logs.service';
import { AuditActorType } from '../../../../generated/client';
import { ApiKey } from '../entities/api-key.entity';

export async function revokeApiKey(
  repository: ApiKeysRepository,
  auditLogsService: AuditLogsService,
  id: string,
): Promise<ApiKey> {
  const old = await repository.update(id, { revokedAt: new Date() });

  await auditLogsService.logAction({
    actorType: AuditActorType.system,
    actorId: 'system',
    action: 'api_key_revoked',
    targetType: 'api_key',
    targetId: id,
    oldValue: { revokedAt: null },
    newValue: { revokedAt: old.revokedAt },
  });

  return old;
}
